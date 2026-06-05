"use client";

import { useBreakpoint } from "./useBreakpoint";
import type { Breakpoint } from "./useBreakpoint";

type ValueMap<T> = Partial<Record<Breakpoint, T>> & { default: T };

export function useResponsiveValue<T>(map: ValueMap<T>): T {
  const { breakpoint } = useBreakpoint();
  return map[breakpoint] ?? map.default;
}
