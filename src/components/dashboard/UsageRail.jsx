import Link from "next/link";
import { ArrowRight, ChevronDown, Gauge, Info, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { ADMIN_QUOTA } from "@/components/layout/sidebarNav";
import { formatBaht, formatCompact, formatUsagePeriod } from "@/lib/formatters";
import { cn } from "@/utils/cn";

/**
 * UsageRail — Cloudflare-style right rail: quota meter, a highlighted revenue
 * card with a progress donut, and a 2×2 grid of "needs attention" counters.
 * Purely presentational; fed from the dashboard's overview query.
 */

// Donut ring: fill driven by a real ratio (0–100), centred label shows the value.
function Donut({ percent, centerLabel }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const dash = (clamped / 100) * circ;
  return (
    <div className="relative size-[84px] shrink-0">
      <svg viewBox="0 0 84 84" className="size-full -rotate-90">
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-zinc-200 dark:stroke-zinc-800"
        />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          className="stroke-purple-600"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
        {centerLabel}
      </span>
    </div>
  );
}

function MiniStat({ label, value, loading }) {
  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
        <span className="truncate">{label}</span>
        <Info size={12} className="shrink-0 text-zinc-300 dark:text-zinc-600" />
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-6 w-10" />
      ) : (
        <p className="mt-1 text-[20px] leading-none font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
          {value}
        </p>
      )}
    </div>
  );
}

export default function UsageRail({ data, loading = false, className = "" }) {
  const { used, total, label: quotaLabel } = ADMIN_QUOTA;
  const percent = total ? Math.min(100, Math.round((used / total) * 100)) : 0;

  const revenue30d = data?.revenue30d ?? 0;
  const completionRate = data?.completionRate ?? 0;

  return (
    <aside
      aria-label="การใช้งานและโควตา"
      className={cn("space-y-4", className)}
    >
      {/* Header + primary action */}
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          การใช้งาน
        </h2>
        <Button size="sm">
          <Sparkles size={13} />
          อัปเกรดแผน
        </Button>
      </div>

      {/* Quota meter */}
      <div>
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-zinc-500 dark:text-zinc-400">โควตาวันนี้</span>
          <span className="font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
            {formatCompact(used)} / {formatCompact(total)}
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={quotaLabel}
        >
          <div
            className={cn(
              "h-full rounded-full",
              percent >= 85 ? "bg-amber-500" : "bg-purple-600",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* View limits disclosure */}
      <details className="group border-t border-zinc-200/80 pt-2 dark:border-zinc-800">
        <summary className="flex cursor-pointer list-none items-center justify-end gap-1 text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 [&::-webkit-details-marker]:hidden">
          ดูขีดจำกัด
          <ChevronDown
            size={14}
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {quotaLabel}: {used.toLocaleString()} จาก {total.toLocaleString()}{" "}
          ครั้งต่อรอบบิล ใช้ไปแล้ว {percent}% — อัปเกรดเพื่อเพิ่มโควตา
        </p>
      </details>

      {/* Highlighted revenue card (≈ Cloudflare "Billing Dashboard") */}
      <Link
        href="/support-metrics"
        className="block rounded-lg border border-zinc-200/80 bg-white transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      >
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-3.5 py-2.5 dark:border-zinc-800">
          <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">
            ภาพรวมรายได้
          </span>
          <ArrowRight
            size={15}
            className="text-zinc-400 transition-transform group-hover:translate-x-0.5"
          />
        </div>
        <div className="p-3.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            รายได้ 30 วัน
            <Info size={12} className="text-zinc-300 dark:text-zinc-600" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Donut
              percent={completionRate}
              centerLabel={loading ? "—" : formatBaht(revenue30d)}
            />
            <div className="min-w-0 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                อัตราปิดการขาย {loading ? "—" : `${completionRate}%`}
              </p>
              <p className="mt-0.5">
                {loading
                  ? "กำลังโหลด…"
                  : revenue30d > 0
                    ? "อ้างอิงออเดอร์ที่ชำระแล้ว 30 วัน"
                    : "ยังไม่มีรายได้ในช่วงนี้"}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Period + 2×2 mini stats */}
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
        {formatUsagePeriod(30)}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <MiniStat
          label="คำสั่งซื้อค้าง"
          value={data?.pendingOrders ?? 0}
          loading={loading}
        />
        <MiniStat
          label="ใบสมัครค้าง"
          value={data?.pendingApplications ?? 0}
          loading={loading}
        />
        <MiniStat
          label="รายการถูกรายงาน"
          value={data?.reportedItems ?? 0}
          loading={loading}
        />
        <MiniStat
          label="ผู้ใช้ใหม่ 7 วัน"
          value={data?.newUsers7d ?? 0}
          loading={loading}
        />
      </div>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
        <Gauge size={12} />
        อัปเดตอัตโนมัติทุก 2 นาที
      </p>
    </aside>
  );
}
