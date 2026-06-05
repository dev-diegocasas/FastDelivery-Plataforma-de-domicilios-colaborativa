import { cn } from "@/lib/utils";

type ResponsiveContainerVariant = "default" | "narrow" | "wide" | "full";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: ResponsiveContainerVariant;
  className?: string;
  as?: "div" | "main" | "section";
}

const maxWidth: Record<ResponsiveContainerVariant, string> = {
  default: "max-w-container-max-width",
  narrow: "max-w-2xl",
  wide: "max-w-6xl",
  full: "max-w-none",
};

export default function ResponsiveContainer({
  children,
  variant = "default",
  className,
  as: Tag = "div",
}: ResponsiveContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        maxWidth[variant],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
