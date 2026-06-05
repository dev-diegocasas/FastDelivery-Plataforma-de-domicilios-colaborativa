"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { getAllowedRoutes } from "@/config/routes";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const routes = session?.user?.role
    ? getAllowedRoutes(session.user.role)
    : [];

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-sidebar-width bg-surface-container-lowest border-r border-outline-variant flex flex-col transition-transform duration-300 ease-out lg:translate-x-0",
          "pt-[env(safe-area-inset-top,0px)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-outline-variant shrink-0">
          <span className="material-symbols-outlined text-primary text-[28px]">
            local_shipping
          </span>
          <span className="text-title-lg font-bold text-primary tracking-tight font-title-lg">
            FastDelivery
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {routes.map((route) => {
            const isActive = pathname.startsWith(route.path);
            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-body-md font-body-md",
                  isActive
                    ? "bg-primary-container/20 text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[20px]",
                    isActive && "font-variation-settings-700",
                  )}
                >
                  {route.icon}
                </span>
                <span>{route.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-outline-variant shrink-0">
          <Link
            href="/configuracion"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
            <span className="text-body-md font-body-md">Configuración</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
