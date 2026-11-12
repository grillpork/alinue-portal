"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * ฟอร์มเพิ่ม/แก้ไข หมวดหมู่ (หลักหรือย่อย) — ควบคุมด้วย `target` จาก parent
 * target = { type: 'category' | 'sub', mode: 'create' | 'edit', initial: {name, slug, description, image, imageUrl} }
 * slug แก้ได้เฉพาะ mode edit (create server สร้างจาก name ให้อัตโนมัติ)
 */
export default function CategoryFormModal({ target, onClose, onSubmit, busy }) {
  const [name, setName] = useState(() => target?.initial?.name || "");
  const [slug, setSlug] = useState(() => target?.initial?.slug || "");
  const [image, setImage] = useState(
    () => target?.initial?.imageUrl || target?.initial?.image || "",
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!target) return null;

  const isSub = target.type === "sub";
  const isEdit = target.mode === "edit";
  const canSubmit = name.trim().length > 0 && !busy;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const submit = () => {
    if (!canSubmit) return;
    const payload = {
      name: name.trim(),
      description: null,
      image: image || null,
      imageUrl: image || null,
    };
    if (isEdit && slug.trim()) payload.slug = slug.trim();
    onSubmit(payload);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <button
          type="button"
          aria-label="ปิดหน้าต่าง"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-xs dark:bg-black/65"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", damping: 26, stiffness: 420 }}
          className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50/95 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/80 overflow-hidden"
        >
          {/* Layer 1: Header Bar (Tinted Gray Background) */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {isEdit ? "แก้ไข" : "เพิ่ม"}
              {isSub ? "หมวดหมู่ย่อย" : "หมวดหมู่หลัก"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิด"
              className="cursor-pointer rounded-full p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            {/* Layer 2: Inner Canvas (Crisp White Background with Rounded Top & Top Border) */}
            <div className="rounded-t-xl border-t border-zinc-200/90 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Category Name */}
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                ชื่อหมวดหมู่
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={255}
                  placeholder={
                    isSub ? "เช่น Character Illustration" : "เช่น ภาพวาด 2D"
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-750 dark:bg-zinc-800/60 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors"
                />
              </label>

              {/* Main Category Image Upload (Drag and Drop) */}
              {!isSub && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      รูปภาพประจำหมวดหมู่หลัก (Cover / Icon)
                    </label>
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="text-[11px] font-medium text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={11} />
                        <span>ลบรูปภาพ</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />

                  {image ? (
                    /* Image Preview State */
                    <div className="relative group rounded-xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900 p-2 flex items-center gap-3">
                      <div className="size-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0 shadow-xs">
                        <img
                          src={image}
                          alt="Category preview"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          รูปภาพหมวดหมู่พร้อมใช้งาน
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          คลิกเปลี่ยนรูปใหม่ หรือลากไฟล์มาวางทับได้
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors shrink-0 shadow-2xs"
                      >
                        เปลี่ยนรูป
                      </button>
                    </div>
                  ) : (
                    /* Drag & Drop Dropzone */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all",
                        isDragging
                          ? "border-purple-500 bg-purple-50/60 dark:border-purple-400 dark:bg-purple-950/30 scale-[1.01]"
                          : "border-zinc-200/90 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-850 dark:hover:border-zinc-700",
                      )}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="flex size-9 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 shadow-2xs">
                          {isDragging ? (
                            <Upload size={16} className="animate-bounce" />
                          ) : (
                            <ImageIcon size={16} />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {isDragging ? (
                            <span className="text-purple-600 dark:text-purple-400">
                              ปล่อยไฟล์รูปภาพที่นี่
                            </span>
                          ) : (
                            <span>
                              ลากไฟล์รูปภาพมาวางที่นี่ หรือ{" "}
                              <span className="text-[#1b64f2] hover:underline">
                                คลิกเพื่อเลือกไฟล์
                              </span>
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          PNG, JPG, WEBP, SVG ขนาดไม่เกิน 5MB (อัตราส่วน 1:1 หรือ 4:3)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Slug (Edit mode only) */}
              {isEdit && (
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Slug (เว้นว่างไว้ตามเดิม)
                  <input
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    maxLength={255}
                    placeholder="illustration-2d"
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-750 dark:bg-zinc-800/60 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors"
                  />
                </label>
              )}

              {!isEdit && (
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  ระบบจะสร้าง slug จากชื่ออัตโนมัติ (ชื่อซ้ำจะไม่สามารถบันทึกได้)
                </p>
              )}
            </div>

            {/* Layer 3: Footer Bar (Tinted Gray Background) */}
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200/80 bg-zinc-50/95 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-900/80">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary rounded-lg px-5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                {busy
                  ? "กำลังบันทึก…"
                  : isEdit
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มหมวดหมู่"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
