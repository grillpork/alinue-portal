"use client";

import React from "react";
import { cn } from "@/utils/cn";

const TONE_COLORS = {
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-rose-600 dark:text-rose-400",
  info: "text-sky-600 dark:text-sky-400",
  purple: "text-purple-600 dark:text-purple-400",
  orange: "text-orange-600 dark:text-orange-400",
  neutral: "text-zinc-700 dark:text-zinc-200",
  muted: "text-zinc-400 dark:text-zinc-500",
};

const TONE_BG_TINTS = {
  success: "bg-emerald-500/10",
  warning: "bg-amber-500/10",
  danger: "bg-rose-500/10",
  info: "bg-sky-500/10",
  purple: "bg-purple-500/10",
  orange: "bg-orange-500/10",
  neutral: "bg-zinc-500/10",
  muted: "bg-zinc-500/5",
};

/**
 * DualBadge — Segmented status pill displaying two contextual states separated by a divider.
 *
 * @param {Object} left - { label, icon: Icon, tone: 'success'|'warning'|'danger'|'info'|'purple'|'neutral'|'muted' }
 * @param {Object} right - { label, icon: Icon, tone: 'success'|'warning'|'danger'|'info'|'purple'|'neutral'|'muted' }
 * @param {'sm'|'md'} size - Size variant (default 'sm')
 * @param {string} className - Extra classes
 */
export default function DualBadge({
  left,
  right,
  size = "sm",
  className = "",
}) {
  if (!left && !right) return null;

  const LeftIcon = left?.icon;
  const RightIcon = right?.icon;

  const leftToneClass = left?.tone ? TONE_COLORS[left.tone] : "text-zinc-900 dark:text-zinc-100";
  const rightToneClass = right?.tone ? TONE_COLORS[right.tone] : "text-zinc-600 dark:text-zinc-400";

  const sizeClasses =
    size === "md"
      ? "px-3 py-1 text-xs gap-2"
      : "px-2.5 py-1 text-[11px] gap-1.5";

  const iconSize = size === "md" ? 13.5 : 12;

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-zinc-200/90 bg-white/90 text-zinc-700 shadow-2xs backdrop-blur-xs select-none dark:border-zinc-800/90 dark:bg-zinc-950/70 dark:text-zinc-200",
        sizeClasses,
        className,
      )}
    >
      {/* Left Segment */}
      {left && (
        <div className={cn("inline-flex items-center gap-1.5 font-semibold tracking-tight", leftToneClass)}>
          {LeftIcon && (
            <LeftIcon
              size={iconSize}
              strokeWidth={2.2}
              className={cn("shrink-0", left.tone ? TONE_COLORS[left.tone] : "")}
            />
          )}
          <span>{left.label}</span>
        </div>
      )}

      {/* Hairline Divider */}
      {left && right && (
        <span
          className="mx-0.5 h-3 w-px bg-zinc-200 dark:bg-zinc-800"
          aria-hidden="true"
        />
      )}

      {/* Right Segment */}
      {right && (
        <div className={cn("inline-flex items-center gap-1.5 font-medium tracking-tight", rightToneClass)}>
          {RightIcon && (
            <RightIcon
              size={iconSize}
              strokeWidth={2.2}
              className={cn("shrink-0", right.tone ? TONE_COLORS[right.tone] : "")}
            />
          )}
          <span>{right.label}</span>
        </div>
      )}
    </div>
  );
}
