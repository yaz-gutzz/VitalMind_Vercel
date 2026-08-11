const SESSION_TIMEOUT_MS = 2 * 60 * 1000;

const SESSION_KEYS = {
  token: "authToken",
  authenticated: "isAuthenticated",
  userName: "userName",
  userRole: "userRole",
  lastActivity: "lastActivityAt",
  isAdmin: "isAdmin",
} as const;

export const SESSION_EXPIRED_EVENT = "vitalmind:session-expired";
export { SESSION_TIMEOUT_MS };

export type SessionData = {
  token: string;
  name: string | null;
  role: string | null;
  lastActivity: number;
};

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function readLastActivity(storage: Storage) {
  const value = Number(storage.getItem(SESSION_KEYS.lastActivity));
  return Number.isFinite(value) ? value : 0;
}

function emitSessionExpired() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function touchSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(SESSION_KEYS.lastActivity, String(Date.now()));
}

export function setSession(token: string, userName: string, role?: string) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(SESSION_KEYS.token, token);
  storage.setItem(SESSION_KEYS.authenticated, "true");
  storage.setItem(SESSION_KEYS.userName, userName);
  storage.setItem(SESSION_KEYS.lastActivity, String(Date.now()));

  if (role) {
    storage.setItem(SESSION_KEYS.userRole, role);
    storage.setItem(SESSION_KEYS.isAdmin, role === "admin" ? "true" : "false");
  }
}

export function updateSessionUser(userName: string, role?: string) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(SESSION_KEYS.userName, userName);

  if (role !== undefined) {
    storage.setItem(SESSION_KEYS.userRole, role);
    storage.setItem(SESSION_KEYS.isAdmin, role === "admin" ? "true" : "false");
  }

  touchSession();
}

export function clearSession(options: { notify?: boolean } = {}) {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(SESSION_KEYS.token);
    storage.removeItem(SESSION_KEYS.authenticated);
    storage.removeItem(SESSION_KEYS.userName);
    storage.removeItem(SESSION_KEYS.userRole);
    storage.removeItem(SESSION_KEYS.lastActivity);
    storage.removeItem(SESSION_KEYS.isAdmin);
  }

  if (options.notify) {
    emitSessionExpired();
  }
}

export function getSession(): SessionData | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const token = storage.getItem(SESSION_KEYS.token);
  if (!token) {
    return null;
  }

  const lastActivity = readLastActivity(storage);
  if (lastActivity && Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
    clearSession({ notify: true });
    return null;
  }

  return {
    token,
    name: storage.getItem(SESSION_KEYS.userName),
    role: storage.getItem(SESSION_KEYS.userRole),
    lastActivity: lastActivity || Date.now(),
  };
}

export function isSessionActive() {
  return Boolean(getSession());
}