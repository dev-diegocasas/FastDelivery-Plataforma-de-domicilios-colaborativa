import { cn } from "@/lib/utils";
import type { Restaurant, Dish, Order } from "@/types";
import { Badge, OpenBadge, OrderStatusBadge } from "./Badge";
import { formatCurrency } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden",
        hoverable && "cursor-pointer hover:shadow-md hover:border-primary-container/50 transition-all",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between p-4", className)}>
      <div className="min-w-0 flex-1">
        <h3 className="text-title-lg text-on-surface font-title-lg truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-body-sm text-secondary font-body-sm mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 pb-4", className)}>{children}</div>;
}

export function RestaurantCard({
  restaurant,
  onClick,
}: {
  restaurant: Restaurant;
  onClick?: () => void;
}) {
  return (
    <Card hoverable onClick={onClick}>
      <div className="h-32 bg-gradient-to-br from-primary-container/40 to-secondary-container/40 flex items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-primary/60">
          restaurant
        </span>
      </div>
      <CardHeader
        title={restaurant.name}
        subtitle={restaurant.category}
        action={<OpenBadge isOpen={restaurant.isOpen} />}
      />
      <CardContent>
        {restaurant.description && (
          <p className="text-body-sm text-secondary font-body-sm line-clamp-2 mb-3">
            {restaurant.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-body-sm text-secondary font-body-sm">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-yellow-600">
              star
            </span>
            {Number(restaurant.avgRating).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">
              schedule
            </span>
            {restaurant.estimatedTime} min
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">
              payments
            </span>
            Desde {formatCurrency(Number(restaurant.minOrder))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DishCard({
  dish,
  onAdd,
}: {
  dish: Dish;
  onAdd?: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start gap-4 p-4">
        <div className="w-20 h-20 rounded-lg bg-surface-variant shrink-0 flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-[32px] text-secondary">
            restaurant_menu
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-title-lg text-on-surface font-title-lg">
            {dish.name}
          </h4>
          {dish.description && (
            <p className="text-body-sm text-secondary font-body-sm mt-0.5 line-clamp-2">
              {dish.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="font-title-lg text-primary font-title-lg">
              {formatCurrency(Number(dish.price))}
            </span>
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:brightness-110 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function OrderCard({
  order,
  restaurantName,
  itemCount,
  onClick,
}: {
  order: Order;
  restaurantName?: string;
  itemCount?: number;
  onClick?: () => void;
}) {
  return (
    <Card hoverable onClick={onClick}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-title-lg text-on-surface font-title-lg">
              {restaurantName ?? "Restaurante"}
            </h4>
            <p className="text-body-sm text-secondary font-body-sm mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
          <span className="text-body-md text-on-surface font-body-md">
            {itemCount ?? 0} {itemCount === 1 ? "producto" : "productos"}
          </span>
          <span className="font-title-lg text-primary font-title-lg">
            {formatCurrency(Number(order.total))}
          </span>
        </div>
      </div>
    </Card>
  );
}
