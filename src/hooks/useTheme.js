"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const THEME_MODES = ["light", "dark", "system"];

export function resolveMode(mode) {
  if (mode !== "system") return mode;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle(
    "dark",
    resolveMode(mode) === "dark",
  );
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: "system",
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
      cycleMode: () => {
        const next =
          THEME_MODES[
            (THEME_MODES.indexOf(get().mode) + 1) % THEME_MODES.length
          ];
        applyTheme(next);
        set({ mode: next });
        return next;
      },
    }),
    {
      name: "commi-admin-theme",
      onRehydrateStorage: () => (state) => applyTheme(state?.mode ?? "system"),
    },
  ),
);

/**
 * Persisted stores render a different value on the server (default) than on the
 * first client paint (rehydrated). Gate that markup behind this flag to avoid a
 * hydration mismatch: false on the server and first client render, true after.
 */
export function useThemeHydrated() {
  return useSyncExternalStore(
    () => undefined,
    () => true,
    () => false,
  );
}

if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () =>
      applyTheme(useThemeStore.getState().mode),
    );
}
