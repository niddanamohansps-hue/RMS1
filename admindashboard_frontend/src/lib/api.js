const BASE_URL = "http://localhost:8000/api";

const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// Silently refresh the access token using the stored refresh token.
// Returns the new access token, or null if refresh failed.
let _isRefreshing = false;
let _refreshSubscribers = [];

const notifySubscribers = (token) => {
  _refreshSubscribers.forEach(cb => cb(token));
  _refreshSubscribers = [];
};

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access) {
      localStorage.setItem("access_token", data.access);
      // If the backend rotates refresh tokens, update it too
      if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
};

// Central response handler with auto-refresh + single retry on 401
const handleResponse = async (res, retryFn) => {
  if (res.status === 401) {
    // Token expired — try to refresh once
    if (!_isRefreshing) {
      _isRefreshing = true;
      const newToken = await refreshAccessToken();
      _isRefreshing = false;
      if (newToken) {
        notifySubscribers(newToken);
        // Retry the original request with the new token
        const retried = await retryFn(newToken);
        return handleResponseRaw(retried);
      } else {
        // Refresh failed — clear session and force re-login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      // Another request is already refreshing — queue this one
      return new Promise((resolve, reject) => {
        _refreshSubscribers.push(async (newToken) => {
          try {
            const retried = await retryFn(newToken);
            resolve(handleResponseRaw(retried));
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }
  return handleResponseRaw(res);
};

const handleResponseRaw = async (res) => {
  if (!res.ok) {
    let errMsg = "";
    try {
      const data = await res.json();
      errMsg = data.detail || JSON.stringify(data);
    } catch {
      errMsg = await res.text() || res.statusText;
    }
    throw new Error(errMsg);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });
    return handleResponse(res, (token) =>
      fetch(`${BASE_URL}${endpoint}`, {
        headers: { ...getHeaders(), Authorization: `Bearer ${token}` },
      })
    );
  },

  post: async (endpoint, data, isMultipart = false) => {
    const doFetch = (token) => {
      const headers = getHeaders();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (isMultipart) delete headers["Content-Type"];
      return fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: isMultipart ? data : JSON.stringify(data),
      });
    };
    const res = await doFetch(null);
    return handleResponse(res, doFetch);
  },

  patch: async (endpoint, data, isMultipart = false) => {
    const doFetch = (token) => {
      const headers = getHeaders();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (isMultipart) delete headers["Content-Type"];
      return fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers,
        body: isMultipart ? data : JSON.stringify(data),
      });
    };
    const res = await doFetch(null);
    return handleResponse(res, doFetch);
  },

  put: async (endpoint, data, isMultipart = false) => {
    const doFetch = (token) => {
      const headers = getHeaders();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (isMultipart) delete headers["Content-Type"];
      return fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: isMultipart ? data : JSON.stringify(data),
      });
    };
    const res = await doFetch(null);
    return handleResponse(res, doFetch);
  },

  delete: async (endpoint) => {
    const doFetch = (token) =>
      fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: { ...getHeaders(), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
    const res = await doFetch(null);
    return handleResponse(res, doFetch);
  },
};
