import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/config/constants";
import { ORDER_STATUS_LABELS, ORDER_STATUS } from "@/config/constants";

const STEPS = [
  ORDER_STATUS.RECIBIDO,
  ORDER_STATUS.ACEPTADO,
  ORDER_STATUS.EN_PREPARACION,
  ORDER_STATUS.EN_CAMINO,
  ORDER_STATUS.ENTREGADO,
] as OrderStatus[];

const STEP_ICONS: Record<OrderStatus, string> = {
  RECIBIDO: "receipt",
  ACEPTADO: "check_circle",
  EN_PREPARACION: "cooking",
  EN_CAMINO: "motorcycle",
  ENTREGADO: "check_circle",
  CANCELADO: "cancel",
};

interface TimelineProps {
  currentStatus: OrderStatus;
  className?: string;
}

export default function Timeline({
  currentStatus,
  className,
}: TimelineProps) {
  const currentIndex = STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === ORDER_STATUS.CANCELADO;

  return (
    <div className={cn("space-y-0", className)}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isActive = isCompleted || isCurrent;

        return (
          <div key={step} className="flex items-start gap-4 pb-8 last:pb-0 relative">
            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "absolute left-[15px] top-8 w-0.5 h-8",
                  index < currentIndex
                    ? "bg-primary"
                    : "bg-outline-variant",
                )}
              />
            )}

            {/* Icon circle */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                isCompleted && "bg-primary text-on-primary",
                isCurrent && "bg-primary-container text-on-primary ring-4 ring-primary-container/30",
                !isActive && !isCancelled && "bg-surface-container text-secondary border border-outline-variant",
                isCancelled && "bg-red-100 text-red-600",
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                {STEP_ICONS[step]}
              </span>
            </div>

            {/* Content */}
            <div className="pt-1.5">
              <p
                className={cn(
                  "text-body-md font-semibold font-body-md",
                  isActive && !isCancelled && "text-on-surface",
                  !isActive && !isCancelled && "text-secondary",
                  isCancelled && "text-red-600",
                )}
              >
                {ORDER_STATUS_LABELS[step]}
              </p>
              {isCurrent && (
                <p className="text-body-sm text-primary font-body-sm mt-0.5">
                  {isCancelled
                    ? "Pedido cancelado"
                    : "Estado actual"}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">cancel</span>
          </div>
          <div className="pt-1.5">
            <p className="text-body-md font-semibold text-red-600 font-body-md">
              Cancelado
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
