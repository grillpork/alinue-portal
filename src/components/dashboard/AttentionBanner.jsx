"use client";

import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";

/**
 * AttentionBanner — one slim strip listing whatever needs an admin action now.
 * `items` is data: [{ label, href }]; nothing renders when the list is empty.
 */
export default function AttentionBanner({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="รายการที่ต้องดำเนินการ"
      className="flex flex-col gap-3 rounded-lg border border-amber-200/70 bg-amber-50/60 px-4 py-3 sm:flex-row sm:items-center dark:border-amber-500/20 dark:bg-amber-500/5"
    >
      <div className="flex items-start gap-2.5">
        <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <div>
          <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
            มีรายการที่ต้องตรวจสอบ
          </p>
          <p className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-400/80">
            จัดการให้ครบก่อนสิ้นวันเพื่อไม่ให้กระทบผู้ซื้อ
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200/80 transition-colors hover:bg-amber-50 dark:bg-zinc-900 dark:text-amber-300 dark:ring-amber-500/20 dark:hover:bg-zinc-800"
          >
            {item.label}
            <ArrowRight size={12} />
          </Link>
        ))}
      </div>
    </section>
  );
}
