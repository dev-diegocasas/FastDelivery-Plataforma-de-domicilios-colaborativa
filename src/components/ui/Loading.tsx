import { cn } from "@/lib/utils";

export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "border-2 border-primary-container border-t-transparent rounded-full animate-spin",
          sizeMap[size],
        )}
      />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="space-y-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-body-md text-secondary font-body-md">Cargando…</p>
      </div>
    </div>
  );
}

const skeletonClasses =
  "animate-pulse bg-surface-container-high rounded-lg";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn(skeletonClasses, className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <Skeleton className="h-32 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <div className="p-4 border-b border-outline-variant bg-surface-container-low">
        <div className="flex gap-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="p-4 border-b border-outline-variant/50 last:border-0"
        >
          <div className="flex gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
