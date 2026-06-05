"use client";

import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, icon, error, options, placeholder, className, ...props },
    ref,
  ) => {
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
          <select
            ref={ref}
            id={props.id}
            className={cn(
              "w-full h-11 sm:h-10 bg-transparent border rounded-lg font-body-md text-body-md appearance-none",
              "focus:ring-0 focus:border-primary-container transition-all outline-none",
              error ? "border-error" : "border-outline-variant",
              icon ? "pl-10" : "pl-4",
              "pr-10",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            <span className="material-symbols-outlined text-[20px]">
              expand_more
            </span>
          </span>
        </div>
        {error && (
          <p className="text-body-sm text-error font-body-sm">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
