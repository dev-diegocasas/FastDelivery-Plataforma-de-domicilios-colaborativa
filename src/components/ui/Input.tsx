"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, helperText, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-label-md text-on-surface-variant font-label-md"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={props.id}
            type={inputType}
            className={cn(
              "w-full h-10 bg-transparent border rounded-lg font-body-md text-body-md",
              "focus:ring-0 focus:border-primary-container transition-all outline-none",
              error
                ? "border-error"
                : "border-outline-variant",
              icon ? "pl-10" : "pl-4",
              isPassword ? "pr-12" : "pr-4",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          )}
        </div>
        {error && (
          <p className="text-body-sm text-error font-body-sm">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-body-sm text-secondary font-body-sm">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
