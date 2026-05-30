export const ORDER_STATUS = {
  RECIBIDO: "RECIBIDO",
  ACEPTADO: "ACEPTADO",
  EN_PREPARACION: "EN_PREPARACION",
  EN_CAMINO: "EN_CAMINO",
  ENTREGADO: "ENTREGADO",
  CANCELADO: "CANCELADO",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECIBIDO: "Recibido",
  ACEPTADO: "Aceptado",
  EN_PREPARACION: "En preparación",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  RECIBIDO: "bg-blue-100 text-blue-800",
  ACEPTADO: "bg-green-100 text-green-800",
  EN_PREPARACION: "bg-yellow-100 text-yellow-800",
  EN_CAMINO: "bg-purple-100 text-purple-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export const USER_ROLES = {
  CLIENTE: "cliente",
  ADMIN: "admin",
  REPARTIDOR: "repartidor",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  cliente: "Cliente",
  admin: "Administrador",
  repartidor: "Repartidor",
};

export const PAYMENT_METHODS = {
  TARJETA: "TARJETA",
  PSE: "PSE",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TARJETA: "Tarjeta de crédito/débito",
  PSE: "PSE",
};

export const PAYMENT_STATUS = {
  PENDIENTE: "pendiente",
  COMPLETADO: "completado",
  FALLIDO: "fallido",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  fallido: "Fallido",
};

export const RESTAURANT_CATEGORIES = [
  "Hamburguesas",
  "Pizza",
  "Sushi",
  "Mexicana",
  "Colombiana",
  "Italiana",
  "China",
  "Pollo",
  "Ensaladas",
  "Postres",
] as const;

export const NOTIFICATION_TYPES = {
  PEDIDO_RECIBIDO: "PEDIDO_RECIBIDO",
  PEDIDO_ACEPTADO: "PEDIDO_ACEPTADO",
  PEDIDO_PAGADO: "PEDIDO_PAGADO",
  PEDIDO_EN_PREPARACION: "PEDIDO_EN_PREPARACION",
  PEDIDO_ASIGNADO_REPARTIDOR: "PEDIDO_ASIGNADO_REPARTIDOR",
  PEDIDO_EN_CAMINO: "PEDIDO_EN_CAMINO",
  PEDIDO_ENTREGADO: "PEDIDO_ENTREGADO",
  PEDIDO_CANCELADO: "PEDIDO_CANCELADO",
  PAGO_CONFIRMADO: "PAGO_CONFIRMADO",
  PAGO_FALLIDO: "PAGO_FALLIDO",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  PEDIDO_RECIBIDO: "Pedido recibido",
  PEDIDO_ACEPTADO: "Pedido aceptado",
  PEDIDO_PAGADO: "Pedido pagado",
  PEDIDO_EN_PREPARACION: "Pedido en preparación",
  PEDIDO_ASIGNADO_REPARTIDOR: "Pedido asignado a repartidor",
  PEDIDO_EN_CAMINO: "Pedido en camino",
  PEDIDO_ENTREGADO: "Pedido entregado",
  PEDIDO_CANCELADO: "Pedido cancelado",
  PAGO_CONFIRMADO: "Pago confirmado",
  PAGO_FALLIDO: "Pago fallido",
};

export const MAX_ADDRESSES_PER_USER = 5;
export const MAX_DISH_OBSERVATION_LENGTH = 150;
export const MAX_ORDER_OBSERVATION_LENGTH = 500;
