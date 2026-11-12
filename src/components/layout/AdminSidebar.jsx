"use client";

import { PanelLeft } from "lucide-react";
import { SIDEBAR_NAV } from "./sidebarNav";
import { useOverview } from "@/hooks/useAdminData";
import { useSidebarStore } from "@/hooks/useSidebar";
import SidebarNavItem from "./SidebarNavItem";
import { cn } from "@/utils/cn";

/**
 * AdminSidebar — Cloudflare-style sidebar navigation panel:
 * - Clean hierarchical navigation list with uppercase category headers
 * - Bottom collapse toggle button (square ◫ icon) anchored at the bottom-left
 */
export default function AdminSidebar({
  variant = "rail",
  collapsed = false,
  onNavigate,
}) {
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const { data } = useOverview();

  const badges = data ?? {};

  return (
    <div className="flex h-full flex-col justify-between p-2 select-none overflow-hidden">
      {/* Navigation Tree */}
      <nav
        className="thin-scrollbar min-h-0 flex-1 space-y-3.5 overflow-y-auto overflow-x-hidden py-1 px-1"
        aria-label="เมนูหลัก (Main navigation)"
      >
        {SIDEBAR_NAV.map((group, groupIdx) => (
          <div key={group.label} className="space-y-0.5">
            {collapsed ? (
              groupIdx > 0 && (
                <div className="my-2 mx-auto w-5 border-t border-zinc-200/80 dark:border-zinc-800" />
              )
            ) : (
              <p className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500 whitespace-nowrap">
                {group.label}
              </p>
            )}

            <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  badgeValue={item.badgeKey ? badges[item.badgeKey] : undefined}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Action: Cloudflare-style Square Toggle */}
      {variant === "rail" && (
        <div className="mt-auto border-t border-zinc-200/80 pt-2 dark:border-zinc-800 px-0.5">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "px-1")}>
            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "ขยายเมนู (Expand sidebar)" : "ย่อเมนู (Collapse sidebar)"}
              className={cn(
                "flex items-center gap-2 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 cursor-pointer",
                collapsed ? "size-8.5 justify-center" : "w-full text-xs font-medium",
              )}
            >
              <PanelLeft size={16} className="shrink-0" />
              {!collapsed && <span>ย่อแถบเมนู</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
