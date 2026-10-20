import type { ISession } from "../types/IUser";
import { isRol, type Rol } from "../types/Rol";
import { getSession, removeSession, STORAGE_KEYS } from "./localStorage";
import { HOME_BY_ROL, navigate, ROUTES, type Route } from "./navigate";

/** Cada carpeta de /pages es una "zona": pública (auth) o exclusiva de un rol. */
type Zone = "public" | Rol;

const ZONE_REGEX = /\/pages\/([^/]+)\//;

/** "/src/pages/admin/home/home.html" → "admin". Carpeta desconocida → null. */
export const getZone = (pathname: string): Zone | null => {
  const folder = pathname.match(ZONE_REGEX)?.[1];
  if (folder === "auth") return "public";
  return isRol(folder) ? folder : null;
};

/**
 * El corazón del guard: una función PURA (no toca el DOM ni el storage).
 * Devuelve a dónde redirigir, o null si el acceso está permitido.
 */
export const resolveRedirect = (
  pathname: string,
  session: ISession | null
): Route | null => {
  const zone = getZone(pathname);

  // Zona pública: si ya hay sesión, no tiene sentido ver login/registro
  if (zone === "public") {
    return session ? HOME_BY_ROL[session.role] : null;
  }

  // Desde acá todo es privado (incluida una carpeta desconocida: denegar por defecto)
  if (!session) return ROUTES.LOGIN;
  if (zone === null || zone !== session.role) return HOME_BY_ROL[session.role];

  return null; // zona del propio rol → acceso permitido
};

/** Evalúa la página actual: redirige, o recién ahí muestra el contenido. */
const runGuard = (): void => {
  document.body.hidden = true; // nada se ve hasta que el guard lo apruebe

  const redirect = resolveRedirect(window.location.pathname, getSession());
  if (redirect) {
    navigate(redirect);
    return; // el body queda oculto mientras el navegador cambia de página
  }

  document.body.hidden = false;
};

/** Engancha el guard a todo evento en que la página puede mostrarse o la sesión cambiar. */
export const initGuard = (): void => {
  runGuard();

  // Botón "Atrás": el navegador puede restaurar la página desde su caché (bfcache)
  // SIN volver a ejecutar los scripts. pageshow con persisted=true detecta ese caso.
  window.addEventListener("pageshow", (e: PageTransitionEvent) => {
    if (e.persisted) runGuard();
  });

  // Logout (o edición manual) en OTRA pestaña: el evento storage nos avisa
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.SESSION || e.key === null) runGuard();
  });
};

export const logout = (): void => {
  removeSession();
  navigate(ROUTES.LOGIN);
};