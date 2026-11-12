"use client";

import { CalendarDays } from "lucide-react";
import { formatFullDate } from "@/lib/formatters";
import { useThemeHydrated } from "@/hooks/useTheme";

/** Today's date, rendered only after hydration so server/client markup matches. */
function TodayDate() {
  const hydrated = useThemeHydrated();
  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200/90 bg-white px-2.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
      <CalendarDays size={14} className="text-zinc-400 dark:text-zinc-500" />
      {hydrated ? formatFullDate() : "—"}
    </span>
  );
}

/**
 * PageHeader — title block for each admin screen (mirrors the FlowAI reference:
 * heading + one-line description on the left, date + primary action on the right).
 */
export default function PageHeader({
  title,
  description,
  actions,
  showDate = true,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>

      {(actions || showDate) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {showDate && <TodayDate />}
          {actions}
        </div>
      )}
    </div>
  );
}
