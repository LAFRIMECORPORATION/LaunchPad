// ============================================================
// LAUNCHPAD FRONTEND — src/utils/api.js
// Client HTTP centralisé — Version Sécurisée Anti-Boucle & Anti-Doublon
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let accessToken = null;
let refreshPromise = null; // 🛡️ Permet de mutualiser les requêtes de refresh simultanées au rechargement (F5)

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

// ── Helper fetch avec gestion auto du token ───────────────
async function fetchWithAuth(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  // Si aucun Content-Type n'est défini et qu'on n'envoie pas un FormData, on met du JSON par défaut
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include", // Pour les cookies
  });

  // ── Refresh automatique si token expiré (401) ──────────────
  if (response.status === 401) {
    // On attend la résolution du refresh (qu'il soit déjà en cours ou initié ici)
    const refreshed = await tryRefreshToken();

    if (refreshed && accessToken) {
      // Relancer la requête originale avec le nouveau token tout neuf
      headers["Authorization"] = `Bearer ${accessToken}`;
      return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      // Si le rafraîchissement échoue définitivement, déconnexion propre
      handleForceLogout();
    }
  }

  return response;
}

// ── Tenter de rafraîchir le token ─────────────────────────
async function tryRefreshToken() {
  // Si un rafraîchissement est déjà lancé par une autre requête, on s'accroche à sa promesse
  if (refreshPromise) {
    return refreshPromise;
  }

  // Sinon, on crée la promesse unique de rafraîchissement
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("launchpad_refresh_token");
      if (!refreshToken) return false;

      const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();

      // On s'assure d'extraire le token peu importe le nesting de ton contrôleur (data.data ou data direct)
      const newAccessToken = data?.data?.accessToken || data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;

      if (newAccessToken) {
        setAccessToken(newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("launchpad_refresh_token", newRefreshToken);
        } else {
          // Si le backend ne renvoie pas de nouveau refresh, on garde l'ancien intact
          localStorage.setItem("launchpad_refresh_token", refreshToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return false;
    }
  })();

  // Une fois la promesse terminée, on récupère le résultat et on libère le verrou
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

// ── Déconnexion forcée propre en cas de token corrompu ──
function handleForceLogout() {
  clearAccessToken();
  localStorage.removeItem("launchpad_refresh_token");
  if (
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/register"
  ) {
    window.location.href = "/login";
  }
}

// ── Parser la réponse et lever une erreur si nécessaire ──
async function parseResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Une erreur est survenue.");
    error.code = data?.error;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ══════════════════════════════════════════════════════════
// MÉTHODES HTTP
// ══════════════════════════════════════════════════════════

export const api = {
  async get(url, params = {}) {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
      ),
    ).toString();
    const fullUrl = query ? `${url}?${query}` : url;
    const response = await fetchWithAuth(fullUrl, { method: "GET" });
    return parseResponse(response);
  },

  async post(url, body = {}) {
    const response = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async put(url, body = {}) {
    const response = await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async delete(url, body = undefined) {
    const options = { method: "DELETE" };
    if (body !== undefined) options.body = JSON.stringify(body);
    const response = await fetchWithAuth(url, options);
    return parseResponse(response);
  },

  // ✅ Nouvelle méthode dédiée pour l'envoi transparent de formulaires de fichiers (FormData)
  async postFormData(url, formData) {
    const response = await fetchWithAuth(url, {
      method: "POST",
      body: formData, // Le navigateur injecte automatiquement le bon Content-Type + Boundary !
    });
    return parseResponse(response);
  },

  async upload(url, file, fieldName = "file", extraFields = {}) {
    const formData = new FormData();
    if (file) formData.append(fieldName, file);
    Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));

    const headers = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    return parseResponse(response);
  },
};

// ══════════════════════════════════════════════════════════
// SERVICES PAR MODULE
// ══════════════════════════════════════════════════════════

// ── AUTH ─────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout").finally(() => handleForceLogout()),
  refresh: (refreshToken) => api.post("/auth/refresh-token", { refreshToken }),
  me: () => api.get("/auth/me"),
};

export const usersApi = {
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  uploadAvatar: (id, file) => api.upload(`/users/${id}/avatar`, file, "avatar"),
};

export const kycApi = {
  getStatus: () => api.get("/kyc/status"),
  // ✅ Corrigé pour utiliser la nouvelle méthode postFormData
  submit: (formData) => api.postFormData("/kyc/submit", formData),
  getPending: (params) => api.get("/admin/kyc/pending", params),
  approve: (userId) => api.put(`/admin/kyc/${userId}/approve`),
  reject: (userId, reason) =>
    api.put(`/admin/kyc/${userId}/reject`, { reason }),
  requestDocs: (userId, docs) =>
    api.post(`/admin/kyc/${userId}/request-docs`, { docs }),
};

