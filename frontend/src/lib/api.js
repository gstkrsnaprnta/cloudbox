const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export function getToken() {
  return localStorage.getItem("cloudbox_token");
}

export function setSession({ token, user }) {
  localStorage.setItem("cloudbox_token", token);
  localStorage.setItem("cloudbox_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("cloudbox_token");
  localStorage.removeItem("cloudbox_user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("cloudbox_user");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
}

export async function api(path, options = {}) {
  const token = getToken();
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke KloudBox API. Pastikan koneksi internet dan server KloudBox aktif.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "KloudBox API request failed.");
  }

  return data;
}
