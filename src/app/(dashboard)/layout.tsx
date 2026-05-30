"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { CartProvider } from "@/features/cart/cart.context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen flex bg-surface">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 lg:px-6 py-6 overflow-y-auto">
            <div className="max-w-container-max-width mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
