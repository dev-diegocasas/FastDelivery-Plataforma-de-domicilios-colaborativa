"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminOrders,
  getMyRestaurant,
  getAdminOrderDetail,
  updateOrderStatus,
  acceptOrder,
  rejectOrder,
} from "@/features/menu/menu.actions";
import {
  Button,
  OrderStatusBadge,
  Modal,
  ConfirmModal,
  EmptyState,
  PageLoading,
  Badge,
  useToast,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderItem, OrderStatusLog, Payment } from "@/types";
import type { OrderStatus } from "@/config/constants";
import { ORDER_STATUS } from "@/config/constants";

interface OrderDetail {
  order: Order;
  items: OrderItem[];
  cliente: { name: string; email: string; phone: string | null } | null;
  statusLogs: OrderStatusLog[];
  payment: Payment | null;
}

const STATUS_ACTIONS: Record<string, { label: string; action: string; variant?: "primary" | "destructive" | "outline" }[]> = {
  RECIBIDO: [
    { label: "Aceptar pedido", action: "accept", variant: "primary" },
    { label: "Rechazar pedido", action: "reject", variant: "destructive" },
  ],
  ACEPTADO: [],
  EN_PREPARACION: [
    { label: "Cancelar pedido", action: "cancel", variant: "destructive" },
  ],
  EN_CAMINO: [
    { label: "Cancelar pedido", action: "cancel", variant: "destructive" },
  ],
  ENTREGADO: [],
  CANCELADO: [],
};

