"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart.context";
import {
  getRestaurantById,
  getDishesByRestaurant,
} from "@/features/orders/orders.actions";
import { getRestaurantReviews } from "@/features/reviews/reviews.actions";
import { DishCard } from "@/components/ui/Card";
import { OpenBadge, Button, EmptyState, PageLoading } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Restaurant, Dish } from "@/types";

export default function RestauranteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, addItem, totalItems } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [reviews, setReviews] = useState<
    { id: string; rating: number; comment: string | null; createdAt: Date; clienteName: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [rest, dishList] = await Promise.all([
          getRestaurantById(id),
          getDishesByRestaurant(id),
        ]);
        setRestaurant(rest as unknown as Restaurant);
        setDishes(dishList as unknown as Dish[]);
        getRestaurantReviews(id)
          .then((revs) => setReviews(revs as any))
          .catch(() => {});
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <PageLoading />;

  if (!restaurant) {
    return (
      <EmptyState
        icon="restaurant"
        title="Restaurante no encontrado"
        action={{
          label: "Volver a explorar",
          onClick: () => router.push("/cliente/explorar"),
        }}
      />
    );
  }

  const hasItemsFromOtherRestaurant =
    state.restaurantId && state.restaurantId !== id;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : Number(restaurant.avgRating).toFixed(1);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-container/40 to-secondary-container/40 rounded-xl h-36 sm:h-48 flex items-end p-4 sm:p-6">
        <div>
          <h1 className="text-display-md font-bold text-on-primary-container font-display-md">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-body-md text-on-primary-container font-body-md">
              {restaurant.category}
            </span>
            <OpenBadge isOpen={restaurant.isOpen} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-4 text-body-sm text-secondary font-body-sm">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-yellow-600">
            star
          </span>
          {avgRating} ({reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"})
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          {restaurant.estimatedTime} min
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">payments</span>
          Envío desde {formatCurrency(Number(restaurant.minOrder))}
        </span>
      </div>

      {restaurant.description && (
        <p className="text-body-md text-on-surface font-body-md">
          {restaurant.description}
        </p>
      )}

      {/* Warning: different restaurant in cart */}
      {hasItemsFromOtherRestaurant && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-body-sm text-yellow-800 font-body-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] shrink-0">
            warning
          </span>
          <span>
            Tienes productos de otro restaurante en tu carrito. Al agregar
            productos de {restaurant.name}, se reemplazarán los anteriores.
          </span>
        </div>
      )}

      {/* Menu */}
      <div>
        <h2 className="text-headline-md font-semibold text-on-surface font-headline-md mb-4">
          Menú
        </h2>
        {dishes.length === 0 ? (
          <EmptyState icon="restaurant_menu" title="Menú vacío" />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {dishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish as unknown as Dish}
                onAdd={() => addItem(dish as unknown as Dish, restaurant.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowReviews(!showReviews)}
            className="flex items-center gap-2 text-headline-md font-semibold text-on-surface font-headline-md mb-4 w-full text-left"
          >
            Reseñas ({reviews.length})
            <span className="material-symbols-outlined text-[20px] transition-transform"
              style={{ transform: showReviews ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              expand_more
            </span>
          </button>

          {showReviews && (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-semibold text-on-surface font-body-sm">
                      {review.clienteName ?? "Cliente"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined text-[16px] ${
                            star <= review.rating
                              ? "text-yellow-500"
                              : "text-outline-variant"
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-body-sm text-secondary font-body-sm">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-label-sm text-secondary font-label-sm">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating cart button */}
      {totalItems > 0 && (
        <div className="sticky bottom-4">
          <Button className="w-full shadow-lg" size="lg" onClick={() => router.push("/cliente/carrito")}>
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            Ver carrito ({totalItems} {totalItems === 1 ? "producto" : "productos"})
          </Button>
        </div>
      )}
    </div>
  );
}
