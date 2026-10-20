import type { ISession, IUser } from "../types/IUser";
import { getUsers, saveSession, saveUsers } from "./localStorage";

/** Resultado tipado: o salió bien (con datos) o salió mal (con un mensaje). */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Lo que el formulario de registro le entrega al servicio. */
export type RegisterInput = Pick<IUser, "email" | "password">;

/** Lo que el formulario de login le entrega al servicio. */
export type LoginInput = Pick<IUser, "email" | "password">;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

/** "  Gio@Mail.com " y "gio@mail.com" tienen que ser el mismo usuario. */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

/** Proyección explícita IUser → ISession: lista blanca de campos, la contraseña nunca pasa. */
const toSession = (user: IUser): ISession => ({
  email: user.email,
  role: user.role,
  loggedIn: true,
});

// ---------- Registro ----------

export const registerUser = (input: RegisterInput): Result<IUser> => {
  const email = normalizeEmail(input.email);
  const { password } = input;

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "El email no tiene un formato válido." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  const users = getUsers();
  if (users.some((user) => user.email === email)) {
    return { ok: false, error: "Ya existe una cuenta registrada con ese email." };
  }

  const newUser: IUser = { email, password, role: "client" };
  saveUsers([...users, newUser]);

  return { ok: true, data: newUser };
};

// ---------- Admin semilla ----------

/** El registro siempre crea clients: el admin inicial se "siembra" (como un seed de BD). */
export const DEFAULT_ADMIN: IUser = {
  email: "admin@foodstore.com",
  password: "admin123",
  role: "admin",
};

export const ensureDefaultAdmin = (): void => {
  const users = getUsers();
  if (users.some((user) => user.role === "admin")) return;

  // Si ese email quedó ocupado por un client, se reemplaza para no duplicarlo
  saveUsers([
    ...users.filter((user) => user.email !== DEFAULT_ADMIN.email),
    DEFAULT_ADMIN,
  ]);
};

// ---------- Login ----------

const INVALID_CREDENTIALS = "Email o contraseña incorrectos.";

export const loginUser = (input: LoginInput): Result<ISession> => {
  const email = normalizeEmail(input.email);

  if (email === "" || input.password === "") {
    return { ok: false, error: "Completá email y contraseña." };
  }

  const user = getUsers().find(
    (u) => u.email === email && u.password === input.password
  );

  if (!user) {
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  const session = toSession(user);
  saveSession(session); // primero se persiste la sesión...
  return { ok: true, data: session }; // ...y recién después la vista navega
};