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
      return fetch(`${BASE_URL}${url}`, { ...options, headers, credentials: "include" });
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
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
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
  if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
    window.location.href = "/login";
  }
}

// ── Parser la réponse et lever une erreur si nécessaire ──
async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Une erreur est survenue.");
    error.code   = data.error;
    error.status = response.status;
    error.data   = data;
    throw error;
  }

  return data;
}

// ══════════════════════════════════════════════════════════
// MÉTHODES HTTP
// ══════════════════════════════════════════════════════════

export const api = {
  async get(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullUrl = query ? `${url}?${query}` : url;
    const response = await fetchWithAuth(fullUrl, { method: "GET" });
    return parseResponse(response);
  },

  async post(url, body = {}) {
    const response = await fetchWithAuth(url, {
      method:  "POST",
      body:    JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async put(url, body = {}) {
    const response = await fetchWithAuth(url, {
      method:  "PUT",
      body:    JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async delete(url) {
    const response = await fetchWithAuth(url, { method: "DELETE" });
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
      method:      "POST",
      headers,
      body:        formData,
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
  register: (data)          => api.post("/auth/register", data),
  login:    (data)          => api.post("/auth/login", data),
  logout:   ()              => api.post("/auth/logout").finally(() => handleForceLogout()),
  refresh:  (refreshToken)  => api.post("/auth/refresh-token", { refreshToken }),
  me:       ()              => api.get("/auth/me"),
};

export const usersApi = {
  getById:      (id)         => api.get(`/users/${id}`),
  update:       (id, data)   => api.put(`/users/${id}`, data),
  uploadAvatar: (id, file)   => api.upload(`/users/${id}/avatar`, file, "avatar"),
};

export const kycApi = {
  getStatus:     ()          => api.get("/kyc/status"),
  // ✅ Corrigé pour utiliser la nouvelle méthode postFormData
  submit:        (formData)  => api.postFormData("/kyc/submit", formData),
  getPending:    (params)    => api.get("/admin/kyc/pending", params),
  approve:       (userId)    => api.put(`/admin/kyc/${userId}/approve`),
  reject:        (userId, reason) => api.put(`/admin/kyc/${userId}/reject`, { reason }),
  requestDocs:   (userId, docs)   => api.post(`/admin/kyc/${userId}/request-docs`, { docs }),
};

export const projectsApi = {
  list:        (params)       => api.get("/projects", params),
  getById:     (id)           => api.get(`/projects/${id}`),
  create:      (data)         => api.post("/projects", data),
  update:      (id, data)     => api.put(`/projects/${id}`, data),
  delete:      (id)           => api.delete(`/projects/${id}`),
  publish:     (id)           => api.post(`/projects/${id}/publish`),
  like:        (id)           => api.post(`/projects/${id}/like`),
  save:        (id)           => api.post(`/projects/${id}/save`),
  comment:     (id, content)  => api.post(`/projects/${id}/comments`, { content }),
  similar:     (id)           => api.get(`/projects/${id}/similar`),
  approve:     (id, note)     => api.put(`/admin/projects/${id}/approve`, { note }),
  reject:      (id, reason)   => api.put(`/admin/projects/${id}/reject`, { reason }),
};

export const messagesApi = {
  getConversations:   ()              => api.get("/conversations"),
  getConversation:    (id)            => api.get(`/conversations/${id}`),
  getMessages:        (convId, p)     => api.get(`/conversations/${convId}/messages`, p),
  createDirect:       (targetUserId)  => api.post("/conversations/direct", { targetUserId }),
  sendMessage:        (convId, text)  => api.post("/messages", { conversationId: convId, content: text }),
};

export const paymentsApi = {
  initStripe:    (data) => api.post("/payments/stripe/init", data),
  initMtn:       (data) => api.post("/payments/mtn/init", data),
  initOrange:    (data) => api.post("/payments/orange/init", data),
  getStatus:     (id)   => api.get(`/payments/${id}/status`),
  getInvestments:()     => api.get("/investments"),
};

export const notificationsApi = {
  getAll:       (params) => api.get("/notifications", params),
  markAllRead:  ()       => api.put("/notifications/mark-all-read"),
  delete:       (id)     => api.delete(`/notifications/${id}`),
  subscribe:    (sub)    => api.post("/notifications/push/subscribe", sub),
};

export const forumApi = {
  getPosts:    (params)        => api.get("/forum/posts", params),
  getPost:     (id)            => api.get(`/forum/posts/${id}`),
  createPost:  (data)          => api.post("/forum/posts", data),
  like:        (id)            => api.post(`/forum/posts/${id}/like`),
  reply:       (id, content)   => api.post(`/forum/posts/${id}/replies`, { content }),
};

export const appointmentsApi = {
  getAll:       ()           => api.get("/appointments"),
  create:       (data)       => api.post("/appointments", data),
  update:       (id, data)   => api.put(`/appointments/${id}`, data),
  cancel:       (id)         => api.delete(`/appointments/${id}`),
  getSlots:     (userId)     => api.get(`/availability/${userId}`),
};

export const dueDiligenceApi = {
  analyze:    (projectId)  => api.post("/due-diligence/analyze", { projectId }),
  getReport:  (projectId)  => api.get(`/due-diligence/${projectId}`),
};

export const adminApi = {
  getStats:    ()      => api.get("/admin/statistics"),
  getUsers:    (p)     => api.get("/admin/users", p),
  getProjects: (p)     => api.get("/admin/projects", p),
};