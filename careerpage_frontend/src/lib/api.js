const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api"
    : "https://rms1-1-suhq.onrender.com/api";

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
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
  if (res.status === 204) {
    return null;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  post: async (endpoint, data, isMultipart = false) => {
    const headers = getHeaders();
    if (isMultipart) {
      delete headers["Content-Type"];
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isMultipart ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },

  patch: async (endpoint, data, isMultipart = false) => {
    const headers = getHeaders();
    if (isMultipart) {
      delete headers["Content-Type"];
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: isMultipart ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },

  put: async (endpoint, data, isMultipart = false) => {
    const headers = getHeaders();
    if (isMultipart) {
      delete headers["Content-Type"];
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: isMultipart ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
