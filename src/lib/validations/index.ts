import { z } from "zod";

// ── AUTH ──
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z
    .string()
    .min(7, "Teléfono inválido")
    .max(20, "Teléfono demasiado largo"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["cliente", "admin", "repartidor"]),
});

// ── DISH ──
export const createDishSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre es demasiado largo"),
  description: z
    .string()
    .max(500, "La descripción es demasiado larga")
    .optional()
    .nullable(),
  price: z
    .number()
    .positive("El precio debe ser mayor a 0")
    .max(9999999, "Precio demasiado alto"),
  imageUrl: z.string().url("URL inválida").optional().nullable(),
});

export const updateDishSchema = createDishSchema.partial();

// ── ORDER ──
export const orderItemSchema = z.object({
  dishId: z.string().uuid("ID de plato inválido"),
  quantity: z
    .number()
    .int()
    .positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Precio inválido"),
  observations: z
    .string()
    .max(150, "Máximo 150 caracteres")
    .optional()
    .nullable(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid("ID de restaurante inválido"),
  items: z
    .array(orderItemSchema)
    .min(1, "Debe haber al menos un producto"),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, "Total inválido"),
  deliveryAddress: z
    .string()
    .min(5, "La dirección es obligatoria")
    .max(500, "Dirección demasiado larga"),
  observations: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .nullable(),
  paymentMethod: z.enum(["TARJETA", "PSE"]),
});

export const updateOrderStatusSchema = z.object({
  newStatus: z.enum([
    "RECIBIDO",
    "EN_PREPARACION",
    "EN_CAMINO",
    "ENTREGADO",
    "CANCELADO",
  ]),
});

// ── ADDRESS ──
export const createAddressSchema = z.object({
  label: z
    .string()
    .max(100, "La etiqueta es demasiado larga")
    .optional()
    .nullable(),
  address: z
    .string()
    .min(5, "La dirección es obligatoria")
    .max(500, "Dirección demasiado larga"),
  lat: z.string().optional().nullable(),
  lng: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

// ── REVIEW ──
export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5"),
  comment: z
    .string()
    .max(500, "El comentario es demasiado largo")
    .optional()
    .nullable(),
});

// ── RESTAURANT ──
export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre es demasiado largo"),
  description: z
    .string()
    .max(1000, "La descripción es demasiado larga")
    .optional()
    .nullable(),
  category: z.string().min(1, "La categoría es obligatoria"),
  address: z
    .string()
    .min(5, "La dirección es obligatoria")
    .max(500, "Dirección demasiado larga"),
  estimatedTime: z
    .number()
    .int()
    .min(1, "El tiempo mínimo es 1 minuto")
    .max(180, "El tiempo máximo es 180 minutos")
    .optional(),
  minOrder: z
    .number()
    .min(0, "El pedido mínimo no puede ser negativo")
    .optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial().extend({
  isOpen: z.boolean().optional(),
});

// ── AUTH PASSWORDS ──

export const requestResetSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid("Token inválido"),
  newPassword: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
  newPassword: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const verifyEmailSchema = z.object({
  token: z.string().uuid("Token inválido"),
});
