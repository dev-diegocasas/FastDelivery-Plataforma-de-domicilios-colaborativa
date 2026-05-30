import { cn } from "@/lib/utils";
import Button from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon = "search_off",
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[64px] text-secondary block mb-4">
        {icon}
      </span>
      <h3 className="text-headline-md text-on-surface font-headline-md font-semibold mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-body-md text-secondary font-body-md max-w-sm mb-6">
          {message}
        </p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          {action.label}
        </Button>
      )}
    </div>
  );
}
