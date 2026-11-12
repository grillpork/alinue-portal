"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Sidebar state: desktop rail collapse (persisted) + mobile drawer (session only).
 * Kept in one store so the topbar button and the sidebar never drift out of sync.
 */
export const useSidebarStore = create(
  persist(
    (set, get) => ({
      collapsed: false,
      toggleCollapsed: () => set({ collapsed: !get().collapsed }),
    }),
    { name: "commi-admin-sidebar" },
  ),
);

/** Mobile drawer visibility — intentionally not persisted. */
export const useMobileNav = create((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}));
