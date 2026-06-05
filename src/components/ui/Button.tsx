import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-on-primary shadow-sm hover:brightness-110 active:scale-[0.98]",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:brightness-110 active:scale-[0.98]",
  destructive:
    "bg-error-container text-on-error-container hover:brightness-110 active:scale-[0.98]",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container active:scale-[0.98]",
  outline:
    "border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 sm:h-9 px-3 text-label-md gap-1",
  md: "h-11 sm:h-10 px-4 text-title-lg gap-2",
  lg: "h-12 px-6 text-title-lg gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-title-lg transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
