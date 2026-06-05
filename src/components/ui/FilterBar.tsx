"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  label?: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FilterBar({
  label,
  options,
  selected,
  onChange,
  className,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-label-md text-on-surface-variant font-label-md">
          {label}
        </p>
      )}

      {/* Desktop: inline chips */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-label-md font-label-md transition-colors border",
              selected === opt.value
                ? "bg-primary-container text-on-primary-container border-primary-container"
                : "bg-transparent text-on-surface-variant border-outline-variant hover:border-primary-container/50",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Mobile: dropdown select */}
      <div className="sm:hidden">
        <select
          value={expanded ? selected : selected}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setExpanded(true)}
          onBlur={() => setExpanded(false)}
          className="w-full h-11 px-4 bg-transparent border border-outline-variant rounded-lg font-body-md text-body-md appearance-none focus:ring-0 focus:border-primary-container outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
