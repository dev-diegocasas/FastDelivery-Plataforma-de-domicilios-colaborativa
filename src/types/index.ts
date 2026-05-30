import type {
  OrderStatus,
  UserRole,
  PaymentMethod,
  PaymentStatus,
  NotificationType,
} from "@/config/constants";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  emailVerified: boolean;
  notificationsEnabled: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: Date;
}

export interface Restaurant {
  id: string;
  adminId: string;
  name: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  isOpen: boolean;
  address: string;
  lat: number | null;
  lng: number | null;
  avgRating: number;
  minOrder: number;
  estimatedTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  clienteId: string;
  restaurantId: string;
  repartidorId: string | null;
  status: OrderStatus;
  total: number;
  deliveryAddress: string;
  addressLat: number | null;
  addressLng: number | null;
  observations: string | null;
  purchaseToken: string | null;
  estimatedDelivery: Date | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  dishId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  observations: string | null;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  orderId: string;
  clienteId: string;
  restaurantId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string;
  changedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedOrderId: string | null;
  createdAt: Date;
}

export interface RepartidorAvailability {
  id: string;
  repartidorId: string;
  isAvailable: boolean;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
