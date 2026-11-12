"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/utils/cn";

/**
 * RowActionsMenu — kebab menu for table rows.
 * Destructive entries declare a `confirm` block; the menu owns the dialog so no
 * page has to wire window.confirm() or duplicate modal state.
 */
export default function RowActionsMenu({
  label = "ตัวเลือกของรายการนี้",
  actions = [],
  busy = false,
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (actions.length === 0) return null;

  const run = (action) => {
    setOpen(false);
    if (action.confirm) {
      setPending(action);
      return;
    }
    action.onSelect();
  };

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={label}
        aria-expanded={open}
        className="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <MoreHorizontal size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border border-zinc-200/90 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                disabled={action.disabled || busy}
                onClick={() => run(action)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  action.tone === "danger"
                    ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800",
                )}
              >
                {action.icon && (
                  <action.icon size={14} className="shrink-0 opacity-70" />
                )}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={Boolean(pending)}
        title={pending?.confirm?.title}
        description={pending?.confirm?.description}
        confirmLabel={pending?.confirm?.confirmLabel}
        destructive={pending?.tone === "danger"}
        busy={busy}
        onClose={() => setPending(null)}
        onConfirm={() => {
          pending?.onSelect();
          setPending(null);
        }}
      />
    </div>
  );
}