export const projectsApi = {
  list: (params) => api.get("/projects", params),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  publish: (id) => api.post(`/projects/${id}/publish`),
  like: (id) => api.post(`/projects/${id}/like`),
  save: (id) => api.post(`/projects/${id}/save`),
  comment: (id, content) => api.post(`/projects/${id}/comments`, { content }),
  reply: (id, content, parentId) => api.post(`/projects/${id}/comments`, { content, parentId }),
  similar: (id) => api.get(`/projects/${id}/similar`),
  approve: (id, note) => api.put(`/admin/projects/${id}/approve`, { note }),
  reject: (id, reason) => api.put(`/admin/projects/${id}/reject`, { reason }),
  getPending: (params) => api.get("/admin/projects/pending", params),

  // 🚀 CORRECTION INJECTÉE : Utilisation propre de postFormData pour l'image de couverture
  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    return api.postFormData(`/projects/${id}/cover`, formData);
  },
};

export const commentsApi = {
  like: (projectId, commentId) =>
    api.post(`/projects/${projectId}/comments/${commentId}/like`),
};

export const messagesApi = {
  getConversations: () => api.get("/conversations"),
  getConversation: (id) => api.get(`/conversations/${id}`),
  getMessages: (convId, p) => api.get(`/conversations/${convId}/messages`, p),
  createDirect: (targetUserId) =>
    api.post("/conversations/direct", { targetUserId }),
  sendMessage: (convId, text) =>
    api.post("/messages", { conversationId: convId, content: text }),
  send: (convId, text) =>
    api.post("/messages", { conversationId: convId, content: text }),
  getUnreadCount: () => api.get("/messages/unread-count"),
  markRead: (convId) => api.post(`/conversations/${convId}/read`),
};

export const paymentsApi = {
  initMtn: (data) => api.post("/payments/mtn/init", data),
  initOrange: (data) => api.post("/payments/orange/init", data),
  initStripe: (data) => api.post("/payments/stripe/init", data),
  getStatus: (id) => api.get(`/payments/${id}/status`),
  list: (page) => api.get("/investments", { page: page || 1 }),
  getOne: (id) => api.get(`/investments/${id}`),
  getInvestments: (params) => api.get("/investments", params),
  getInvestment: (id) => api.get(`/investments/${id}`),
};

export const notificationsApi = {
  getAll: (params) => api.get("/notifications", params),
  unreadCount: () => api.get("/notifications/unread-count"),
  markAllRead: () => api.put("/notifications/mark-all-read"),
  markOneRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
  subscribe: (sub) => api.post("/notifications/push/subscribe", sub),
};

export const forumApi = {
  getPosts: (params) => api.get("/forum/posts", params),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (data) => api.post("/forum/posts", data),
  updatePost: (id, data) => api.put(`/forum/posts/${id}`, data),
  deletePost: (id) => api.delete(`/forum/posts/${id}`),
  like: (id) => api.post(`/forum/posts/${id}/like`),
  reply: (id, content) => api.post(`/forum/posts/${id}/replies`, { content }),
  likeReply: (replyId) => api.post(`/forum/replies/${replyId}/like`),
};

export const appointmentsApi = {
  getAll: (params) => api.get("/appointments", params),
  getOne: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post("/appointments", data),
  confirm: (id) => api.put(`/appointments/${id}/confirm`),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  complete: (id) => api.put(`/appointments/${id}/complete`),
  getSlots: (userId, date) =>
    api.get(`/appointments/availability/${userId}`, date ? { date } : {}),
};

export const dueDiligenceApi = {
  analyze: (projectId) => api.post("/due-diligence/analyze", { projectId }),
  getReport: (projectId) => api.get(`/due-diligence/${projectId}`),
};

export const collaborationsApi = {
  send: (data) => api.post("/collaborations", data),
  inbox: () => api.get("/collaborations/inbox"),
  getOne: (id) => api.get(`/collaborations/${id}`),
  accept: (id) => api.put(`/collaborations/${id}/accept`),
  decline: (id, reason) => api.put(`/collaborations/${id}/decline`, { reason }),
};

export const badgesApi = {
  getMine: () => api.get("/badges/me"),
  getForUser: (userId) => api.get(`/badges/user/${userId}`),
};

export const feedApi = {
  get: (params) => api.get("/feed", params),
};

export const investorRequestsApi = {
  list: (params) => api.get("/investor-requests", params),
  getOne: (id) => api.get(`/investor-requests/${id}`),
  create: (data) => api.post("/investor-requests", data),
  apply: (id, data) => api.post(`/investor-requests/${id}/apply`, data),
  mine: () => api.get("/investor-requests/mine"),
  update: (id, data) => api.put(`/investor-requests/${id}`, data),
  remove: (id) => api.delete(`/investor-requests/${id}`),
};

export const adminApi = {
  getStats: () => api.get("/admin/statistics"),
  getUsers: (params) => api.get("/admin/users", params),
  toggleUserStatus: (id, reason) =>
    api.put(`/admin/users/${id}/toggle-status`, { reason }),
  deleteUser: (id, reason) =>
    api.delete(`/admin/users/${id}`, { reason }),
  getProjects: (params) => api.get("/admin/projects", params),
  approveProject: (id, notes) =>
    api.put(`/admin/projects/${id}/approve`, { notes }),
  rejectProject: (id, reason) =>
    api.put(`/admin/projects/${id}/reject`, { reason }),
  deleteProject: (id, reason) =>
    api.delete(`/admin/projects/${id}`, { reason }),
  getAuditLogs: (params) => api.get("/admin/audit-logs", params),
  getInvestments: (params) => api.get("/admin/investments", params),
};
