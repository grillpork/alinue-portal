"use client";

import { create } from "zustand";

export const useGlobalSearch = create((set, get) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set({ isOpen: !get().isOpen }),
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
}));
