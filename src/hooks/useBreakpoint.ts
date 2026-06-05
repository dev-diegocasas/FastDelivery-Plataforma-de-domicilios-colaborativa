"use client";

import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

const queries = [
  "(max-width: 639px)",
  "(min-width: 640px) and (max-width: 1023px)",
  "(min-width: 1024px) and (max-width: 1279px)",
  "(min-width: 1280px)",
] as const;

const labels: Breakpoint[] = ["mobile", "tablet", "desktop", "wide"];

export function useBreakpoint(): { breakpoint: Breakpoint; isMobile: boolean; isTablet: boolean; isDesktop: boolean; isWide: boolean } {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const mqls = queries.map((q) => matchMedia(q));

    function sync() {
      for (let i = mqls.length - 1; i >= 0; i--) {
        if (mqls[i].matches) {
          setBreakpoint(labels[i]);
          return;
        }
      }
      setBreakpoint("mobile");
    }

    sync();
    mqls.forEach((mql) => mql.addEventListener("change", sync));
    return () => mqls.forEach((mql) => mql.removeEventListener("change", sync));
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
    isWide: breakpoint === "wide",
  };
}
