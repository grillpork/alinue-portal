"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

const BADGE_TONES = {
  neutral: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  info: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  danger: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

const DOT_TONES = {
  neutral: "bg-zinc-400",
  info: "bg-sky-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

/**
 * SidebarNavItem — Cloudflare dashboard style:
 * Clean, lightweight row with icon, label, badge or subtle right chevron.
 */
export default function SidebarNavItem({
  item,
  collapsed = false,
  badgeValue,
  onNavigate,
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const { icon: Icon, label, labelEn } = item;

  const tooltipText = badgeValue > 0 ? `${label} (${badgeValue})` : label;

  if (collapsed) {
    return (
      <Link
        href={item.soon ? "#" : item.href}
        title={tooltipText}
        onClick={item.soon ? (e) => e.preventDefault() : onNavigate}
        className={cn(
          "relative flex size-8.5 items-center justify-center rounded-md mx-auto transition-colors",
          isActive
            ? "bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
          item.soon && "opacity-40 cursor-not-allowed",
        )}
      >
        <Icon size={15} className="shrink-0" />
        {badgeValue > 0 && (
          <span
            className={cn(
              "absolute top-1 right-1 size-2 rounded-full ring-2 ring-white dark:ring-zinc-900",
              DOT_TONES[item.tone] ?? DOT_TONES.danger,
            )}
          />
        )}
      </Link>
    );
  }

  if (item.soon) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 cursor-not-allowed opacity-50 select-none"
        title={`${labelEn} · เร็ว ๆ นี้`}
      >
        <Icon size={15} className="shrink-0 text-zinc-400" />
        <span className="truncate flex-1">{label}</span>
        <span className="rounded bg-zinc-100 px-1 py-0.2 text-[9px] font-medium text-zinc-400 dark:bg-zinc-800">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors select-none",
        isActive
          ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
          : "font-normal text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100",
      )}
    >
      <Icon
        size={15}
        className={cn(
          "shrink-0",
          isActive
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200",
        )}
      />
      <span className="truncate flex-1">{label}</span>

      {badgeValue > 0 ? (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums",
            BADGE_TONES[item.tone] ?? BADGE_TONES.neutral,
          )}
        >
          {badgeValue}
        </span>
      ) : (
        <ChevronRight
          size={12}
          className="text-zinc-300 group-hover:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity dark:text-zinc-600 dark:group-hover:text-zinc-400"
        />
      )}
    </Link>
  );
}
