"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDeliveryDetail,
  acceptDelivery,
  updateDeliveryStatus,
} from "@/features/repartidor/repartidor.actions";
import {
  Button,
  OrderStatusBadge,
  ConfirmModal,
  PageLoading,
  useToast,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderItem } from "@/types";
import type { OrderStatus } from "@/config/constants";

interface DeliveryDetail {
  order: Order;
  items: OrderItem[];
  restaurant: { name: string; address: string } | null;
  cliente: { name: string; email: string; phone: string | null } | null;
}

export default function EntregaPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const [detail, setDetail] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: "accept" | "deliver";
  } | null>(null);
  const [purchaseToken, setPurchaseToken] = useState("");

  async function load() {
    try {
      const data = await getDeliveryDetail(orderId);
      setDetail(data as unknown as DeliveryDetail);
    } catch {
      addToast("error", "Error al cargar la entrega");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAccept() {
    setActionLoading(true);
    try {
      await acceptDelivery(orderId);
      addToast("success", "Pedido aceptado. ¡A repartir!");
      setConfirmAction(null);
      load();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al aceptar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeliver() {
    setActionLoading(true);
    try {
      await updateDeliveryStatus(orderId, "ENTREGADO" as OrderStatus, purchaseToken);
      addToast("success", "Entrega completada exitosamente");
      setConfirmAction(null);
      load();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al completar");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <PageLoading />;
  if (!detail) {
    return (
      <div className="text-center py-16 space-y-4">
        <span className="material-symbols-outlined text-[64px] text-secondary">search_off</span>
        <h2 className="text-headline-md font-semibold text-on-surface font-headline-md">Entrega no encontrada</h2>
        <Button onClick={() => router.push("/repartidor/panel")}>Volver al panel</Button>
      </div>
    );
  }

  const { order, items, restaurant, cliente } = detail;
  const needsAccept = !order.repartidorId;
  const isInTransit = order.status === "EN_CAMINO";
  const canDeliver = isInTransit;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
            {needsAccept ? "Nuevo pedido" : "Mi entrega"}
          </h1>
          <p className="text-body-sm text-secondary font-body-sm mt-1">
            Pedido #{order.id.slice(0, 6)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Restaurant */}
      {restaurant && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
          <p className="text-label-sm text-secondary font-label-sm">RESTAURANTE</p>
          <p className="text-body-md font-semibold text-on-surface font-body-md">{restaurant.name}</p>
          <p className="text-body-sm text-secondary font-body-sm">{restaurant.address}</p>
        </div>
      )}

      {/* Cliente */}
      {cliente && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
          <p className="text-label-sm text-secondary font-label-sm">CLIENTE</p>
          <p className="text-body-md font-semibold text-on-surface font-body-md">{cliente.name}</p>
          <p className="text-body-sm text-secondary font-body-sm">
            {cliente.phone ?? "Sin teléfono"} · {cliente.email}
          </p>
        </div>
      )}

      {/* Delivery address */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
        <p className="text-label-sm text-secondary font-label-sm">DIRECCIÓN DE ENTREGA</p>
        <p className="text-body-md text-on-surface font-body-md">{order.deliveryAddress}</p>
        {order.observations && (
          <p className="text-body-sm text-secondary font-body-sm">Obs: {order.observations}</p>
        )}
      </div>

      {/* Items */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
        <p className="text-label-sm text-secondary font-label-sm">PRODUCTOS</p>
        <div className="divide-y divide-outline-variant/50">
          {items.map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between text-body-md font-body-md">
              <span className="text-on-surface">{item.quantity}x Plato</span>
              <span className="text-on-surface font-semibold">{formatCurrency(Number(item.subtotal))}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2 font-title-lg font-title-lg">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(Number(order.total))}</span>
        </div>
      </div>

      {/* Actions */}
      {needsAccept && (
        <Button className="w-full" size="lg" onClick={() => setConfirmAction({ action: "accept" })}>
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Aceptar pedido
        </Button>
      )}
      {canDeliver && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="token" className="text-label-md text-on-surface-variant font-label-md block">
              TOKEN DE COMPRA DEL CLIENTE
            </label>
            <input
              id="token"
              type="text"
              value={purchaseToken}
              onChange={(e) => setPurchaseToken(e.target.value)}
              placeholder="Ingresa el token que te proporcionó el cliente"
              className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container outline-none"
            />
          </div>
          <Button className="w-full" size="lg" onClick={() => setConfirmAction({ action: "deliver" })}>
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Marcar como entregado
          </Button>
        </div>
      )}

      <Button variant="ghost" className="w-full" onClick={() => router.push("/repartidor/panel")}>
        Volver al panel
      </Button>

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={confirmAction?.action === "accept"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAccept}
        title="Aceptar pedido"
        message="¿Confirmas que aceptas este pedido para entrega?"
        confirmText="Aceptar"
        loading={actionLoading}
      />
      <ConfirmModal
        isOpen={confirmAction?.action === "deliver"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDeliver}
        title="Completar entrega"
        message="¿Confirmas que has entregado este pedido al cliente?"
        confirmText="Entregado"
        loading={actionLoading}
      />
    </div>
  );
}
