"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminFooter from "./AdminFooter";
import GlobalSearchModal from "./GlobalSearchModal";
import { useMobileNav, useSidebarStore } from "@/hooks/useSidebar";
import { useThemeHydrated } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

/**
 * AdminShell — Cloudflare-style layout:
 * - 100% full-width Topbar at the very top.
 * - Sidebar positioned underneath the Topbar.
 * - In collapsed mode: 56px icon rail + smooth flyout overlay on hover without pushing the main canvas.
 */
export default function AdminShell({ children }) {
  const hydrated = useThemeHydrated();
  const storedCollapsed = useSidebarStore((state) => state.collapsed);
  const drawerOpen = useMobileNav((state) => state.open);
  const setDrawerOpen = useMobileNav((state) => state.setOpen);

  const [isHovered, setIsHovered] = useState(false);

  // Persisted collapse is unknown during SSR — gate it to keep markup identical on first paint.
  const isPinnedCollapsed = hydrated && storedCollapsed;
  const isExpanded = !isPinnedCollapsed || isHovered;
  const collapsed = !isExpanded;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] dark:bg-zinc-950">
      {/* 1. Full-width Topbar (Cloudflare style) */}
      <AdminTopbar />

      {/* 2. Body: Sidebar + Main Content */}
      <div className="relative flex flex-1 min-h-[calc(100vh-48px)]">
        {/* Desktop Sidebar Rail Spacer */}
        <div
          aria-hidden="true"
          className={cn(
            "hidden shrink-0 transition-[width] duration-200 ease-out lg:block",
            isPinnedCollapsed ? "w-14" : "w-60",
          )}
        />

        {/* Desktop Sidebar (Fixed under Topbar, with Hover Flyout Overlay when collapsed) */}
        <aside
          onMouseEnter={() => {
            if (isPinnedCollapsed) setIsHovered(true);
          }}
          onMouseLeave={() => {
            if (isPinnedCollapsed) setIsHovered(false);
          }}
          className={cn(
            "fixed top-12 left-0 h-[calc(100vh-48px)] bg-white dark:bg-zinc-900 border-r border-zinc-200/90 dark:border-zinc-800 transition-[width,box-shadow] duration-200 ease-out z-40 hidden lg:flex flex-col select-none overflow-hidden",
            isPinnedCollapsed
              ? isHovered
                ? "w-60 shadow-2xl shadow-zinc-950/20 dark:shadow-black/70"
                : "w-14"
              : "w-60",
          )}
        >
          <AdminSidebar
            collapsed={collapsed}
            onNavigate={() => {
              if (isPinnedCollapsed) setIsHovered(false);
            }}
          />
        </aside>

        {/* Main Canvas Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="p-5 sm:p-6 flex-1">
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <button
              type="button"
              aria-label="ปิดเมนู"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-xs dark:bg-black/70"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 26, stiffness: 420 }}
              className="relative h-full w-[260px] border-r border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <AdminSidebar
                variant="drawer"
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Command Palette / Search Modal (⌘K) */}
      <GlobalSearchModal />
    </div>
  );
}
