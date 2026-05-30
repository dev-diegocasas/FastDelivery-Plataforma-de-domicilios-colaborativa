"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart.context";
import { Button, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function CarritoPage() {
  const router = useRouter();
  const {
    state,
    removeItem,
    updateQuantity,
    updateObservations,
    subtotal,
    clearCart,
  } = useCart();

  if (state.items.length === 0) {
    return (
      <EmptyState
        icon="shopping_cart"
        title="Tu carrito está vacío"
        message="Agrega productos de un restaurante para empezar."
        action={{
          label: "Explorar restaurantes",
          onClick: () => router.push("/cliente/explorar"),
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
          Tu carrito
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-label-md text-error font-label-md hover:underline"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-1">
        <div className="px-4 py-3 border-b border-outline-variant">
          <p className="text-body-md font-semibold text-on-surface font-body-md">
            {state.restaurantName}
          </p>
        </div>

        <div className="divide-y divide-outline-variant/50">
          {state.items.map((item) => (
            <div
              key={item.dish.id}
              className="p-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-body-md font-semibold text-on-surface font-body-md">
                    {item.dish.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeItem(item.dish.id)}
                    className="text-secondary hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-outline-variant rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.dish.id,
                          item.quantity - 1,
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-body-md font-semibold font-body-md text-on-surface">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.dish.id,
                          item.quantity + 1,
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-body-md text-primary font-body-md font-semibold">
                    {formatCurrency(
                      Number(item.dish.price) * item.quantity,
                    )}
                  </span>
                </div>

                <input
                  type="text"
                  value={item.observations}
                  onChange={(e) =>
                    updateObservations(item.dish.id, e.target.value)
                  }
                  placeholder="Observaciones (máx 150 caracteres)"
                  maxLength={150}
                  className="mt-2 w-full h-8 px-3 bg-surface-container border border-outline-variant rounded-lg text-body-sm font-body-sm focus:ring-0 focus:border-primary-container transition-all outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-body-md text-secondary font-body-md">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-body-md text-secondary font-body-md">
          <span>Envío</span>
          <span>Por calcular</span>
        </div>
        <div className="flex justify-between font-title-lg font-title-lg text-on-surface pt-2 border-t border-outline-variant">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={() => router.push("/cliente/confirmar")}
      >
        <span className="material-symbols-outlined text-[20px]">
          shopping_cart_checkout
        </span>
        Continuar con el pedido
      </Button>
    </div>
  );
}
