"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserOrders } from "@/features/orders/orders.actions";
import { OrderCard } from "@/components/ui/Card";
import { PageLoading, EmptyState } from "@/components/ui";
import type { Order } from "@/types";

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrders()
      .then((data) => {
        setOrders(data as unknown as Order[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title="No tienes pedidos aún"
        message="Realiza tu primer pedido y aparecerá aquí."
        action={{
          label: "Explorar restaurantes",
          onClick: () => router.push("/cliente/explorar"),
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
        Mis pedidos
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            itemCount={(order as any).itemCount}
            onClick={() =>
              router.push(`/cliente/tracking/${order.id}`)
            }
          />
        ))}
      </div>
    </div>
  );
}
