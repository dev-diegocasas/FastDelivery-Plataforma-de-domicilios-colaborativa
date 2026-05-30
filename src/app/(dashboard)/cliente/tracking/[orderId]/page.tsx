"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, payOrder } from "@/features/orders/orders.actions";
import {
  checkCanReview,
  createReview,
} from "@/features/reviews/reviews.actions";
import Timeline from "@/components/ui/Timeline";
import {
  OrderStatusBadge,
  Button,
  PageLoading,
  useToast,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderItem, OrderStatusLog, Payment } from "@/types";

interface OrderDetail {
  order: Order;
  items: (OrderItem & { dishName: string | null })[];
  restaurant: { name: string; category: string } | null;
  statusLogs: OrderStatusLog[];
  payment: Payment | null;
}

export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  async function load() {
    const result = await getOrderById(orderId);
    if (result) {
      setData(result as unknown as OrderDetail);
      if (result.order.status === "ENTREGADO") {
        const check = await checkCanReview(orderId);
        if (check.canReview) setCanReview(true);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePay() {
    setPaying(true);
    try {
      await payOrder(orderId, "TARJETA");
      addToast("success", "¡Pago exitoso! Tu pedido está listo para reparto.");
      load();
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al procesar el pago");
    } finally {
      setPaying(false);
    }
  }

  async function handleSubmitReview() {
    if (reviewRating === 0) {
      addToast("error", "Selecciona una calificación");
      return;
    }
    setSubmittingReview(true);
    try {
      await createReview(orderId, reviewRating, reviewComment || undefined);
      setReviewSubmitted(true);
      setCanReview(false);
      addToast("success", "¡Gracias por calificar tu pedido!");
    } catch (e) {
      addToast("error", (e as Error).message ?? "Error al calificar");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <PageLoading />;

  if (!data) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <span className="material-symbols-outlined text-[64px] text-secondary">
          receipt_long
        </span>
        <h2 className="text-headline-md font-semibold text-on-surface font-headline-md">
          Pedido no encontrado
        </h2>
        <Button onClick={() => router.push("/cliente/pedidos")}>
          Ver mis pedidos
        </Button>
      </div>
    );
  }

  const { order, items, restaurant, payment } = data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
            Seguimiento del pedido
          </h1>
          <p className="text-body-sm text-secondary font-body-sm mt-1">
            {restaurant?.name ?? "Restaurante"} — {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Pay action for ACEPTADO orders */}
      {order.status === "ACEPTADO" && !payment && (
        <div className="bg-primary-fixed/20 border border-primary-container/30 rounded-xl p-6 space-y-4">
          <div className="text-center space-y-2">
            <span className="material-symbols-outlined text-[48px] text-primary">credit_card</span>
            <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">
              Tu pedido fue aceptado
            </h2>
            <p className="text-body-md text-secondary font-body-md">
              El restaurante aceptó tu pedido. Realiza el pago para que sea visible para los repartidores.
            </p>
          </div>
          <Button className="w-full" size="lg" onClick={handlePay} loading={paying}>
            <span className="material-symbols-outlined text-[20px]">credit_card</span>
            Pagar pedido — {formatCurrency(Number(order.total))}
          </Button>
        </div>
      )}

      {/* Purchase token display for EN_PREPARACION and beyond */}
      {(order.status === "EN_PREPARACION" || order.status === "EN_CAMINO") && (order as any).purchaseToken && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-purple-600">vpn_key</span>
            <h3 className="font-title-md font-semibold text-on-surface font-title-md">Token de compra</h3>
          </div>
          <p className="text-body-sm text-secondary font-body-sm">
            Comparte este código con el repartidor al recibir tu pedido para validar la entrega.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={(order as any).purchaseToken}
              className="flex-1 h-10 px-3 bg-white border border-purple-200 rounded-lg font-mono text-body-sm text-on-surface outline-none"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText((order as any).purchaseToken);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="h-10 px-4 bg-purple-600 text-white font-title-sm rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all shrink-0"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <Timeline currentStatus={order.status} />
      </div>

      {/* Items */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3">
        <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">
          Productos
        </h2>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-body-md font-body-md"
          >
            <span className="text-on-surface">
              {item.quantity}x{" "}
              <span className="text-secondary">
                {(item as any).dishName ?? "Plato"}
              </span>
            </span>
            <span className="text-on-surface font-semibold">
              {formatCurrency(Number(item.subtotal))}
            </span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-outline-variant font-title-lg font-title-lg">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(Number(order.total))}</span>
        </div>
      </div>

      {/* Delivery details */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
        <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">
          Detalles
        </h2>
        <div className="text-body-sm text-secondary font-body-sm space-y-1">
          <p>
            <span className="text-on-surface font-medium">Dirección:</span>{" "}
            {order.deliveryAddress}
          </p>
          {order.observations && (
            <p>
              <span className="text-on-surface font-medium">Observaciones:</span>{" "}
              {order.observations}
            </p>
          )}
          {payment && (
            <p>
              <span className="text-on-surface font-medium">Pago:</span>{" "}
              {payment.method === "TARJETA" ? "Tarjeta" : "PSE"} —{" "}
              {payment.status === "completado" ? "Pagado" : "Pendiente"}
            </p>
          )}
        </div>
      </div>

      {/* Review form */}
      {canReview && !reviewSubmitted && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
          <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">
            Califica tu pedido
          </h2>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                className="p-1 transition-all hover:scale-110 active:scale-95"
              >
                <span
                  className={`material-symbols-outlined text-[36px] ${
                    star <= reviewRating
                      ? "text-yellow-500"
                      : "text-outline-variant"
                  }`}
                >
                  {star <= reviewRating ? "star" : "star"}
                </span>
              </button>
            ))}
          </div>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)"
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container outline-none resize-none"
          />

          <Button onClick={handleSubmitReview} loading={submittingReview}>
            Enviar calificación
          </Button>
        </div>
      )}

      {reviewSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-2">
          <span className="material-symbols-outlined text-[36px] text-green-600">
            check_circle
          </span>
          <p className="text-body-md text-green-800 font-body-md font-semibold">
            ¡Gracias por tu calificación!
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.push("/cliente/pedidos")}>
          Mis pedidos
        </Button>
        <Button className="flex-1" onClick={() => router.push("/cliente/explorar")}>
          Seguir explorando
        </Button>
      </div>
    </div>
  );
}
