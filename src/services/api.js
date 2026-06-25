const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'launchpad_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Client HTTP central — toutes les requêtes API passent par ici.
 */
export async function apiFetch(path, options = {}) {
  const { auth = true, body, headers = {}, ...rest } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const message = data?.message || `Erreur HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  register(payload) {
    return apiFetch('/auth/register', { method: 'POST', body: payload, auth: false });
  },

  login(payload) {
    return apiFetch('/auth/login', { method: 'POST', body: payload, auth: false });
  },

  me() {
    return apiFetch('/auth/me');
  },

  logout() {
    return apiFetch('/auth/logout', { method: 'POST' });
  },
};