export default function AdminPedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [noRestaurant, setNoRestaurant] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ orderId: string; label: string; action: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  async function load() {
    try {
      const restaurant = await getMyRestaurant();
      if (!restaurant) {
        setNoRestaurant(true);
        setLoading(false);
        return;
      }
      const data = await getAdminOrders();
      setOrders(data as unknown as Order[]);
    } catch {
      addToast("error", "Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function openDetail(orderId: string) {
    try {
      const data = await getAdminOrderDetail(orderId);
      if (data) setDetail(data as unknown as OrderDetail);
      setDetailOpen(true);
    } catch {
      addToast("error", "Error al cargar el detalle");
    }
  }

  async function handleAction() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const { orderId, label, action } = confirmAction;
      if (action === "accept") {
        await acceptOrder(orderId);
      } else if (action === "reject") {
        await rejectOrder(orderId);
      } else if (action === "cancel") {
        await updateOrderStatus(orderId, "CANCELADO" as OrderStatus);
      }
      addToast("success", label);
      setConfirmAction(null);
      setDetailOpen(false);
      load();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al ejecutar acción");
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusInfo(status: string): string | null {
    switch (status) {
      case "ACEPTADO": return "Esperando pago del cliente";
      case "EN_PREPARACION": return "Pagado, esperando repartidor";
      default: return null;
    }
  }

  if (loading) return <PageLoading />;

  if (noRestaurant) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[48px] text-primary">store</span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">Pedidos</h1>
        <p className="text-body-lg text-secondary font-body-lg">
          Necesitas registrar tu negocio antes de gestionar los pedidos.
        </p>
        <Button size="lg" onClick={() => router.push("/admin/mi-negocio")}>
          <span className="material-symbols-outlined text-[20px]">add_business</span>
          Ir a mi negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">Pedidos</h1>

      {orders.length === 0 ? (
        <EmptyState icon="receipt_long" title="No hay pedidos" message="Aún no has recibido ningún pedido." />
      ) : (
        <>
          <div className="hidden md:block bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="text-left px-4 py-3 text-label-md text-secondary font-label-md">FECHA</th>
                  <th className="text-left px-4 py-3 text-label-md text-secondary font-label-md">CLIENTE</th>
                  <th className="text-left px-4 py-3 text-label-md text-secondary font-label-md">TOTAL</th>
                  <th className="text-left px-4 py-3 text-label-md text-secondary font-label-md">ESTADO</th>
                  <th className="text-left px-4 py-3 text-label-md text-secondary font-label-md">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container transition-colors cursor-pointer" onClick={() => openDetail(order.id)}>
                    <td className="px-4 py-3 text-body-sm text-secondary font-body-sm">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-body-md text-on-surface font-body-md">{order.clienteId.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-body-md font-semibold text-on-surface font-body-md">{formatCurrency(Number(order.total))}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">
                      {getStatusInfo(order.status) ? (
                        <span className="text-body-sm text-secondary font-body-sm">{getStatusInfo(order.status)}</span>
                      ) : (
                        <button type="button" onClick={(e) => { e.stopPropagation(); openDetail(order.id); }}
                          className="text-label-md text-primary font-label-md hover:underline">Ver detalle</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-3">
            {orders.map((order) => (
              <div key={order.id} onClick={() => openDetail(order.id)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 cursor-pointer hover:bg-surface-container transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-secondary font-body-sm">{formatDate(order.createdAt)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-md text-on-surface font-body-md">#{order.id.slice(0, 6)}</span>
                  <span className="font-title-lg text-primary font-title-lg">{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setDetail(null); }}
        title="Detalle del pedido"
        size="lg"
        footer={detail && STATUS_ACTIONS[detail.order.status]?.length > 0 ? (
          <div className="flex gap-2 w-full">
            {STATUS_ACTIONS[detail.order.status].map((actionDef) => (
              <Button
                key={actionDef.action}
                variant={actionDef.variant ?? "primary"}
                className="flex-1"
                onClick={() => setConfirmAction({ orderId: detail.order.id, label: actionDef.label, action: actionDef.action })}
              >
                {actionDef.label}
              </Button>
            ))}
          </div>
        ) : undefined}
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={detail.order.status} />
              {detail.payment && (
                <Badge variant={detail.payment.status === "completado" ? "success" : "warning"}>
                  {detail.payment.status === "completado" ? "Pagado" : "Pendiente"}
                </Badge>
              )}
            </div>

            {detail.cliente && (
              <div className="bg-surface-container rounded-lg p-3 space-y-1">
                <p className="text-label-sm text-secondary font-label-sm">CLIENTE</p>
                <p className="text-body-md text-on-surface font-body-md">{detail.cliente.name}</p>
                <p className="text-body-sm text-secondary font-body-sm">{detail.cliente.email} · {detail.cliente.phone ?? "Sin teléfono"}</p>
              </div>
            )}

            <div className="bg-surface-container rounded-lg p-3">
              <p className="text-label-sm text-secondary font-label-sm">DIRECCIÓN</p>
              <p className="text-body-md text-on-surface font-body-md">{detail.order.deliveryAddress}</p>
              {detail.order.observations && (
                <p className="text-body-sm text-secondary font-body-sm mt-1">Obs: {detail.order.observations}</p>
              )}
            </div>

            <div>
              <p className="text-label-sm text-secondary font-label-sm mb-2">PRODUCTOS</p>
              <div className="space-y-2">
                {detail.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-on-surface">{item.quantity}x {(item as any).dishName ?? "Plato"}</span>
                    <span className="text-on-surface font-semibold">{formatCurrency(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-outline-variant font-title-lg font-title-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(Number(detail.order.total))}</span>
              </div>
            </div>

            {detail.statusLogs.length > 0 && (
              <div>
                <p className="text-label-sm text-secondary font-label-sm mb-2">HISTORIAL</p>
                <div className="space-y-2">
                  {detail.statusLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-body-sm text-secondary font-body-sm">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="flex-1">
                        {log.previousStatus ? `${log.previousStatus} → ${log.newStatus}` : `${log.newStatus}`}
                      </span>
                      <span>{formatDate(log.changedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title="Confirmar acción"
        message={`¿Estás seguro de "${confirmAction?.label?.toLowerCase()}"?`}
        confirmText={confirmAction?.label ?? "Confirmar"}
        variant="destructive"
        loading={actionLoading}
      />
    </div>
  );
}
