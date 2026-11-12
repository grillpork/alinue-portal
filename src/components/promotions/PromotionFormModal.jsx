"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, LayoutTemplate } from "lucide-react";
import { cn } from "@/utils/cn";
import VoucherSelectDropdown from "./VoucherSelectDropdown";
import BannerImageUploader from "./BannerImageUploader";

export default function PromotionFormModal({
  isOpen,
  initialData,
  availableVouchers = [],
  onClose,
  onSubmit,
  busy,
}) {
  const isEdit = !!initialData?.id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [placement, setPlacement] = useState("Hero Banner #1 (Main)");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || initialData.targetUrl || "");
      setImage(initialData.image || "");
      setPlacement(initialData.placement || "Hero Banner #1 (Main)");
      setCode(initialData.code || "");
      setStatus(initialData.status || "active");
    } else {
      setTitle("");
      setSlug("commi.co/events/new-promo");
      setImage("/banner1.png");
      setPlacement("Hero Banner #1 (Main)");
      setCode("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      targetUrl: slug.trim(),
      image: image.trim() || null,
      placement,
      code: code ? code.trim() : null,
      status,
    });
  };

  const canSubmit = title.trim().length > 0 && slug.trim().length > 0 && !busy;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                <LayoutTemplate size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {isEdit ? "แก้ไขแบนเนอร์ / แคมเปญ" : "สร้างแบนเนอร์โปรโมชั่นใหม่"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  กำหนดรูปภาพแบนเนอร์ ตำแหน่งแสดงผล และลิงก์ปลายทาง
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Campaign / Banner Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ชื่อแบนเนอร์ / แคมเปญ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Summer Beach Party Live2D & Anime Event"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
              />
            </div>

            {/* Target URL Link */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ลิงก์ปลายทางเมื่อคลิก (Click-through URL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="commi.co/events/summer-beach"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full font-mono rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300"
              />
            </div>

            {/* Placement & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ตำแหน่งแสดงผล (Slot Placement)
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                >
                  <option value="Hero Banner #1 (Main)">Hero Banner #1 (ซ้ายใหญ่)</option>
                  <option value="Hero Banner #2 (Top Right)">Hero Banner #2 (ขวาบน)</option>
                  <option value="Category Header">Category Header (แถบหมวดหมู่)</option>
                  <option value="Popup Announcement">Popup Announcement (ป๊อปอัป)</option>
                  <option value="Top Bar Notification">Top Bar (แถบประกาศด้านบน)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  สถานะการแสดงผล
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                >
                  <option value="active">เปิดแสดงผล (Active)</option>
                  <option value="scheduled">ตั้งเวลาไว้ (Scheduled)</option>
                  <option value="paused">พักการแสดงผล (Paused)</option>
                  <option value="expired">หมดอายุ (Expired)</option>
                </select>
              </div>
            </div>

            {/* Banner Image Drag & Drop Uploader */}
            <BannerImageUploader value={image} onChange={setImage} />

            {/* Optional Promo Code Dropdown */}
            <VoucherSelectDropdown
              value={code}
              onChange={setCode}
              availableVouchers={availableVouchers}
            />

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
                {busy ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างแบนเนอร์"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
