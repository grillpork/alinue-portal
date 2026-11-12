"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  ImageIcon,
  Maximize2,
  Palette,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import DualBadge from "@/components/ui/DualBadge";
import { getStatus } from "@/lib/statusRegistry";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/utils/cn";

const CATEGORY_LABEL = {
  illustration: "ภาพประกอบ",
  "3d": "3D Model / Asset",
  photo: "ภาพถ่าย",
  music: "ดนตรีและเสียง",
  writing: "งานเขียนและนิยาย",
  comic: "เว็บตูนและการ์ตูน",
  "game-asset": "Game Asset",
  other: "อื่นๆ",
};

export default function CreatorPortfolioDrawer({
  isOpen = false,
  onClose,
  application = null,
  onApprove,
  onReject,
  busy = false,
}) {
  const [selectedImage, setSelectedImage] = useState(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedImage) {
          setSelectedImage(null);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedImage, onClose]);

  if (!application) return null;

  const isPending = application.status === "pending";
  const sampleUrls = application.sampleUrls || [];
  const portfolioUrls = application.portfolioUrls || [];
  const categories = application.categories || [];
  const statusMeta = getStatus(application.status);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-xs"
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 flex w-full max-w-full pl-0 sm:pl-10 justify-end">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`ผลงานของ ${application.displayName}`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-full sm:max-w-2xl bg-white dark:bg-zinc-900 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800 shadow-2xl flex flex-col h-full"
            >
              {/* Drawer Top Header (Sticky) */}
              <div className="bg-zinc-50/95 dark:bg-zinc-900/95 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    <Palette size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                        {application.displayName}
                      </h2>
                      <DualBadge
                        left={{
                          label: statusMeta.labelTh,
                          icon: statusMeta.icon,
                          tone: statusMeta.tone,
                        }}
                        right={
                          application.willSellNsfw
                            ? {
                                label: "18+ NSFW",
                                icon: ShieldAlert,
                                tone: "danger",
                              }
                            : {
                                label: `${sampleUrls.length} รูปตัวอย่าง`,
                                icon: ImageIcon,
                                tone: "neutral",
                              }
                        }
                      />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                      @{application.applicantUsername} · {application.applicantEmail}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body (Hidden Scrollbar) */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                {/* 1. Artist Bio & Categories */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <User size={14} className="text-purple-600 dark:text-purple-400" />
                      <span>ข้อมูลและสไตล์ผลงาน</span>
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      ยื่นเมื่อ: {formatRelativeTime(application.createdAt)}
                    </span>
                  </div>

                  {application.bio && (
                    <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                      &ldquo;{application.bio}&rdquo;
                    </p>
                  )}

                  {/* Categories Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[11px] font-medium border border-purple-200/60 dark:border-purple-900/60"
                      >
                        <Sparkles size={11} className="text-purple-600 dark:text-purple-400" />
                        <span>{CATEGORY_LABEL[cat] ?? cat}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. External Portfolio & Social Links */}
                {portfolioUrls.length > 0 && (
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-2.5">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-600 dark:text-blue-400" />
                      <span>ลิงก์ช่องทางผลงานภายนอก (Portfolio Links)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {portfolioUrls.map((p, idx) => (
                        <a
                          key={idx}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200/90 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-xs text-zinc-800 dark:text-zinc-200 transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold capitalize text-zinc-900 dark:text-zinc-100 block truncate">
                              {p.platform || "Portfolio Link"}
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate block">
                              {p.url}
                            </span>
                          </div>
                          <ArrowUpRight size={14} className="text-zinc-400 group-hover:text-blue-600 transition-colors shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Sample Artwork Gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>ผลงานตัวอย่างที่ส่งแนบ ({sampleUrls.length} ชิ้น)</span>
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      คลิกที่ภาพเพื่อดูขนาดเต็ม
                    </span>
                  </div>

                  {sampleUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {sampleUrls.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedImage(url)}
                          className="group relative aspect-square rounded-xl border border-zinc-200/90 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 overflow-hidden cursor-pointer shadow-2xs hover:shadow-md transition-all hover:scale-[1.02]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`ผลงานตัวอย่างชิ้นที่ ${idx + 1}`}
                            loading="lazy"
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Hover Zoom Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <div className="flex items-center gap-1 text-[11px] font-semibold bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                              <Maximize2 size={12} />
                              <span>ขยายภาพ</span>
                            </div>
                          </div>
                          <span className="absolute bottom-2 right-2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-xs text-zinc-400">
                      ไม่มีการแนบไฟล์รูปภาพตัวอย่าง (ตรวจสอบผ่านลิงก์ Portfolio ด้านบน)
                    </div>
                  )}
                </div>

                {/* 4. Rejection Note if already rejected */}
                {application.status === "rejected" && application.reviewNote && (
                  <div className="rounded-xl border border-rose-200/80 bg-rose-50/60 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 space-y-1">
                    <span className="font-semibold flex items-center gap-1">
                      <AlertTriangle size={13} />
                      เหตุผลที่ปฏิเสธ:
                    </span>
                    <p className="leading-relaxed">{application.reviewNote}</p>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Footer (Sticky Action Bar) */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-200/80 bg-zinc-50/95 dark:border-zinc-800 dark:bg-zinc-900/90 backdrop-blur-sm shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>

                {isPending ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onReject?.(application)}
                      className="btn-danger rounded-lg px-3.5 py-2 text-xs font-semibold cursor-pointer"
                    >
                      <UserX size={13} />
                      <span>ปฏิเสธ</span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onApprove?.(application)}
                      className="btn-primary rounded-lg px-4.5 py-2 text-xs font-semibold cursor-pointer"
                    >
                      <UserCheck size={13} />
                      <span>อนุมัติเป็นศิลปิน</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 font-medium">
                    {application.status === "approved" ? "✓ อนุมัติสิทธิ์เรียบร้อยแล้ว" : "✕ ปฏิเสธใบสมัครแล้ว"}
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Fullscreen Lightbox for Artwork Zoom */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
              >
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={selectedImage}
                  alt="ผลงานขนาดเต็ม"
                  onClick={(e) => e.stopPropagation()}
                  className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl border border-white/15"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
