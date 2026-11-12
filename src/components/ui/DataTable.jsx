import { cn } from "@/utils/cn";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";

/**
 * DataTable — column-config driven table used by every admin list screen.
 * `columns` is data, not markup: [{ key, header, cell(row), align, className }]
 * Handles its own loading skeleton and empty state so pages stay declarative.
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  rowKey = (row) => row.id,
  empty,
  title,
  caption,
  minWidth = "52rem",
  skeletonRows = 6,
  pagination = null,
}) {
  const displayTitle = title || caption;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
      {/* Layer 1: Header Bar (Tinted Gray Background) */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {displayTitle || "รายการข้อมูล"}
        </h2>
        {!loading && (
          <span className="text-[11px] font-medium text-zinc-500">
            {rows.length} รายการ
          </span>
        )}
      </div>

      {/* Layer 2: Inner Table Canvas (Crisp White with Rounded Top & Bottom) */}
      <div className="rounded-t-lg rounded-b-lg border-t border-b border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="thin-scrollbar overflow-x-auto">
          <table
            className="w-full border-collapse text-left"
            style={{ minWidth }}
          >
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 font-medium">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap text-zinc-500 dark:text-zinc-400",
                      column.align === "end" && "text-right",
                      column.align === "center" && "text-center",
                      column.headerClassName,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {loading &&
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-4 py-3.5", column.className)}
                    >
                      <Skeleton
                        className={cn(
                          "h-4",
                          column.key === columns[0].key ? "w-44" : "w-16",
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  {empty ?? (
                    <EmptyState
                      title="ยังไม่มีข้อมูล"
                      description="ลองปรับตัวกรองหรือคำค้นหา"
                    />
                  )}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3.5 align-middle text-sm text-zinc-700 dark:text-zinc-300",
                        column.align === "end" && "text-right",
                        column.align === "center" && "text-center",
                        column.className,
                      )}
                    >
                      {column.cell
                        ? column.cell(row)
                        : String(row[column.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer 3: Inset Footer Bar (Pagination) */}
      {pagination && (
        <div className="border-t border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/70">
          {pagination}
        </div>
      )}
    </div>
  );
}
