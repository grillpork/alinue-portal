"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, BadgePercent, Tag, Percent, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

export default function VoucherFormModal({
  isOpen,
  initialData,
  onClose,
  onSubmit,
  busy,
}) {
  const isEdit = !!initialData?.id;

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minSpend, setMinSpend] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || "");
      setTitle(initialData.title || "");
      setDiscountType(initialData.discountType || "percentage");
      setDiscountValue(initialData.discountValue?.toString() || "");
      setMinSpend(initialData.minSpend?.toString() || "0");
      setMaxDiscount(initialData.maxDiscount?.toString() || "");
      setMaxUsage(initialData.maxUsage?.toString() || "");
      setStatus(initialData.status || "active");
    } else {
      setCode("");
      setTitle("");
      setDiscountType("percentage");
      setDiscountValue("15");
      setMinSpend("0");
      setMaxDiscount("");
      setMaxUsage("500");
      setStatus("active");
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  const handleCodeChange = (val) => {
    setCode(val.toUpperCase().replace(/[^A-Z0-9_-]/g, ""));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !title.trim() || !discountValue) return;

    onSubmit({
      code: code.trim(),
      title: title.trim(),
      slug: `commi.co/p/${code.toLowerCase()}`,
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      maxUsage: maxUsage ? Number(maxUsage) : null,
      status,
    });
  };

  const canSubmit = code.trim().length > 0 && title.trim().length > 0 && Number(discountValue) > 0 && !busy;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                <BadgePercent size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {isEdit ? "แก้ไขโค้ดส่วนลด" : "สร้างโค้ดส่วนลดใหม่"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  กำหนดเงื่อนไขส่วนลด ยอดขั้นต่ำ และจำกัดจำนวนสิทธิ์
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Promo Code & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  รหัสโค้ด (Voucher Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น SUMMER2026"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full font-mono font-bold rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 uppercase focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  สถานะการใช้งาน
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                >
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="scheduled">ตั้งเวลาไว้ (Scheduled)</option>
                  <option value="paused">พักชั่วคราว (Paused)</option>
                  <option value="expired">หมดอายุ (Expired)</option>
                </select>
              </div>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ชื่อแคมเปญ / คำอธิบาย <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น แคมเปญลดกระหน่ำต้อนรับซัมเมอร์ 15%"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer",
                    discountType === "percentage"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                  )}
                >
                  <Percent size={13} />
                  <span>เปอร์เซ็นต์ส่วนลด (%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer",
                    discountType === "fixed"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                  )}
                >
                  <Tag size={13} />
                  <span>จำนวนเงินคงที่ (฿)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {discountType === "percentage" ? "ส่วนลด (%)" : "ส่วนลด (บาท)"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === "percentage" ? 100 : 100000}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    ยอดสั่งซื้อขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              {discountType === "percentage" && (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    ส่วนลดสูงสุด (บาท) - เว้นว่างได้
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="เช่น 300"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              )}
            </div>

            {/* Quota Limit */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                จำนวนสิทธิ์สูงสุด (โควต้า)
              </label>
              <input
                type="number"
                min="1"
                placeholder="เว้นว่างหากไม่จำกัดสิทธิ์"
                value={maxUsage}
                onChange={(e) => setMaxUsage(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                {busy ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างโค้ดส่วนลด"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
