"use client";

import { useState, useRef, useEffect } from "react";
import {
  BadgePercent,
  Check,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import { toast } from "@/components/ui/Toast";
import { formatBaht, formatCompactRelativeTime, formatNumber } from "@/lib/formatters";
import { cn } from "@/utils/cn";

export default function VoucherCard({
  voucher,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleCopyCode = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(voucher.code);
    setCopied(true);
    toast.success("คัดลอกโค้ดส่วนลดแล้ว", voucher.code);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(voucher.slug || `commi.co/p/${voucher.code?.toLowerCase()}`);
    toast.success("คัดลอกลิงก์โปรโมชั่นแล้ว", voucher.slug);
  };

  const isPercentage = voucher.discountType === "percentage";
  const discountLabel = isPercentage
    ? `ลด ${voucher.discountValue}%`
    : `ลด ฿${formatNumber(voucher.discountValue)}`;

  return (
    <div className="group rounded-lg border border-zinc-200/90 bg-zinc-100 shadow-2xs transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 select-none overflow-visible">
      {/* Upper Canvas: Voucher Info */}
      <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border-b border-zinc-200/80">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Voucher Icon & Details */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50/80 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              {isPercentage ? <BadgePercent size={18} /> : <Tag size={18} />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {voucher.title}
                </h3>
                {/* 1-click Copyable Promo Code Badge */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="คลิกเพื่อคัดลอกโค้ด"
                >
                  <span>{voucher.code}</span>
                  {copied ? (
                    <Check size={11} className="text-emerald-500" />
                  ) : (
                    <Copy size={11} className="opacity-60" />
                  )}
                </button>
              </div>

              {/* Conditions line */}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {discountLabel}{" "}
                {voucher.minSpend > 0 && (
                  <span>· ขั้นต่ำ ฿{formatNumber(voucher.minSpend)}</span>
                )}
                {voucher.maxDiscount && (
                  <span> · ลดสูงสุด ฿{formatNumber(voucher.maxDiscount)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Timestamp & Status & 3-dot Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium font-sans">
              {formatCompactRelativeTime(voucher.createdAt)}
            </span>

            <StatusChip status={voucher.status} />

            {/* Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <MoreHorizontal size={15} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Copy size={13} className="text-zinc-400" />
                    <span>คัดลอกโค้ด</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.(voucher);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Pencil size={13} className="text-zinc-400" />
                    <span>แก้ไขโค้ด</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleStatus?.(voucher);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {voucher.status === "active" ? (
                      <>
                        <Pause size={13} className="text-amber-500" />
                        <span>พักการใช้งาน</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="text-emerald-500" />
                        <span>เปิดใช้งาน</span>
                      </>
                    )}
                  </button>

                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.(voucher);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>ลบโค้ด</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Inset Footer Bar */}
      <div className="rounded-b-lg bg-zinc-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs dark:border-zinc-800/80 dark:bg-zinc-950/50">
        <button
          type="button"
          onClick={() => onViewDetails?.(voucher)}
          className="flex items-center gap-1 font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <span>ดูคำสั่งซื้อที่ใช้โค้ดนี้</span>
          <ExternalLink size={11} className="text-zinc-400" />
        </button>

        {/* Right Stats */}
        <div className="flex items-center gap-3.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1" title="จำนวนครั้งที่ใช้ / โควต้า">
            <Users size={12} className="text-zinc-400" />
            <span>
              {formatNumber(voucher.usageCount || 0)}
              {voucher.maxUsage ? ` / ${formatNumber(voucher.maxUsage)}` : ""}{" "}
              <span className="font-sans text-[11px] text-zinc-400">used</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-200 font-semibold" title="ยอดขายรวมที่เกิดขึ้น">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>{formatBaht(voucher.totalGmv || 0)}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles size={12} />
            <span>{discountLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
