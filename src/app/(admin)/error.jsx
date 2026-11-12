"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AdminError({ error, reset }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
        <TriangleAlert size={22} />
      </div>
      <h2 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        โหลดข้อมูลหน้านี้ไม่สำเร็จ
      </h2>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {error?.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง"}
      </p>
      <Button className="mt-5" onClick={reset}>
        <RotateCcw size={14} />
        ลองใหม่อีกครั้ง
      </Button>
    </div>
  );
}
