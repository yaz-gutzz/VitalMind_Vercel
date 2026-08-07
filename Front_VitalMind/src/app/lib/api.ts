const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type RequestOptions = RequestInit & { token?: string | null };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = options.token ?? localStorage.getItem("authToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Error de API";
    throw new Error(message);
  }

  return payload as T;
}

export function setSession(token: string, userName: string, role?: string) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userName", userName);
  if (role) localStorage.setItem("userRole", role);
}

export function clearSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
}

export function getSession() {
  return {
    token: localStorage.getItem("authToken"),
    name: localStorage.getItem("userName"),
    role: localStorage.getItem("userRole"),
  };
}
export function getApiBase() {
  return API_BASE;
}

