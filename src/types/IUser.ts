import { isRol, type Rol } from "./Rol";

/** Un registro de la "tabla" de usuarios → localStorage["users"] (IUser[]) */
export interface IUser {
  email: string;
  password: string;
  role: Rol;
}

/** La sesión activa → localStorage["userData"]. Nunca lleva la contraseña. */
export interface ISession extends Omit<IUser, "password"> {
  loggedIn: true;
}

// ---------- Type guards (validación en runtime) ----------

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isUser = (value: unknown): value is IUser =>
  isObject(value) &&
  typeof value.email === "string" &&
  typeof value.password === "string" &&
  isRol(value.role);

export const isSession = (value: unknown): value is ISession =>
  isObject(value) &&
  typeof value.email === "string" &&
  isRol(value.role) &&
  value.loggedIn === true;