"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  RefreshCw,
  Link2,
  CheckCircle2,
  FileImage,
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function BannerImageUploader({
  value,
  onChange,
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState("file"); // "file" | "url"
  const [urlInput, setUrlInput] = useState(value || "");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileProcess = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WEBP, GIF)");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        onChange(result);
        setUrlInput(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileProcess(file);
    }
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    onChange("");
    setUrlInput("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyUrl = (url) => {
    setUrlInput(url);
    onChange(url);
    setFileName(url.startsWith("/") ? url.replace("/", "") : "URL Image");
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          รูปภาพแบนเนอร์ (Banner Image) <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg dark:bg-zinc-800 text-[11px]">
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer",
              uploadMode === "file"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            อัปโหลดไฟล์ (DnD)
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("url")}
            className={cn(
              "px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer",
              uploadMode === "url"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            ระบุ URL
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag and Drop Zone / Image Preview */}
      {value ? (
        /* Image Preview Box */
        <div className="relative group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900/5 dark:border-zinc-700">
          <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
            <img
              src={value}
              alt="Banner Preview"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top Bar inside preview */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10">
                <CheckCircle2 className="size-3 text-emerald-400" />
                {fileName || "แบนเนอร์ที่เลือก"}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-md hover:bg-black/80 border border-white/15 transition-colors cursor-pointer"
                  title="เปลี่ยนรูปภาพ"
                >
                  <RefreshCw className="size-3" />
                  เปลี่ยนรูป
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-md bg-black/60 text-white/80 hover:text-white hover:bg-red-600/80 backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
                  title="ลบรูปภาพ"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-2 left-2 text-[10px] text-white/80 pointer-events-none drop-shadow-sm font-medium">
              สัดส่วนแสดงผลสำหรับแบนเนอร์โปรโมชั่น
            </div>
          </div>
        </div>
      ) : uploadMode === "file" ? (
        /* DnD Upload Area */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center select-none",
            isDragging
              ? "border-blue-500 bg-blue-50/70 ring-4 ring-blue-500/20 dark:border-blue-400 dark:bg-blue-950/30 scale-[1.01]"
              : "border-zinc-300 bg-zinc-50/60 hover:border-blue-400 hover:bg-blue-50/20 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-blue-500/50"
          )}
        >
          <div
            className={cn(
              "size-11 rounded-2xl flex items-center justify-center mb-2.5 transition-all",
              isDragging
                ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30"
                : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"
            )}
          >
            <UploadCloud className="size-5.5 stroke-[2.2]" />
          </div>

          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {isDragging
              ? "ปล่อยไฟล์ที่นี่เพื่ออัปโหลดทันที"
              : "ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์"}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            รองรับไฟล์ PNG, JPG, WEBP, GIF (แนะนำขนาด 1200×500 px หรือ 16:9)
          </p>
        </div>
      ) : (
        /* URL Input Area */
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="https://example.com/banner.png หรือ /banner1.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyUrl(urlInput);
                  }
                }}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-8 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApplyUrl(urlInput)}
              disabled={!urlInput.trim()}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              นำไปใช้
            </button>
          </div>
        </div>
      )}

      {/* Quick Template Presets */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className="text-[11px] text-zinc-400 font-medium">ภาพตัวอย่าง:</span>
        <button
          type="button"
          onClick={() => handleApplyUrl("/banner1.png")}
          className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium"
        >
          ใช้ /banner1.png
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <button
          type="button"
          onClick={() => handleApplyUrl("/banner2.png")}
          className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium"
        >
          ใช้ /banner2.png
        </button>
      </div>
    </div>
  );
}
