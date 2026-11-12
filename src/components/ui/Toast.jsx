"use client";

import { createContext, useContext } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

const TOAST_DURATION_MS = 3200;

const ICONS = {
  success: { Icon: CircleCheck, class: "text-emerald-500" },
  info: { Icon: Info, class: "text-sky-500" },
  warning: { Icon: TriangleAlert, class: "text-amber-500" },
  error: { Icon: XCircle, class: "text-rose-500" },
};

const useToastStore = create((set, get) => ({
  toasts: [],
  push: (toastInput) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, ...toastInput }] });
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS);
  },
  dismiss: (id) =>
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));

/** Imperative API for non-component modules (service error handlers, etc.). */
export const toast = {
  success: (title, description) =>
    useToastStore.getState().push({ variant: "success", title, description }),
  info: (title, description) =>
    useToastStore.getState().push({ variant: "info", title, description }),
  warning: (title, description) =>
    useToastStore.getState().push({ variant: "warning", title, description }),
  error: (title, description) =>
    useToastStore.getState().push({ variant: "error", title, description }),
};

const ToastContext = createContext(toast);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-4 sm:bottom-4 sm:left-auto sm:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map(({ id, variant, title, description }) => {
            const { Icon, class: iconClass } = ICONS[variant] ?? ICONS.info;
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", damping: 26, stiffness: 420 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-zinc-200/90 bg-white p-3.5 shadow-lg shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40"
              >
                <Icon size={18} className={cn("mt-0.5 shrink-0", iconClass)} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">
                    {title}
                  </p>
                  {description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  aria-label="ปิดการแจ้งเตือน"
                  className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
