import { isSession, isUser, type ISession, type IUser } from "../types/IUser";

/** Claves de localStorage: un solo lugar, cero strings mágicos repetidos. */
export const STORAGE_KEYS = {
  USERS: "users",
  SESSION: "userData",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ---------- Helpers genéricos (privados al módulo) ----------

/** Lee y parsea JSON. Devuelve `unknown`: quien lo use está obligado a validarlo. */
const readJSON = (key: StorageKey): unknown => {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null; // JSON corrupto (ej: editado a mano en DevTools)
  }
};

const writeJSON = (key: StorageKey, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ---------- "Tabla" de usuarios ----------

export const getUsers = (): IUser[] => {
  const data = readJSON(STORAGE_KEYS.USERS);
  return Array.isArray(data) ? data.filter(isUser) : [];
};

export const saveUsers = (users: IUser[]): void => {
  writeJSON(STORAGE_KEYS.USERS, users);
};

// ---------- Sesión ----------

export const getSession = (): ISession | null => {
  const data = readJSON(STORAGE_KEYS.SESSION);
  return isSession(data) ? data : null;
};

export const saveSession = (session: ISession): void => {
  writeJSON(STORAGE_KEYS.SESSION, session);
};

export const removeSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};