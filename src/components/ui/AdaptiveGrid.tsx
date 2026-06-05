import { cn } from "@/lib/utils";

interface AdaptiveGridProps {
  children: React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

const colMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const gapMap: Record<number, string> = {
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};

export default function AdaptiveGrid({
  children,
  columns = { default: 1, sm: 2, lg: 3 },
  gap = 4,
  className,
}: AdaptiveGridProps) {
  const base = colMap[columns.default ?? 1] ?? "grid-cols-1";
  const sm = columns.sm ? `sm:${colMap[columns.sm]}` : "";
  const md = columns.md ? `md:${colMap[columns.md]}` : "";
  const lg = columns.lg ? `lg:${colMap[columns.lg]}` : "";
  const xl = columns.xl ? `xl:${colMap[columns.xl]}` : "";
  const gapClass = gapMap[gap] ?? "gap-4";

  return (
    <div className={cn("grid", base, sm, md, lg, xl, gapClass, className)}>
      {children}
    </div>
  );
}
