import type { UserRole } from "./constants";

interface Route {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}

export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  REGISTRO: "/registro",
  RECUPERAR_CONTRASENA: "/recuperar-contrasena",
  VERIFICAR_CORREO: "/verificar-correo",
} as const;

export const DASHBOARD_ROUTES: Route[] = [
  {
    label: "Explorar",
    path: "/cliente/explorar",
    icon: "explore",
    roles: ["cliente"],
  },
  {
    label: "Mis pedidos",
    path: "/cliente/pedidos",
    icon: "receipt_long",
    roles: ["cliente"],
  },
  {
    label: "Panel",
    path: "/admin/panel",
    icon: "dashboard",
    roles: ["admin"],
  },
  {
    label: "Mi negocio",
    path: "/admin/mi-negocio",
    icon: "store",
    roles: ["admin"],
  },
  {
    label: "Menú",
    path: "/admin/menu",
    icon: "restaurant_menu",
    roles: ["admin"],
  },
  {
    label: "Pedidos",
    path: "/admin/pedidos",
    icon: "list_alt",
    roles: ["admin"],
  },
  {
    label: "Panel",
    path: "/repartidor/panel",
    icon: "dashboard",
    roles: ["repartidor"],
  },
  {
    label: "Disponibilidad",
    path: "/repartidor/disponibilidad",
    icon: "toggle_on",
    roles: ["repartidor"],
  },
  {
    label: "Notificaciones",
    path: "/notificaciones",
    icon: "notifications",
    roles: ["cliente", "admin", "repartidor"],
  },
  {
    label: "Perfil",
    path: "/perfil",
    icon: "person",
    roles: ["cliente", "admin", "repartidor"],
  },
];

export function getAllowedRoutes(role: UserRole): Route[] {
  return DASHBOARD_ROUTES.filter((route) => route.roles.includes(role));
}

export const ROLE_DEFAULT_PATH: Record<UserRole, string> = {
  cliente: "/cliente/explorar",
  admin: "/admin/panel",
  repartidor: "/repartidor/panel",
};

export const PUBLIC_PATHS = Object.values(PUBLIC_ROUTES);
