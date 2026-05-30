"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Button from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";

function PagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get("success");

  if (success === "true") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-16">
        <span className="material-symbols-outlined text-[96px] text-green-500">
          check_circle
        </span>
        <h1 className="text-display-md font-bold text-on-surface font-display-md">
          ¡Pago exitoso!
        </h1>
        <p className="text-body-lg text-secondary font-body-lg">
          Tu pedido ha sido confirmado y está siendo procesado por el
          restaurante.
        </p>
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() =>
              router.push("/cliente/pedidos")
            }
          >
            Ver mis pedidos
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              router.push("/cliente/explorar")
            }
          >
            Seguir explorando
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-16">
      <span className="material-symbols-outlined text-[96px] text-error">
        cancel
      </span>
      <h1 className="text-display-md font-bold text-on-surface font-display-md">
        Pago fallido
      </h1>
      <p className="text-body-lg text-secondary font-body-lg">
        No fue posible procesar el pago. Intenta nuevamente.
      </p>
      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={() => router.push("/cliente/confirmar")}
        >
          Reintentar pago
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/cliente/explorar")}
        >
          Explorar restaurantes
        </Button>
      </div>
    </div>
  );
}

export default function PagoPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PagoContent />
    </Suspense>
  );
}
