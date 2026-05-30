"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getUnreadNotificationCount,
  getRecentNotifications,
  markNotificationRead,
} from "@/features/notifications/notifications.actions";
import { formatDate } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

interface NotifData {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  type: string;
  relatedOrderId: string | null;
}

const NOTIF_ICONS: Record<string, string> = {
  PEDIDO_RECIBIDO: "receipt",
  PEDIDO_ACEPTADO: "check_circle",
  PEDIDO_PAGADO: "credit_card",
  PEDIDO_EN_PREPARACION: "cooking",
  PEDIDO_ASIGNADO_REPARTIDOR: "motorcycle",
  PEDIDO_EN_CAMINO: "local_shipping",
  PEDIDO_ENTREGADO: "check_circle",
  PEDIDO_CANCELADO: "cancel",
  PAGO_CONFIRMADO: "credit_card",
  PAGO_FALLIDO: "credit_card_off",
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<NotifData[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const [count, recent] = await Promise.all([
        getUnreadNotificationCount(),
        getRecentNotifications(5),
      ]);
      setUnreadCount(count);
      setRecentNotifs(recent as unknown as NotifData[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    pollingRef.current = setInterval(fetchNotifs, 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchNotifs]);

  async function handleMarkAsRead(id: string) {
    try {
      await markNotificationRead(id);
      setRecentNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center px-4 lg:px-6 gap-4 shrink-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
        aria-label="Abrir menú"
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setProfileOpen(false);
          }}
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Notificaciones"
        >
          <span className="material-symbols-outlined text-[24px]">
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary text-[10px] text-on-primary font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setNotifOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-outline-variant">
                <p className="font-title-lg text-title-lg text-on-surface">
                  Notificaciones
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {recentNotifs.length === 0 ? (
                  <div className="p-4 text-center text-body-sm text-secondary font-body-sm">
                    No hay notificaciones recientes
                  </div>
                ) : (
                  recentNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 flex items-start gap-3 hover:bg-surface-container transition-colors border-b border-outline-variant/50"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] mt-0.5 ${
                          notif.isRead
                            ? "text-secondary"
                            : "text-primary"
                        }`}
                      >
                        {NOTIF_ICONS[notif.type] ?? "notifications"}
                      </span>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          setNotifOpen(false);
                          if (notif.relatedOrderId) {
                            router.push(
                              `/cliente/tracking/${notif.relatedOrderId}`,
                            );
                          } else {
                            router.push("/notificaciones");
                          }
                        }}
                      >
                        <p
                          className={`text-body-sm font-body-sm truncate ${
                            notif.isRead
                              ? "text-secondary"
                              : "text-on-surface font-semibold"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-body-sm text-secondary font-body-sm truncate">
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          className="p-1 text-secondary hover:text-primary transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            mark_email_read
                          </span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-outline-variant text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    router.push("/notificaciones");
                  }}
                  className="text-label-md text-primary font-label-md hover:underline"
                >
                  Ver todas
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotifOpen(false);
          }}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Perfil"
        >
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary text-sm font-bold flex items-center justify-center">
            {initials}
          </div>
          <span className="hidden sm:block text-body-md text-on-surface font-body-md max-w-[120px] truncate">
            {session?.user?.name ?? "Usuario"}
          </span>
          <span className="material-symbols-outlined text-[18px] text-secondary hidden sm:block">
            arrow_drop_down
          </span>
        </button>

        {profileOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setProfileOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-variant">
                <p className="text-body-md font-semibold text-on-surface font-body-md">
                  {session?.user?.name}
                </p>
                <p className="text-body-sm text-secondary font-body-sm">
                  {session?.user?.email}
                </p>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/perfil");
                  }}
                  className="w-full text-left px-4 py-2 text-body-md text-on-surface font-body-md hover:bg-surface-container transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary">
                    person
                  </span>
                  Mi perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/configuracion");
                  }}
                  className="w-full text-left px-4 py-2 text-body-md text-on-surface font-body-md hover:bg-surface-container transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary">
                    settings
                  </span>
                  Configuración
                </button>
              </div>
              <div className="border-t border-outline-variant py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    signOut({ redirect: true, callbackUrl: "/login" });
                  }}
                  className="w-full text-left px-4 py-2 text-body-md text-on-surface font-body-md hover:bg-surface-container transition-colors flex items-center gap-3 text-error"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
