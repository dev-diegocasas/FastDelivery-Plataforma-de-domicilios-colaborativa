"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getRestaurants } from "@/features/orders/orders.actions";
import Chip from "@/components/ui/Chip";
import { RestaurantCard } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { Restaurant } from "@/types";

const CATEGORIES = [
  "Todas",
  "Hamburguesas",
  "Pizza",
  "Sushi",
  "Mexicana",
  "Colombiana",
  "Italiana",
  "China",
  "Pollo",
  "Ensaladas",
  "Postres",
];

export default function ExplorarPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRestaurants(
        search || undefined,
        category || undefined,
      );
      setRestaurants(data as unknown as Restaurant[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(timer);
  }, [fetchRestaurants]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface font-headline-lg">
          Explorar restaurantes
        </h1>
        <p className="text-body-md text-secondary font-body-md mt-1">
          Encuentra tu comida favorita
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar restaurantes…"
          className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md text-body-md focus:ring-0 focus:border-primary-container transition-all outline-none"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            selected={
              cat === "Todas" ? category === null : category === cat
            }
            onClick={() =>
              setCategory(cat === "Todas" ? null : cat)
            }
          />
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-32 bg-surface-container-high" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-surface-container-high rounded" />
                <div className="h-3 w-1/2 bg-surface-container-high rounded" />
                <div className="h-4 w-full bg-surface-container-high rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon="search_off"
          title="No encontramos restaurantes"
          message={
            search || category
              ? "Intenta con otros filtros o términos de búsqueda"
              : "No hay restaurantes disponibles en este momento"
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onClick={() => router.push(`/cliente/restaurante/${r.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
