"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Banknote,
  CircleHelp,
  CornerDownLeft,
  FileText,
  FolderTree,
  HeartHandshake,
  LayoutDashboard,
  Moon,
  Package,
  ReceiptText,
  ScrollText,
  Search,
  Settings,
  ShieldQuestion,
  Sparkles,
  Sun,
  Ticket,
  UserCog,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useThemeStore } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";
import { FLAT_NAV } from "./sidebarNav";

export default function GlobalSearchModal() {
  const router = useRouter();
  const { isOpen, closeSearch, setOpen } = useGlobalSearch();
  const { cycleMode, mode } = useThemeStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Global hotkey: ⌘K or Ctrl+K or / (when not inside an input)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen, closeSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static Action definitions
  const actions = useMemo(
    () => [
      {
        id: "action-theme",
        category: "คำสั่งด่วน (Quick Actions)",
        title: "สลับโหมดสี (Dark / Light Mode)",
        subtitle: `ปัจจุบัน: ${mode === "dark" ? "Dark Mode" : mode === "light" ? "Light Mode" : "System"} (กด Enter เพื่อเปลี่ยน)`,
        icon: mode === "dark" ? Sun : Moon,
        keywords: ["theme", "dark", "light", "โหมดมืด", "โหมดสว่าง", "สี", "ธีม"],
        perform: () => {
          cycleMode();
        },
      },
      {
        id: "action-new-banner",
        category: "คำสั่งด่วน (Quick Actions)",
        title: "ไปที่แท็บ สไลด์แบนเนอร์ (Slide Banners)",
        subtitle: "จัดการแบนเนอร์โปรโมชั่นทั้งหมดบนหน้าเว็บ",
        icon: BadgePercent,
        keywords: ["banner", "แบนเนอร์", "สไลด์", "โปรโมชั่น", "promo"],
        perform: () => router.push("/promotions"),
      },
      {
        id: "action-new-voucher",
        category: "คำสั่งด่วน (Quick Actions)",
        title: "ไปที่แท็บ โค้ดส่วนลด (Vouchers)",
        subtitle: "ดูโค้ดส่วนลดทั้งหมด สิทธิ์คงเหลือ และ GMV",
        icon: Ticket,
        keywords: ["voucher", "coupon", "คูปอง", "โค้ด", "ลดราคา", "promo code"],
        perform: () => router.push("/promotions"),
      },
      {
        id: "action-withdrawals",
        category: "คำสั่งด่วน (Quick Actions)",
        title: "ตรวจสอบคิวถอนเงินศิลปิน (Withdrawals)",
        subtitle: "ดูรายการขอเบิกจ่ายที่รอดำเนินการ",
        icon: Banknote,
        keywords: ["ถอนเงิน", "payout", "withdrawal", "เงิน", "โอนเงิน"],
        perform: () => router.push("/withdrawals"),
      },
      {
        id: "action-creator-app",
        category: "คำสั่งด่วน (Quick Actions)",
        title: "ตรวจสอบใบสมัครศิลปิน (Creator Applications)",
        subtitle: "พิจารณาและอนุมัติผู้สมัคร creator ใหม่",
        icon: UserPlus,
        keywords: ["ใบสมัคร", "creator", "ศิลปิน", "สมัคร", "application"],
        perform: () => router.push("/creator-applications"),
      },
      {
        id: "action-employees",
        category: "คำสั่งด่วน (Quick Actions)",
        title: "จัดการพนักงานและสิทธิ์ทีมงาน (Employees & Staff)",
        subtitle: "เพิ่มผู้ดูแล กำหนดบทบาท แผนก และสิทธิ์การเข้าถึง (RBAC)",
        icon: UserCog,
        keywords: ["employee", "staff", "admin", "พนักงาน", "เจ้าหน้าที่", "ทีมงาน", "สิทธิ์", "rbac"],
        perform: () => router.push("/employees"),
      },
    ],
    [mode, cycleMode, router]
  );

  // Vouchers entity items
  const voucherEntities = useMemo(
    () => [
      {
        id: "voucher-summer26",
        category: "โค้ดส่วนลด & โปรโมชั่น (Vouchers)",
        title: "SUMMER2026 — แคมเปญลดกระหน่ำซัมเมอร์ (ลด 15%)",
        subtitle: "โค้ด Active · เหลือ 152 สิทธิ์ · ยอด GMV ฿148,500",
        icon: Ticket,
        keywords: ["summer", "2026", "summer2026", "15%"],
        perform: () => router.push("/promotions"),
      },
      {
        id: "voucher-welcome50",
        category: "โค้ดส่วนลด & โปรโมชั่น (Vouchers)",
        title: "WELCOME50 — โค้ดต้อนรับสมาชิกใหม่ (ลด ฿50)",
        subtitle: "โค้ด Active · เหลือ 760 สิทธิ์ · ยอด GMV ฿428,000",
        icon: Ticket,
        keywords: ["welcome", "50", "welcome50", "สมาชิกใหม่"],
        perform: () => router.push("/promotions"),
      },
      {
        id: "voucher-creatorvip",
        category: "โค้ดส่วนลด & โปรโมชั่น (Vouchers)",
        title: "CREATORVIP — สิทธิพิเศษสนับสนุนศิลปิน (ลด 20%)",
        subtitle: "โค้ด Active · เหลือ 11 สิทธิ์ · ขั้นต่ำ ฿1,000",
        icon: Ticket,
        keywords: ["creator", "vip", "creatorvip", "20%"],
        perform: () => router.push("/promotions"),
      },
    ],
    [router]
  );

  // Pages from sidebar nav
  const pageItems = useMemo(
    () =>
      FLAT_NAV.map((item) => ({
        id: `page-${item.href}`,
        category: `หน้าและเมนูหลัก (${item.groupLabel || "Navigation"})`,
        title: `${item.label} (${item.labelEn || ""})`,
        subtitle: item.href,
        icon: item.icon || FileText,
        keywords: [
          item.label,
          item.labelEn || "",
          item.href,
          item.groupLabel || "",
        ],
        perform: () => router.push(item.href),
      })),
    [router]
  );

  // Filter items matching query
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default initial suggestions when query is empty
      return [...pageItems.slice(0, 6), ...actions.slice(0, 3)];
    }

    const all = [...pageItems, ...actions, ...voucherEntities];

    return all.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) =>
        k.toLowerCase().includes(q)
      );
      return matchTitle || matchSubtitle || matchKeywords;
    });
  }, [query, pageItems, actions, voucherEntities]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside list
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected) {
        selected.perform();
        closeSearch();
      }
    }
  };

  // Group search results by category
  const groupedResults = useMemo(() => {
    const groups = {};
    searchResults.forEach((item, idx) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push({ ...item, globalIndex: idx });
    });
    return groups;
  }, [searchResults]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-16 sm:pt-24">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSearch}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Search Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-xl shadow-2xl shadow-zinc-950/20 dark:border-zinc-700/80 dark:bg-zinc-900/95 dark:shadow-zinc-950/60 z-10 flex flex-col max-h-[80vh]"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800">
            <Search className="size-5 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="ค้นหาหน้า, คำสั่งลัด, โค้ดส่วนลด หรือเมนู... (พิมพ์เพื่อค้นหา)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 shrink-0">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-4 max-h-[55vh]"
          >
            {Object.keys(groupedResults).length > 0 ? (
              Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    {category}
                  </div>
                  {items.map((item) => {
                    const isSelected = selectedIndex === item.globalIndex;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          item.perform();
                          closeSearch();
                        }}
                        onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all cursor-pointer",
                          isSelected
                            ? "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100 shadow-xs"
                            : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            )}
                          >
                            <IconComponent className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-xs font-semibold truncate",
                                isSelected
                                  ? "text-blue-900 dark:text-blue-100"
                                  : "text-zinc-900 dark:text-zinc-100"
                              )}
                            >
                              {item.title}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {isSelected && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                              กด <CornerDownLeft className="size-3" />
                            </span>
                          )}
                          <ArrowRight
                            className={cn(
                              "size-4 transition-transform",
                              isSelected
                                ? "text-blue-600 dark:text-blue-400 translate-x-0.5"
                                : "text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100"
                            )}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              /* Empty Search State */
              <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                <Search className="size-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  ไม่พบผลการค้นหาสำหรับ &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  ลองค้นหาด้วยคำสำคัญ เช่น โปรโมชั่น, คำสั่งซื้อ, สินค้า, หรือ
                  SUMMER2026
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer Hotkey Guide */}
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 bg-zinc-50/70 text-[11px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-zinc-700 dark:bg-zinc-800">
                  ↑
                </kbd>
                <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-zinc-700 dark:bg-zinc-800">
                  ↓
                </kbd>
                <span>เลือก</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-zinc-700 dark:bg-zinc-800">
                  ↵
                </kbd>
                <span>เปิด</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-zinc-700 dark:bg-zinc-800">
                  ESC
                </kbd>
                <span>ปิด</span>
              </span>
            </div>

            <span className="text-zinc-400 dark:text-zinc-500">
              Global Command Palette
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
