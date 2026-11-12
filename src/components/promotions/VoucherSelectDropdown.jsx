"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Percent,
  Search,
  Sparkles,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function VoucherSelectDropdown({
  value,
  onChange,
  availableVouchers = [],
  className = "",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Filter only valid, active vouchers with quota and not expired
  const validVouchers = useMemo(() => {
    const now = Date.now();
    return (availableVouchers || []).filter((v) => {
      const isActive = v.status === "active";
      const notExpired = !v.expiresAt || new Date(v.expiresAt).getTime() > now;
      const hasQuota =
        v.maxUsage === null ||
        v.maxUsage === undefined ||
        (v.usageCount || 0) < v.maxUsage;

      return isActive && notExpired && hasQuota;
    });
  }, [availableVouchers]);

  // Currently selected voucher object
  const selectedVoucher = useMemo(() => {
    return (availableVouchers || []).find((v) => v.code === value);
  }, [availableVouchers, value]);

  // Filtered by search query inside picker modal
  const filteredVouchers = useMemo(() => {
    if (!searchQuery.trim()) return validVouchers;
    const q = searchQuery.toLowerCase().trim();
    return validVouchers.filter(
      (v) =>
        v.code?.toLowerCase().includes(q) ||
        v.title?.toLowerCase().includes(q) ||
        String(v.discountValue).includes(q)
    );
  }, [validVouchers, searchQuery]);

  const handleSelect = (codeValue) => {
    onChange(codeValue);
    setIsModalOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    onChange("");
  };

  const formatDaysLeft = (expiresAt) => {
    if (!expiresAt) return "ไม่มีวันหมดอายุ";
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return "หมดอายุแล้ว";
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days === 1) return "หมดอายุวันนี้";
    return `หมดอายุในอีก ${days} วัน`;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Label & Availability Status */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          โค้ดส่วนลดที่แนบกับแบนเนอร์ (ถ้ามี)
        </label>
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          {validVouchers.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              พร้อมใช้งาน {validVouchers.length} โค้ด
            </span>
          ) : (
            "ไม่มีโค้ดที่พร้อมใช้"
          )}
        </span>
      </div>

      {/* Selected Card or Empty Trigger Box */}
      {selectedVoucher ? (
        <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 p-3 dark:border-emerald-800/40 dark:from-emerald-950/20 dark:to-teal-950/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/20 mt-0.5">
                <Ticket className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm tracking-wider text-zinc-900 dark:text-white uppercase">
                    {selectedVoucher.code}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                    {selectedVoucher.discountType === "percentage"
                      ? `ลด ${selectedVoucher.discountValue}%`
                      : `ลด ฿${Number(selectedVoucher.discountValue).toLocaleString()}`}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 line-clamp-1 font-medium">
                  {selectedVoucher.title}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3 text-zinc-400" />
                    {selectedVoucher.maxUsage != null ? (
                      <span>
                        เหลือ{" "}
                        <strong className="text-zinc-800 dark:text-zinc-200">
                          {Math.max(
                            0,
                            selectedVoucher.maxUsage - (selectedVoucher.usageCount || 0)
                          ).toLocaleString()}
                        </strong>{" "}
                        สิทธิ์
                      </span>
                    ) : (
                      "ไม่จำกัดสิทธิ์"
                    )}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3 text-zinc-400" />
                    {formatDaysLeft(selectedVoucher.expiresAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer shadow-xs"
              >
                เปลี่ยนโค้ด
              </button>
              <button
                type="button"
                onClick={handleClear}
                title="ยกเลิกการผูกโค้ด"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-blue-500/50 dark:hover:bg-blue-950/10 cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
              <Tag className="size-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                คลิกเพื่อเลือกโค้ดส่วนลดที่จะผูกกับแบนเนอร์
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {validVouchers.length > 0
                  ? `มี ${validVouchers.length} โค้ดที่กำลังเปิดใช้งานและยังมีสิทธิ์เหลือ`
                  : "ยังไม่มีโค้ดส่วนลดที่พร้อมใช้งาน"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity">
            <span>เลือกโค้ด</span>
            <ChevronRight className="size-4" />
          </div>
        </button>
      )}

      {/* Voucher Selection Modal Dialog (Layered on top of current modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Window Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 z-10 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
                    <Ticket className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      เลือกโค้ดส่วนลดที่พร้อมใช้งาน
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      เฉพาะโค้ดที่ยังไม่หมดอายุและยังมีสิทธิ์คงเหลือ ({validVouchers.length} รายการ)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยรหัสโค้ด เช่น SUMMER2026 หรือชื่อแคมเปญ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Voucher List Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {/* Option: Do not attach promo code */}
                <button
                  type="button"
                  onClick={() => handleSelect("")}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl p-3 text-left transition-all border cursor-pointer",
                    !value
                      ? "border-zinc-400 bg-zinc-100/80 dark:border-zinc-600 dark:bg-zinc-800/80 shadow-xs"
                      : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400">
                      <X className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        ไม่แนบโค้ดส่วนลด (เว้นว่าง)
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        แบนเนอร์จะทำหน้าที่เป็นลิงก์ทั่วไปโดยไม่มีคูปองแนบ
                      </p>
                    </div>
                  </div>
                  {!value && (
                    <div className="size-6 rounded-full bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900 flex items-center justify-center shrink-0">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Valid Voucher Cards */}
                {filteredVouchers.map((v) => {
                  const isSelected = value === v.code;
                  const quotaLeft =
                    v.maxUsage != null
                      ? Math.max(0, v.maxUsage - (v.usageCount || 0))
                      : null;

                  return (
                    <button
                      key={v.id || v.code}
                      type="button"
                      onClick={() => handleSelect(v.code)}
                      className={cn(
                        "w-full rounded-xl p-3.5 text-left transition-all cursor-pointer border group relative",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/40 shadow-sm"
                          : "border-zinc-200/90 bg-white hover:border-blue-300 hover:bg-blue-50/30 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-blue-700/50 dark:hover:bg-blue-950/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {/* Code + Discount Badge */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                              {v.code}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                              {v.discountType === "percentage" ? (
                                <Percent className="size-3 mr-0.5" />
                              ) : (
                                "฿"
                              )}
                              {v.discountType === "percentage"
                                ? `ลด ${v.discountValue}%`
                                : `ลด ฿${Number(v.discountValue).toLocaleString()}`}
                            </span>
                          </div>

                          {/* Title */}
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mt-1">
                            {v.title}
                          </p>

                          {/* Metadata Tags */}
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {/* Remaining Quota */}
                            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-medium">
                              <Users className="size-3 text-zinc-400" />
                              {quotaLeft !== null ? (
                                <span>
                                  เหลือ{" "}
                                  <strong className="text-emerald-600 dark:text-emerald-400">
                                    {quotaLeft.toLocaleString()}
                                  </strong>{" "}
                                  สิทธิ์
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  ไม่จำกัดสิทธิ์
                                </span>
                              )}
                            </span>

                            {/* Expiry Date */}
                            {v.expiresAt && (
                              <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                <Clock className="size-3 text-zinc-400" />
                                {formatDaysLeft(v.expiresAt)}
                              </span>
                            )}

                            {/* Min Spend */}
                            {v.minSpend && (
                              <span className="text-zinc-400">
                                ขั้นต่ำ ฿{Number(v.minSpend).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected ? (
                          <div className="size-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30 mt-0.5">
                            <Check className="size-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="size-7 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors mt-0.5">
                            <ChevronRight className="size-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Empty State */}
                {filteredVouchers.length === 0 && (
                  <div className="py-10 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    <Ticket className="size-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                    <p className="font-semibold text-zinc-600 dark:text-zinc-300">
                      {searchQuery
                        ? "ไม่พบโค้ดที่ตรงกับการค้นหา"
                        : "ไม่มีโค้ดส่วนลดที่พร้อมใช้งานในขณะนี้"}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {searchQuery
                        ? "ลองค้นหาด้วยคำอื่น เช่น SUMMER หรือ 15%"
                        : "โค้ดที่มีอาจหมดอายุหรือถูกใช้งานจนครบสิทธิ์แล้ว"}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3.5 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/50 shrink-0">
                <span className="text-xs text-zinc-400">
                  แสดงผลเฉพาะโค้ดที่มีสถานะ Active เท่านั้น
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer shadow-xs"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
