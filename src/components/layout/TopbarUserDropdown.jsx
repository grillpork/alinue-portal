"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  LogOut,
  Moon,
  Monitor,
  Pencil,
  ScrollText,
  Settings,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { THEME_MODES, useThemeHydrated, useThemeStore } from "@/hooks/useTheme";
import { storefrontUrl } from "@/lib/links";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { cn } from "@/utils/cn";

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const THEME_LABELS = {
  light: "สว่าง",
  dark: "มืด",
  system: "ตามระบบ",
};

export default function TopbarUserDropdown() {
  const { user, isLoading, logout } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hydrated = useThemeHydrated();
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (isLoading) {
    return (
      <div className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    );
  }

  const displayName = user?.name || user?.username || "ผู้ดูแลระบบ";
  const displayEmail =
    user?.email || (user?.username ? `@${user.username}` : "admin@commi.market");
  const displayRole =
    typeof user?.role === "string"
      ? user.role
      : user?.role?.name || user?.roleName || "Admin";
  const avatarUrl = user?.avatarUrl || user?.image;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger: User Avatar Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="เมนูผู้ใช้งาน"
        title={`${displayName} (${displayRole})`}
        className={cn(
          "flex size-8 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 ring-1 ring-zinc-200 dark:ring-zinc-700 transition-all hover:ring-purple-400 focus:outline-none overflow-hidden text-xs font-semibold select-none",
          open && "ring-2 ring-purple-500 shadow-xs",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl || "/no-image-user-v1.jpg"}
          alt={displayName}
          className="size-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/no-image-user-v1.jpg";
          }}
        />
      </button>

      {/* Dropdown Menu Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-zinc-200/90 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 select-none"
          >
            {/* 1. Header: User Details */}
            <div className="flex items-center gap-2.5 border-b border-zinc-100 px-2.5 py-2.5 dark:border-zinc-800">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-xs text-purple-700 ring-1 ring-zinc-200 dark:bg-purple-950/60 dark:text-purple-300 dark:ring-zinc-700 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || "/no-image-user-v1.jpg"}
                  alt={displayName}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/no-image-user-v1.jpg";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {displayName}
                  </p>
                  <span className="inline-flex items-center gap-0.5 rounded bg-purple-100 px-1 py-0.2 text-[9px] font-medium text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 shrink-0">
                    <ShieldCheck size={9} />
                    {displayRole}
                  </span>
                </div>
                <p className="truncate text-[10px] text-zinc-400 dark:text-zinc-500">
                  {displayEmail}
                </p>
              </div>
            </div>

            {/* 2. Appearance Theme Selector */}
            <div className="px-2.5 py-2">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                <span>ธีมแสดงผล (Appearance)</span>
              </div>
              {hydrated ? (
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/80">
                  {THEME_MODES.map((option) => {
                    const Icon = THEME_ICONS[option];
                    const label = THEME_LABELS[option];
                    const active = themeMode === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setThemeMode(option)}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-md py-1 text-[11px] font-medium transition-all cursor-pointer",
                          active
                            ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-950 dark:text-zinc-50 font-semibold"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
                        )}
                      >
                        <Icon size={12} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              )}
            </div>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* 3. Quick Links */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setEditModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 cursor-pointer"
              >
                <Pencil size={14} className="text-zinc-400" />
                <span>แก้ไขโปรไฟล์ (Edit Profile)</span>
              </button>

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <Settings size={14} className="text-zinc-400" />
                <span>การตั้งค่าระบบ</span>
              </Link>

              <Link
                href="/audit"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <ScrollText size={14} className="text-zinc-400" />
                <span>Audit Log</span>
              </Link>

              <a
                href={storefrontUrl("/")}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink size={14} className="text-zinc-400" />
                  <span>เปิดหน้าร้าน Commi</span>
                </div>
              </a>
            </div>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* 4. Logout Action */}
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await logout();
                if (typeof window !== "undefined") {
                  window.location.href = "/auth";
                }
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <LogOut size={14} />
              <span>ออกจากระบบ</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
}
