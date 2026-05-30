"use client";

import { cn } from "@/lib/utils";
import { createContext, useContext, useState, useCallback } from "react";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: Toast["type"], message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const iconMap: Record<Toast["type"], string> = {
  success: "check_circle",
  error: "cancel",
  info: "info",
  warning: "warning",
};

const colorMap: Record<Toast["type"], string> = {
  success: "bg-green-100 text-green-800 border-green-200",
  error: "bg-error-container text-on-error-container border-error/20",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: Toast["type"], message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg pointer-events-auto",
              "animate-in slide-in-from-right-4 fade-in duration-300",
              colorMap[toast.type],
            )}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">
              {iconMap[toast.type]}
            </span>
            <p className="text-body-sm font-body-sm flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">
                close
              </span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
