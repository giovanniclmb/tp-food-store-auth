/** Todas las rutas de la app en un solo lugar. */
import type { Rol } from "../types/Rol";

/** Todas las rutas de la app en un solo lugar. */
export const ROUTES = {
  LOGIN: "/src/pages/auth/login/login.html",
  REGISTRO: "/src/pages/auth/registro/registro.html",
  ADMIN_HOME: "/src/pages/admin/home/home.html",
  CLIENT_HOME: "/src/pages/client/home/home.html",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/** La "zona permitida" de cada rol. Record<Rol, …> obliga a cubrir TODOS los roles. */
export const HOME_BY_ROL: Record<Rol, Route> = {
  admin: ROUTES.ADMIN_HOME,
  client: ROUTES.CLIENT_HOME,
};

export const navigate = (route: Route): void => {
  window.location.href = route;
};