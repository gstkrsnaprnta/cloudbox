const API_URL =
  import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

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
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke KloudBox API. Pastikan backend berjalan di localhost:5000.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "KloudBox API request failed.");
  }

  return data;
}
