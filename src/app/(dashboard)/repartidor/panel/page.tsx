"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getRepartidorStatus,
  getAvailableOrders,
  getRepartidorDeliveryHistory,
  acceptDelivery,
  rejectDelivery,
} from "@/features/repartidor/repartidor.actions";
import {
  Button,
  ConfirmModal,
  OrderStatusBadge,
  PageLoading,
  EmptyState,
  useToast,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export default function RepartidorPanelPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [status, setStatus] = useState<{
    isAvailable: boolean;
    activeDelivery: Order | null;
    todayDeliveries: number;
  } | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmData, setConfirmData] = useState<{
    orderId: string;
    action: "accept" | "reject";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    try {
      const [s, avail, hist] = await Promise.all([
        getRepartidorStatus(),
        getAvailableOrders(),
        getRepartidorDeliveryHistory(),
      ]);
      setStatus(s as any);
      setAvailableOrders(avail as unknown as Order[]);
      setHistory(hist as unknown as Order[]);
      setUnreadCount((s as any).unreadNotifications ?? 0);
    } catch {
      addToast("error", "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); const interval = setInterval(load, 30000); return () => clearInterval(interval); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConfirm() {
    if (!confirmData) return;
    setActionLoading(true);
    try {
      if (confirmData.action === "accept") {
        await acceptDelivery(confirmData.orderId);
        addToast("success", "Pedido aceptado. ¡Buena entrega!");
      } else {
        await rejectDelivery(confirmData.orderId);
        addToast("success", "Pedido descartado");
      }
      setConfirmData(null);
      load();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al procesar");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <PageLoading />;
  if (!status) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
          Panel
        </h1>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container text-label-sm rounded-full font-label-sm">
            <span className="material-symbols-outlined text-[16px]">notifications</span>
            {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
          </span>
        )}
      </div>

      {/* Status + KPI */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`rounded-xl p-4 space-y-2 border ${
            status.isAvailable
              ? "bg-green-50 border-green-200"
              : "bg-surface-container-lowest border-outline-variant"
          }`}
        >
          <span className="material-symbols-outlined text-[24px] text-green-600">
            {status.isAvailable ? "toggle_on" : "toggle_off"}
          </span>
          <p className="text-display-md font-bold text-on-surface font-display-md">
            {status.isAvailable ? "Disponible" : "No disponible"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/repartidor/disponibilidad")}
          >
            Cambiar
          </Button>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
          <span className="material-symbols-outlined text-[24px] text-primary">
            check_circle
          </span>
          <p className="text-display-md font-bold text-on-surface font-display-md">
            {status.todayDeliveries}
          </p>
          <p className="text-body-sm text-secondary font-body-sm">
            Entregas hoy
          </p>
        </div>
      </div>

      {/* Active delivery */}
      {status.activeDelivery && (
        <div className="bg-surface-container-lowest border border-primary-container/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">
              Entrega activa
            </h2>
            <OrderStatusBadge status={status.activeDelivery.status} />
          </div>
          <p className="text-body-sm text-secondary font-body-sm">
            Pedido #{status.activeDelivery.id.slice(0, 6)} —{" "}
            {formatDate(status.activeDelivery.createdAt)}
          </p>
          <Button
            className="w-full"
            onClick={() =>
              router.push(
                `/repartidor/entrega/${status.activeDelivery!.id}`,
              )
            }
          >
            Ver entrega
          </Button>
        </div>
      )}

      {/* Available orders to accept */}
      {status.isAvailable && availableOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">
            Pedidos disponibles
          </h2>
          {availableOrders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-semibold text-on-surface font-body-md truncate">
                    Pedido #{order.id.slice(0, 6)}
                  </p>
                  <p className="text-body-sm text-secondary font-body-sm mt-1">
                    {formatCurrency(Number(order.total))} —{" "}
                    {order.deliveryAddress}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/repartidor/entrega/${order.id}`)}
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-secondary text-secondary"
                  onClick={() => setConfirmData({ orderId: order.id, action: "reject" })}
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  No me interesa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">
            Historial de entregas
          </h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-body-sm font-semibold text-on-surface font-body-sm">
                    Pedido #{order.id.slice(0, 6)}
                  </p>
                  <p className="text-body-sm text-secondary font-body-sm">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!status.activeDelivery &&
        availableOrders.length === 0 &&
        history.length === 0 && (
          <EmptyState
            icon="motorcycle"
            title="Sin actividad"
            message="Activa tu disponibilidad para recibir pedidos."
            action={{
              label: "Ir a disponibilidad",
              onClick: () => router.push("/repartidor/disponibilidad"),
            }}
          />
        )}

      <ConfirmModal
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={handleConfirm}
        title={confirmData?.action === "accept" ? "Aceptar pedido" : "Descartar pedido"}
        message={
          confirmData?.action === "accept"
            ? "Al aceptar este pedido, quedarás no disponible para otros pedidos hasta completar la entrega."
            : "Este pedido seguirá disponible para otros repartidores."
        }
        confirmText={confirmData?.action === "accept" ? "Aceptar y entregar" : "Descartar"}
        variant={confirmData?.action === "accept" ? "primary" : "destructive"}
        loading={actionLoading}
      />
    </div>
  );
}
