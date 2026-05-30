"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getRepartidorAvailability,
  toggleAvailability,
} from "@/features/repartidor/repartidor.actions";
import { Button, PageLoading, useToast } from "@/components/ui";

export default function DisponibilidadPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getRepartidorAvailability()
      .then(setIsAvailable)
      .catch(() => addToast("error", "Error al cargar disponibilidad"))
      .finally(() => setLoading(false));
  }, [addToast]);

  async function handleToggle() {
    setToggling(true);
    try {
      const newState = await toggleAvailability();
      setIsAvailable(newState);
      addToast(
        "success",
        newState ? "Estás disponible para recibir pedidos" : "Has desactivado tu disponibilidad",
      );
    } catch {
      addToast("error", "Error al cambiar disponibilidad");
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
        Disponibilidad
      </h1>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-6">
        {/* Status indicator */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isAvailable
                ? "bg-green-100 text-green-600"
                : "bg-surface-container text-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-[48px]">
              {isAvailable ? "toggle_on" : "toggle_off"}
            </span>
          </div>
          <p className="text-title-lg font-semibold text-on-surface font-title-lg">
            {isAvailable ? "Disponible" : "No disponible"}
          </p>
          <p className="text-body-md text-secondary font-body-md">
            {isAvailable
              ? "Recibirás notificaciones de nuevos pedidos disponibles"
              : "Activa tu disponibilidad para recibir pedidos"}
          </p>
        </div>

        {/* Toggle button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleToggle}
          loading={toggling}
          variant={isAvailable ? "outline" : "primary"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isAvailable ? "toggle_off" : "toggle_on"}
          </span>
          {isAvailable
            ? "Desactivar disponibilidad"
            : "Activar disponibilidad"}
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={() => router.push("/repartidor/panel")}
      >
        Volver al panel
      </Button>
    </div>
  );
}
