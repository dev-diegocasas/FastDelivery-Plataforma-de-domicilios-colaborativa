"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ResponsiveContainer from "@/components/ui/ResponsiveContainer";
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
          <main className="flex-1 py-6 overflow-y-auto">
            <ResponsiveContainer>{children}</ResponsiveContainer>
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
