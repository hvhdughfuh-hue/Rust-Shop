"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { Check, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  createdAt: number;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 4000;

const typeConfig: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgClass: string;
    borderClass: string;
    barClass: string;
  }
> = {
  success: {
    icon: Check,
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    barClass: "bg-emerald-500",
  },
  error: {
    icon: X,
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    barClass: "bg-red-500",
  },
  info: {
    icon: Info,
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    barClass: "bg-amber-500",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border backdrop-blur-xl
        ${config.bgClass} ${config.borderClass}
        bg-zinc-900/80
        min-w-[320px] max-w-[420px] shadow-2xl shadow-black/30
        animate-slide-in-right
      `}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={`
            flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold
            ${toast.type === "success" ? "bg-emerald-500/20 text-emerald-400" : ""}
            ${toast.type === "error" ? "bg-red-500/20 text-red-400" : ""}
            ${toast.type === "info" ? "bg-amber-500/20 text-amber-400" : ""}
          `}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <p className="flex-1 text-sm text-zinc-200 leading-relaxed pt-0.5">
          {toast.message}
        </p>

        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded hover:bg-zinc-700/50"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-0.5 w-full bg-zinc-800/50">
        <div
          className={`h-full ${config.barClass} animate-progress`}
          style={{ animationDuration: `${TOAST_DURATION}ms` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, createdAt: Date.now() }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
