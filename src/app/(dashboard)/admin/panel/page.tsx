"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminStats } from "@/features/menu/menu.actions";
import { PageLoading, Button, EmptyState } from "@/components/ui";
import { OpenBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  restaurant: { name: string; category: string; isOpen: boolean; estimatedTime: number; minOrder: string };
  activeDishes: number;
  todayOrders: number;
  pendingOrders: number;
  avgRating: number;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((data) => setStats(data as unknown as Stats))
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  // No restaurant — show onboarding
  if (!stats) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[48px] text-primary">
            store
          </span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
          ¡Bienvenido a FastDelivery!
        </h1>
        <p className="text-body-lg text-secondary font-body-lg">
          Aún no tienes un restaurante registrado. Crea tu negocio para
          empezar a gestionar tu menú y recibir pedidos.
        </p>
        <Button
          size="lg"
          onClick={() => router.push("/admin/mi-negocio")}
        >
          <span className="material-symbols-outlined text-[20px]">
            add_business
          </span>
          Crear mi negocio
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center space-y-2">
            <span className="material-symbols-outlined text-[32px] text-primary">
              restaurant_menu
            </span>
            <p className="text-body-sm font-semibold text-on-surface font-body-sm">
              Publica tu menú
            </p>
            <p className="text-body-sm text-secondary font-body-sm">
              Agrega tus platos con precios y descripciones
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center space-y-2">
            <span className="material-symbols-outlined text-[32px] text-primary">
              list_alt
            </span>
            <p className="text-body-sm font-semibold text-on-surface font-body-sm">
              Recibe pedidos
            </p>
            <p className="text-body-sm text-secondary font-body-sm">
              Gestiona pedidos en tiempo real
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center space-y-2">
            <span className="material-symbols-outlined text-[32px] text-primary">
              trending_up
            </span>
            <p className="text-body-sm font-semibold text-on-surface font-body-sm">
              Crece tu negocio
            </p>
            <p className="text-body-sm text-secondary font-body-sm">
              Llega a más clientes cada día
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">Panel</h1>
          <p className="text-body-md text-secondary font-body-md mt-1">{stats.restaurant.name}</p>
        </div>
        <OpenBadge isOpen={stats.restaurant.isOpen} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
          <span className="material-symbols-outlined text-[24px] text-primary">restaurant_menu</span>
          <p className="text-display-md font-bold text-on-surface font-display-md">{stats.activeDishes}</p>
          <p className="text-body-sm text-secondary font-body-sm">Platos activos</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
          <span className="material-symbols-outlined text-[24px] text-blue-600">receipt</span>
          <p className="text-display-md font-bold text-on-surface font-display-md">{stats.todayOrders}</p>
          <p className="text-body-sm text-secondary font-body-sm">Pedidos hoy</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
          <span className="material-symbols-outlined text-[24px] text-yellow-600">pending</span>
          <p className="text-display-md font-bold text-on-surface font-display-md">{stats.pendingOrders}</p>
          <p className="text-body-sm text-secondary font-body-sm">Pendientes</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
          <span className="material-symbols-outlined text-[24px] text-yellow-600">star</span>
          <p className="text-display-md font-bold text-on-surface font-display-md">{stats.avgRating.toFixed(1)}</p>
          <p className="text-body-sm text-secondary font-body-sm">Calificación</p>
        </div>
      </div>

      {/* Restaurant info */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-title-lg font-semibold text-on-surface font-title-lg">Tu restaurante</h2>
          <Button size="sm" variant="ghost" onClick={() => router.push("/admin/mi-negocio")}>
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Editar
          </Button>
        </div>
        <div className="text-body-sm text-secondary font-body-sm space-y-1">
          <p><span className="text-on-surface font-medium">Categoría:</span> {stats.restaurant.category}</p>
          <p><span className="text-on-surface font-medium">Tiempo estimado:</span> {stats.restaurant.estimatedTime} min</p>
          <p><span className="text-on-surface font-medium">Pedido mínimo:</span> {formatCurrency(Number(stats.restaurant.minOrder))}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        <Button variant="outline" className="h-16 sm:h-20 flex-col" onClick={() => router.push("/admin/menu")}>
          <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
          Gestionar menú
        </Button>
        <Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/admin/pedidos")}>
          <span className="material-symbols-outlined text-[24px]">list_alt</span>
          Ver pedidos
        </Button>
      </div>
    </div>
  );
}
