import {
  clearSession as clearStoredSession,
  getSession as getStoredSession,
  touchSession,
} from "./session";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type RequestOptions = RequestInit & { token?: string | null };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const session = getStoredSession();
  const token = options.token ?? session?.token ?? null;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    touchSession();
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Error de API";
    if (response.status === 401 || response.status === 403) {
      clearStoredSession({ notify: true });
    }
    throw new Error(message);
  }

  return payload as T;
}

export function setSession(token: string, userName: string, role?: string) {
  clearStoredSession();
  sessionStorage.setItem("authToken", token);
  sessionStorage.setItem("isAuthenticated", "true");
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("lastActivityAt", String(Date.now()));
  if (role) {
    sessionStorage.setItem("userRole", role);
    sessionStorage.setItem("isAdmin", role === "admin" ? "true" : "false");
  }
}

export function clearSession() {
  clearStoredSession();
}

export function getSession() {
  return getStoredSession();
}
export function getApiBase() {
  return API_BASE;
}

