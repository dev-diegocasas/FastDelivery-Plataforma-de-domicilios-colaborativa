import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/config/constants";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/config/constants";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

const variantMap: Record<string, string> = {
  default: "bg-surface-container text-on-surface-variant",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm",
        variantMap[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const colorClass = ORDER_STATUS_COLORS[status] ?? "bg-surface-container text-on-surface-variant";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm",
        colorClass,
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm",
        isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          isOpen ? "bg-green-600" : "bg-red-600",
        )}
      />
      {isOpen ? "Abierto" : "Cerrado"}
    </span>
  );
}
