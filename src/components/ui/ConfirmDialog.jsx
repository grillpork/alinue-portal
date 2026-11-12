"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * ConfirmDialog — in-app replacement for window.confirm().
 * Closes on Escape or backdrop click; focus stays inside the dialog.
 */
export default function ConfirmDialog({
  isOpen = false,
  title = "ยืนยันการดำเนินการ?",
  description = "",
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  destructive = false,
  busy = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="ปิดหน้าต่างยืนยัน"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-xs dark:bg-black/65"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 420 }}
            className="relative w-full max-w-sm rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70"
          >
            {/* Layer 1: Header Shell */}
            <div className="px-4 py-3 flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md border shadow-2xs",
                  destructive
                    ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400"
                    : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                )}
              >
                <AlertTriangle size={14} />
              </span>
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                {title}
              </h2>
            </div>

            {/* Layer 2: Inner Content Canvas */}
            <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              {description ? (
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?
                </p>
              )}
            </div>

            {/* Layer 3: Footer Bar */}
            <div className="border-t border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 flex items-center justify-end gap-2 dark:border-zinc-800 dark:bg-zinc-900/70">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer",
                  destructive ? "btn-danger" : "btn-primary",
                )}
              >
                {busy ? "กำลังบันทึก..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
