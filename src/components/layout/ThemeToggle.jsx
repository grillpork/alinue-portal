"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_MODES, useThemeHydrated, useThemeStore } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

const MODE_META = {
  light: { Icon: Sun, label: "สว่าง" },
  dark: { Icon: Moon, label: "มืด" },
  system: { Icon: Monitor, label: "ตามระบบ" },
};

/**
 * ThemeToggle — segmented light / dark / system control.
 * The active segment only renders after hydration, because the persisted mode is
 * unknown during server render (avoids a markup mismatch).
 */
export default function ThemeToggle({ compact = false }) {
  const hydrated = useThemeHydrated();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  // Before hydration the persisted mode is unknown — keep the exact same box height
  // so the control never flashes "nothing selected" and layout cannot shift.
  if (!hydrated) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "h-8 rounded-md bg-zinc-100 dark:bg-zinc-800/80",
          compact && "w-full",
        )}
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="เลือกรูปแบบธีม (Theme)"
      className={cn(
        "flex items-center gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800/80",
        compact && "w-full",
      )}
    >
      {THEME_MODES.map((option) => {
        const { Icon, label } = MODE_META[option];
        const isActive = mode === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={label}
            onClick={() => setMode(option)}
            className={cn(
              "flex h-7 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] text-[11px] font-semibold transition-colors",
              isActive
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
