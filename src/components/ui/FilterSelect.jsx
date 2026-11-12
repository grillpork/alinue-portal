"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronsUpDown, Filter } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * FilterSelect — Segmented / Popover Filter Component.
 * Supports:
 * - 'segmented' (default): Seamless segmented button with text + ChevronsUpDown for unified search bars.
 * - 'pill': Standalone button with + Filter badge.
 */
export default function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  className = "",
  variant = "segmented",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const isDefaultOrAll = !value || value === "all" || value === options[0]?.value;
  const isSort = Boolean(label?.includes?.("เรียง") || label?.toLowerCase?.().includes("sort"));

  const displayText = selectedOption?.label || label || "เลือก";

  if (variant === "pill") {
    return (
      <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer select-none",
            isOpen
              ? "border-[#1b64f2] bg-white ring-2 ring-[#1b64f2]/10 dark:border-[#1b64f2] dark:bg-zinc-900"
              : "border-zinc-200/90 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
            !isDefaultOrAll && "border-blue-200/90 bg-blue-50/30 dark:border-blue-900/60 dark:bg-blue-950/20",
          )}
        >
          {isSort ? (
            <ArrowUpDown size={12} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          ) : (
            <Filter size={12} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          )}
          <span className="text-zinc-600 dark:text-zinc-300">+ {label}</span>
          {selectedOption && !isDefaultOrAll && (
            <span className="ml-0.5 inline-flex items-center gap-1 rounded bg-blue-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              {selectedOption.label}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            role="listbox"
            aria-label={label}
            className="absolute left-0 top-[calc(100%+4px)] z-40 min-w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between px-2 py-1">
              <p className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Filter by {label}
              </p>
            </div>
            <div className="mt-0.5 space-y-0.5 max-h-60 overflow-y-auto thin-scrollbar">
              {options.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer text-left",
                      isSelected
                        ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50",
                    )}
                  >
                    <span className="truncate pr-2">{option.label}</span>
                    {isSelected && <Check size={12} className="text-[#1b64f2] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: Segmented mode (inside the unified search bar)
  return (
    <div ref={containerRef} className={cn("relative flex items-center h-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-9 items-center gap-1.5 px-3.5 text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap",
          isOpen
            ? "bg-zinc-100/90 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-700 hover:bg-zinc-50/80 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
          !isDefaultOrAll && "font-semibold text-zinc-900 dark:text-zinc-100",
        )}
      >
        <span className="truncate">{displayText}</span>
        <ChevronsUpDown size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0 ml-0.5" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-[calc(100%+4px)] z-40 min-w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Filter by {label}
            </p>
          </div>
          <div className="mt-0.5 space-y-0.5 max-h-60 overflow-y-auto thin-scrollbar">
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50",
                  )}
                >
                  <span className="truncate pr-2">{option.label}</span>
                  {isSelected && <Check size={12} className="text-[#1b64f2] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
