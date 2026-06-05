"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/features/notifications/notifications.actions";
import { PageLoading, EmptyState, Button, useToast } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedOrderId: string | null;
}

const TYPE_ICONS: Record<string, string> = {
  PEDIDO_RECIBIDO: "receipt",
  PEDIDO_EN_PREPARACION: "cooking",
  PEDIDO_ASIGNADO_REPARTIDOR: "motorcycle",
  PEDIDO_EN_CAMINO: "local_shipping",
  PEDIDO_ENTREGADO: "check_circle",
  PEDIDO_CANCELADO: "cancel",
  PAGO_CONFIRMADO: "credit_card",
  PAGO_FALLIDO: "credit_card_off",
};

export default function NotificacionesPage() {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getUserNotifications();
      setNotifications(data as unknown as Notification[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      addToast("error", "Error al marcar como leída");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
      addToast("success", "Todas las notificaciones marcadas como leídas");
    } catch {
      addToast("error", "Error al marcar todas como leídas");
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <p className="text-body-sm text-secondary font-body-sm mt-1">
              {unreadCount} {unreadCount === 1 ? "sin leer" : "sin leer"}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={handleMarkAllRead}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications_off"
          title="No tienes notificaciones"
          message="Las notificaciones de tus pedidos aparecerán aquí."
        />
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                notif.isRead ? "" : "bg-primary-fixed/10"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  notif.isRead
                    ? "bg-surface-container text-secondary"
                    : "bg-primary-container/20 text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {TYPE_ICONS[notif.type] ?? "notifications"}
                </span>
              </div>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              >
                <p
                  className={`text-body-md font-body-md ${
                    notif.isRead
                      ? "text-secondary"
                      : "text-on-surface font-semibold"
                  }`}
                >
                  {notif.title}
                </p>
                <p
                  className={`text-body-sm font-body-sm mt-0.5 ${
                    notif.isRead ? "text-secondary" : "text-on-surface-variant"
                  }`}
                >
                  {notif.message}
                </p>
                <p className="text-label-sm text-secondary font-label-sm mt-1">
                  {formatDate(notif.createdAt)}
                </p>
              </div>
              {!notif.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1 text-secondary hover:text-primary transition-colors shrink-0"
                  title="Marcar como leída"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    mark_email_read
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
