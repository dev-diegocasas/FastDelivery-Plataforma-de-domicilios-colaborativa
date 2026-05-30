"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart.context";
import {
  getUserAddresses,
  createOrder,
} from "@/features/orders/orders.actions";
import { Button, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { Address } from "@/types";

export default function ConfirmarPage() {
  const router = useRouter();
  const { state, subtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [method, setMethod] = useState<"TARJETA" | "PSE">("TARJETA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    getUserAddresses().then((data) => {
      const addrs = data as unknown as Address[];
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    });
  }, []);

  async function handleSubmit() {
    setError(null);
    const deliveryAddr = selectedAddressId
      ? addresses.find((a) => a.id === selectedAddressId)?.address
      : newAddress;

    if (!deliveryAddr) {
      setError("Selecciona o ingresa una dirección de entrega");
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder({
        restaurantId: state.restaurantId!,
        items: state.items.map((i) => ({
          dishId: i.dish.id,
          quantity: i.quantity,
          unitPrice: i.dish.price.toString(),
          observations: i.observations,
        })),
        total: subtotal.toString(),
        deliveryAddress: deliveryAddr,
        observations: observations || undefined,
        paymentMethod: method,
      });

      clearCart();
      router.push(`/cliente/tracking/${(order as any).id}`);
    } catch {
      setError("Ocurrió un error al crear el pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (mounted && state.items.length === 0) {
    return (
      <EmptyState
        icon="shopping_cart"
        title="No hay productos en tu carrito"
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
        Confirmar pedido
      </h1>

      {/* Restaurant + Items summary */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3">
        <p className="font-title-lg text-on-surface font-title-lg font-semibold">
          {state.restaurantName}
        </p>
        {state.items.map((item) => (
          <div
            key={item.dish.id}
            className="flex items-center justify-between text-body-md font-body-md"
          >
            <span className="text-on-surface">
              {item.quantity}x {item.dish.name}
            </span>
            <span className="text-on-surface font-semibold">
              {formatCurrency(Number(item.dish.price) * item.quantity)}
            </span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-outline-variant font-title-lg font-title-lg">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container rounded-xl p-4 text-body-sm font-body-sm">
          {error}
        </div>
      )}

      {/* Address */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3">
        <h2 className="font-title-lg text-on-surface font-title-lg font-semibold">
          Dirección de entrega
        </h2>

        {addresses.length > 0 && (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedAddressId === addr.id
                    ? "border-primary-container bg-primary-fixed/10"
                    : "border-outline-variant hover:border-primary-container/50"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1 accent-primary-container"
                />
                <div>
                  {addr.label && (
                    <p className="text-body-sm font-semibold text-on-surface font-body-sm">
                      {addr.label}
                    </p>
                  )}
                  <p className="text-body-sm text-secondary font-body-sm">
                    {addr.address}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div>
          <p className="text-body-sm text-secondary font-body-sm mb-2">
            {addresses.length > 0
              ? "O ingresa una dirección diferente:"
              : "Ingresa tu dirección de entrega:"}
          </p>
          <input
            type="text"
            value={newAddress}
            onChange={(e) => {
              setNewAddress(e.target.value);
              setSelectedAddressId(null);
            }}
            placeholder="Dirección"
            className="w-full h-10 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
          />
        </div>
      </div>

      {/* Observations */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
        <label className="text-label-md text-on-surface-variant font-label-md block">
          OBSERVACIONES DEL PEDIDO
        </label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Ej: Llamar antes de entregar, portón verde..."
          maxLength={500}
          rows={3}
          className="w-full px-4 py-3 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none resize-none"
        />
      </div>

      {/* Payment method */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3">
        <h2 className="font-title-lg text-on-surface font-title-lg font-semibold">
          Método de pago
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("TARJETA")}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              method === "TARJETA"
                ? "border-primary-container bg-primary-fixed/10"
                : "border-outline-variant hover:border-primary-container/50"
            }`}
          >
            <span className="material-symbols-outlined text-[24px] text-primary block mb-1">
              credit_card
            </span>
            <span className="text-body-sm font-semibold text-on-surface font-body-sm">
              Tarjeta
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMethod("PSE")}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              method === "PSE"
                ? "border-primary-container bg-primary-fixed/10"
                : "border-outline-variant hover:border-primary-container/50"
            }`}
          >
            <span className="material-symbols-outlined text-[24px] text-primary block mb-1">
              account_balance
            </span>
            <span className="text-body-sm font-semibold text-on-surface font-body-sm">
              PSE
            </span>
          </button>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        loading={loading}
      >
        {loading ? "Procesando…" : `Pagar ${formatCurrency(subtotal)}`}
      </Button>
    </div>
  );
}
