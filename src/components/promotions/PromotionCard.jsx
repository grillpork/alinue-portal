"use client";

import { useState, useRef, useEffect } from "react";
import {
  Activity,
  Check,
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  MoreHorizontal,
  MousePointerClick,
  Pause,
  Pencil,
  Play,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import { toast } from "@/components/ui/Toast";
import { formatCompact, formatCompactRelativeTime, formatNumber } from "@/lib/formatters";
import { cn } from "@/utils/cn";

function WorkerDiamondIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-5 text-[#1b64f2] dark:text-[#3b82f6] shrink-0", className)}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
      <path d="m9 10-2 2 2 2" />
      <path d="m15 10 2 2-2 2" />
    </svg>
  );
}

export default function PromotionCard({
  promotion,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
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

  const handleCopyLink = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(promotion.slug || `https://${promotion.slug}`);
    setCopied(true);
    toast.success("คัดลอกลิงก์แล้ว", promotion.slug);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(promotion.code);
    toast.success("คัดลอกโค้ดแล้ว", promotion.code);
    setMenuOpen(false);
  };

  const requestsCount = promotion.requests ?? promotion.clicks ?? promotion.usageCount ?? 0;
  const impressionsCount = promotion.impressions ?? 0;
  const speedMs = promotion.speedMs ?? 0.3;

  return (
    <div className="group rounded-lg border border-zinc-200/90 bg-zinc-100 shadow-2xs transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 select-none overflow-visible">
      {/* Upper Canvas: Main details */}
      <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border-b border-zinc-200/80">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Thumbnail Preview or Worker Icon */}
          <div className="flex items-start gap-3 min-w-0">
            {promotion.image ? (
              <div className="relative size-9 sm:size-10 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <img
                  src={promotion.image}
                  alt={promotion.title}
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md">
                <WorkerDiamondIcon />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {/* Title & Placement Badge */}
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {promotion.title}
                </h3>
                {promotion.placement && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {promotion.placement}
                  </span>
                )}
                {promotion.code && promotion.code !== promotion.title.toUpperCase() && !promotion.placement && (
                  <span className="font-mono text-[11px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {promotion.code}
                  </span>
                )}
              </div>

              {/* Clickable Underlined URL Link */}
              <div className="mt-0.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="group/link text-xs text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 underline decoration-zinc-300 hover:decoration-blue-500 dark:decoration-zinc-700 dark:hover:decoration-blue-400 transition-colors cursor-pointer flex items-center gap-1 text-left truncate max-w-xs sm:max-w-md"
                  title="คลิกเพื่อคัดลอกลิงก์"
                >
                  <span className="truncate">{promotion.slug}</span>
                  {copied ? (
                    <Check size={11} className="text-emerald-500 shrink-0" />
                  ) : (
                    <Copy
                      size={11}
                      className="opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Timestamp (e.g. 9mo ago) & 3-dot Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium font-sans">
              {formatCompactRelativeTime(promotion.createdAt)}
            </span>

            {promotion.status && promotion.status !== "active" && (
              <StatusChip status={promotion.status} />
            )}

            {/* Three Dots Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="ตัวเลือกเพิ่มเติม"
              >
                <MoreHorizontal size={15} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {promotion.code && (
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Copy size={13} className="text-zinc-400" />
                      <span>คัดลอกโค้ด / ลิงก์</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.(promotion);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Pencil size={13} className="text-zinc-400" />
                    <span>แก้ไขแบนเนอร์</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleStatus?.(promotion);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {promotion.status === "active" ? (
                      <>
                        <Pause size={13} className="text-amber-500" />
                        <span>พักการแสดงผล</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="text-emerald-500" />
                        <span>เปิดแสดงผล</span>
                      </>
                    )}
                  </button>

                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.(promotion);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>ลบ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Inset Footer Bar (Two-Tone Inset Style with rounded bottom) */}
      <div className="rounded-b-lg bg-zinc-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs dark:border-zinc-800/80 dark:bg-zinc-950/50">
        {/* Left: View deployments / live link */}
        <button
          type="button"
          onClick={() => onViewDetails?.(promotion)}
          className="flex items-center gap-1 font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <span>{promotion.image ? "View live banner" : "View deployments"}</span>
          <ExternalLink size={11} className="text-zinc-400" />
        </button>

        {/* Right: Micro stats */}
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          {/* Impressions (if available) */}
          {impressionsCount > 0 && (
            <div className="flex items-center gap-1" title="Impressions (ยอดการมองเห็น)">
              <Eye size={12} className="text-zinc-400" />
              <span>
                {formatCompact(impressionsCount)}{" "}
                <span className="font-sans text-[11px] text-zinc-400">views</span>
              </span>
            </div>
          )}

          {/* Clicks or Requests */}
          <div className="flex items-center gap-1" title={promotion.image ? "Clicks (ยอดคลิก)" : "Requests"}>
            <Activity size={12} className="text-zinc-400" />
            <span>
              {requestsCount}{" "}
              <span className="font-sans text-[11px] text-zinc-400">
                {promotion.image ? "clicks" : "requests"}
              </span>
            </span>
          </div>

          {/* CTR or Speed latency */}
          <div className="flex items-center gap-1" title={promotion.ctr ? "Click-through rate" : "Execution Time"}>
            <Cpu size={12} className="text-zinc-400" />
            <span>
              {promotion.ctr || `${speedMs} ms`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
