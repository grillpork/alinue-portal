import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";

/** Windowed page list: 1 … 4 5 [6] 7 8 … 12 (returns numbers and the "gap" marker). */
export function buildPageItems(current, pageCount, siblings = 1) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set([
    1,
    pageCount,
    current,
    current - siblings,
    current + siblings,
  ]);
  const items = [];
  let previous = 0;

  for (const page of [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b)) {
    if (previous && page - previous > 1) items.push("gap");
    items.push(page);
    previous = page;
  }
  return items;
}

export default function TablePagination({
  page,
  pageCount,
  from,
  to,
  total,
  onPageChange,
}) {
  if (pageCount <= 1 && total === 0) return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
        แสดง{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {from}-{to}
        </span>{" "}
        จาก{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {total}
        </span>{" "}
        รายการ
      </p>

      <nav
        aria-label="แบ่งหน้าตาราง (Table pagination)"
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="หน้าก่อนหน้า"
          className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-zinc-200/90 bg-white text-zinc-600 shadow-2xs transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
        >
          <ChevronLeft size={14} />
        </button>

        {buildPageItems(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="flex size-7 items-center justify-center text-zinc-300 dark:text-zinc-600"
            >
              <MoreHorizontal size={14} />
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`ไปหน้า ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "size-7 rounded-md text-xs font-semibold tabular-nums transition-colors cursor-pointer flex items-center justify-center shadow-2xs",
                item === page
                  ? "bg-[#1b64f2] text-white border border-[#1b64f2]"
                  : "border border-zinc-200/90 bg-white text-zinc-600 hover:bg-zinc-100/80 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/80",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="หน้าถัดไป"
          className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-zinc-200/90 bg-white text-zinc-600 shadow-2xs transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
        >
          <ChevronRight size={14} />
        </button>
      </nav>
    </div>
  );
}
