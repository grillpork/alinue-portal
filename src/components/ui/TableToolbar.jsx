"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsUpDown, ListFilter, RotateCcw, Search, X } from "lucide-react";
import FilterSelect from "./FilterSelect";
import { cn } from "@/utils/cn";

/**
 * TableToolbar — Responsive Segmented Search & Filter Toolbar (Cloudflare Style).
 * - Desktop: [ 🔍 Search applications | Show all ↕ | Last modified ↕ | 🔄 ]
 * - Mobile:  [ 🔍 Search applications | ≡ | 🔄 ] -> Bottom Sheet Drawer for filters.
 */
export default function TableToolbar({
  search = {},
  filters = [],
  onRefresh,
  isRefreshing = false,
  actions,
  className = "",
}) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Check if any filter has an active non-default value
  const hasActiveFilters = filters.some(
    (f) => f.value && f.value !== "all" && f.value !== f.options?.[0]?.value,
  );

  return (
    <>
      <div className={cn("flex flex-col gap-2.5 sm:flex-row sm:items-center", className)}>
        {/* Unified Segmented Container */}
        <div className="flex flex-1 items-center rounded-lg border border-zinc-200 bg-white shadow-2xs transition-all focus-within:border-[#1b64f2] focus-within:ring-2 focus-within:ring-[#1b64f2]/10 dark:border-zinc-800 dark:bg-zinc-900">
          {/* 1. Left Search Input Area */}
          <div className="relative flex flex-1 items-center min-w-0 h-9 pl-3 pr-2">
            <Search
              size={14}
              className="pointer-events-none text-zinc-400 dark:text-zinc-500 shrink-0"
            />
            <input
              type="search"
              value={search.value || ""}
              onChange={(event) => search.onChange?.(event.target.value)}
              placeholder={search.placeholder || "Search applications"}
              aria-label={search.placeholder || "Search"}
              className="h-full w-full bg-transparent px-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search.value && (
              <button
                type="button"
                onClick={() => search.onChange?.("")}
                aria-label="ล้างคำค้นหา"
                className="rounded-md p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* 2. Desktop: Individual Filter Segments with Dividers */}
          {filters.length > 0 && (
            <div className="hidden sm:flex items-center h-9">
              {filters.map((filter, idx) => (
                <div
                  key={filter.key || filter.label || idx}
                  className="flex items-center h-9 border-l border-zinc-200 dark:border-zinc-800"
                >
                  <FilterSelect
                    label={filter.label}
                    value={filter.value}
                    onChange={filter.onChange}
                    options={filter.options}
                    variant="segmented"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 3. Mobile: Combined Filter Icon Button (Triggers Bottom Sheet) */}
          {filters.length > 0 && (
            <div className="flex sm:hidden items-center h-9 border-l border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setMobileSheetOpen(true)}
                aria-label="ตัวกรอง (Filters)"
                title="ตัวกรอง (Filters)"
                className="relative flex h-9 w-9 items-center justify-center text-zinc-600 hover:bg-zinc-50/80 hover:text-zinc-900 transition-colors cursor-pointer dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
              >
                <ListFilter size={15} />
                {hasActiveFilters && (
                  <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#1b64f2] ring-2 ring-white dark:ring-zinc-900" />
                )}
              </button>
            </div>
          )}

          {/* 4. Right: Refresh Segment Button (if onRefresh is provided) */}
          {onRefresh && (
            <div className="flex items-center h-9 border-l border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onRefresh}
                aria-label="รีเฟรชข้อมูล (Refresh)"
                title="รีเฟรชข้อมูล (Refresh)"
                className="flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-50/80 hover:text-zinc-800 transition-colors cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200 rounded-r-lg"
              >
                <RotateCcw
                  size={14}
                  className={cn(isRefreshing && "animate-spin text-[#1b64f2]")}
                />
              </button>
            </div>
          )}
        </div>

        {/* Optional Extra Actions (outside toolbar on the right if needed) */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Mobile Filters Bottom Sheet Drawer */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileSheetOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="ตัวกรองข้อมูล"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative z-10 rounded-t-2xl border-t border-zinc-200 bg-white p-5 pb-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Drag Pill Handle */}
              <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  ตัวกรองและจัดเรียง
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  className="rounded-md p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Filter Form Controls */}
              <div className="mt-4 space-y-4">
                {filters.map((filter, idx) => (
                  <div key={filter.key || filter.label || idx} className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {filter.label}
                    </label>
                    <div className="relative">
                      <select
                        value={filter.value}
                        onChange={(e) => filter.onChange?.(e.target.value)}
                        className="h-10 w-full appearance-none rounded-lg border border-zinc-200 bg-white pr-9 pl-3.5 text-xs text-zinc-900 shadow-2xs transition-colors focus:border-[#1b64f2] focus:outline-none focus:ring-2 focus:ring-[#1b64f2]/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 cursor-pointer"
                      >
                        {filter.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronsUpDown
                        size={14}
                        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sheet Actions */}
              <div className="mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  className="btn-primary w-full h-10 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ดูผลลัพธ์
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
