"use client";

import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  Search,
  Sparkles,
  SquareDashedBottom,
} from "lucide-react";
import { FLAT_NAV } from "./sidebarNav";
import { useMobileNav } from "@/hooks/useSidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import TopbarUserDropdown from "./TopbarUserDropdown";

/**
 * AdminTopbar — Cloudflare-style full-width top navigation bar.
 * Left: Logo + Account switcher + Breadcrumb
 * Center/Right: Quick Global Search + Ask AI + Consolidated User Dropdown
 */
export default function AdminTopbar() {
  const pathname = usePathname();
  const openMobileNav = useMobileNav((state) => state.setOpen);
  const openSearch = useGlobalSearch((state) => state.openSearch);
  const { user } = useCurrentUser();

  const active = [...FLAT_NAV]
    .reverse()
    .find((item) => pathname.startsWith(item.href));

  const userEmail =
    user?.email || (user?.username ? `@${user.username}` : "admin@commi.market");

  return (
    <header className="sticky top-0 z-50 flex h-12 w-full shrink-0 items-center justify-between border-b border-zinc-200/90 bg-white px-3 sm:px-4 dark:border-zinc-800 dark:bg-zinc-900 select-none">
      {/* Left: Mobile hamburger + Brand & Account Switcher + Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => openMobileNav(true)}
          aria-label="เปิดเมนู"
          className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Menu size={17} />
        </button>

        {/* Cloudflare-style Logo & Account selector pill */}
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-purple-600 text-white shadow-2xs">
            <SquareDashedBottom size={15} />
          </span>

          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 max-w-[200px]"
            title={userEmail}
          >
            <span className="truncate">{userEmail}</span>
            <ChevronDown size={12} className="text-zinc-400 shrink-0" />
          </button>
        </div>

        {/* Breadcrumb separator & active route */}
        <div className="hidden sm:flex items-center gap-2 text-xs border-l border-zinc-200 pl-3 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {active ? active.label : "Overview"}
          </span>
          {active?.labelEn && (
            <span className="text-zinc-400 dark:text-zinc-500">
              {active.labelEn}
            </span>
          )}
        </div>
      </div>

      {/* Right: Quick Search + Ask AI + Consolidated User Dropdown */}
      <div className="flex items-center gap-2">
        {/* Desktop Search Trigger Box */}
        <button
          type="button"
          onClick={openSearch}
          className="hidden md:flex items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 w-44 lg:w-60 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 truncate">
            <Search size={13} className="text-zinc-400 shrink-0" />
            <span className="truncate">ค้นหาหน้า, คำสั่ง...</span>
          </span>
          <kbd className="inline-flex items-center gap-0.5 rounded border border-zinc-200 bg-white px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 shadow-2xs shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon Button */}
        <button
          type="button"
          onClick={openSearch}
          aria-label="ค้นหา"
          className="flex md:hidden rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Search size={16} />
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 cursor-pointer"
        >
          <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
          <span>Ask AI</span>
        </button>

        {/* Consolidated User Dropdown */}
        <TopbarUserDropdown />
      </div>
    </header>
  );
}
