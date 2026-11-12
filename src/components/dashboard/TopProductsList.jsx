import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import InitialTile from "@/components/ui/InitialTile";
import StatusChip from "@/components/ui/StatusChip";
import { formatBaht, formatNumber } from "@/lib/formatters";

/** Top-earning products, ranked with a proportional bar for instant comparison. */
export default function TopProductsList({ products = [], loading = false }) {
  const maxRevenue = Math.max(...products.map((item) => item.revenue), 1);

  return (
    <section className="rounded-lg border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">
          <Trophy size={14} className="text-amber-500" />
          สินค้ารายได้สูงสุด
        </h2>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ดูทั้งหมด
          <ArrowUpRight size={12} />
        </Link>
      </header>

      <ul className="mt-3 space-y-1">
        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 px-1 py-2.5">
              <span className="size-8 shrink-0 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <span className="h-3.5 flex-1 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </li>
          ))}

        {!loading &&
          products.map((product, index) => (
            <li key={product.id}>
              <div className="flex items-center gap-3 rounded-md px-1.5 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <span className="w-4 shrink-0 text-[11px] font-semibold text-zinc-400 tabular-nums dark:text-zinc-500">
                  {index + 1}
                </span>
                <InitialTile label={product.name} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                    {product.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 tabular-nums dark:text-zinc-500">
                      {formatNumber(product.sales)} ขาย
                    </span>
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <span
                        className="block h-full rounded-full bg-purple-500/70"
                        style={{
                          width: `${Math.round((product.revenue / maxRevenue) * 100)}%`,
                        }}
                      />
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
                    {formatBaht(product.revenue)}
                  </p>
                  <StatusChip status={product.status} className="mt-0.5" />
                </div>
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}
