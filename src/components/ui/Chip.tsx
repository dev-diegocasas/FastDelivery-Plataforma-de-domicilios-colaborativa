import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: string;
  className?: string;
}

export default function Chip({
  label,
  selected,
  onClick,
  icon,
  className,
}: ChipProps) {
  const Component = onClick ? "button" : "span";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-label-sm transition-all whitespace-nowrap",
        selected
          ? "bg-primary-container/20 text-primary border border-primary-container/40"
          : "bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high",
        onClick && "cursor-pointer active:scale-95",
        className,
      )}
    >
      {icon && (
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
      )}
      {label}
    </Component>
  );
}

export function ChipGroup({
  options,
  selected,
  onChange,
  className,
}: {
  options: { label: string; value: string; icon?: string }[];
  selected: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          selected={selected === opt.value}
          onClick={() => onChange(selected === opt.value ? null : opt.value)}
        />
      ))}
    </div>
  );
}
