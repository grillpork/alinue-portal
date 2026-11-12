"use client";

import { useState } from "react";
import {
  Coins,
  HeartHandshake,
  Sprout,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { MoneyCell, TimeCell } from "@/components/shared/cells";
import { useSupportMetrics } from "@/hooks/useAdminData";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { cn } from "@/utils/cn";

const WINDOWS = [
  { value: 7, label: "7 วัน" },
  { value: 30, label: "30 วัน" },
  { value: 90, label: "90 วัน" },
];

const SOURCE_LABEL = {
  x_share: "แชร์จาก X",
  line_share: "แชร์จาก LINE",
  facebook_share: "แชร์จาก Facebook",
  copy_link: "คัดลอกลิงก์",
  profile: "หน้าโปรไฟล์",
  search: "ค้นหา/SEO",
  direct: "ตรงเข้าเว็บ",
};

function TwoToneStatCard({ icon: Icon, label, value, hint, hintClass, loading }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
      {/* Layer 1: Header Bar (Tinted Gray Background) */}
      <div className="flex items-center gap-2 px-3.5 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
          {Icon ? <Icon size={13} /> : null}
        </span>
        <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
      </div>

      {/* Layer 2: Inner Canvas (Crisp White Background with Rounded Top & Top Border) */}
      <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1">
        {loading ? (
          <div className="h-7 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
            {value}
          </p>
        )}

        {hint && !loading && (
          <p
            className={cn(
              "mt-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500",
              hintClass,
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SupportMetricsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useSupportMetrics(days);

  const support = data?.support ?? {};
  const adoption = data?.adoption ?? {};
  const adoptionRate =
    adoption.totalArtists > 0
      ? (adoption.pwywArtists / adoption.totalArtists) * 100
      : 0;
  const maxSource = Math.max(1, ...(data?.bySource ?? []).map((s) => s.count));
  const recentSupports = data?.recentSupports ?? [];

  return (
    <div className="space-y-5 select-none">
      <PageHeader
        title="สถิติให้กำลังใจ (Support)"
        description="วัดผลระบบ PWYW — อัตราดาวน์โหลด→จ่ายเงิน, ศิลปินที่ใช้งาน, และช่องทางที่พาคนเข้ามา"
        actions={
          <div
            className="inline-flex rounded-md border border-zinc-200/90 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs"
            role="group"
            aria-label="เลือกช่วงเวลา"
          >
            {WINDOWS.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => setDays(w.value)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  days === w.value
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
        }
      />

      {/* 1. Six Two-Tone KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
        <TwoToneStatCard
          icon={HeartHandshake}
          label="ยอดรับไฟล์ (pwyw)"
          value={formatNumber(support.claims ?? 0)}
          hint={`รอชำระ ${support.pendingClaims ?? 0}`}
          loading={isLoading}
        />
        <TwoToneStatCard
          icon={TrendingUp}
          label="อัตราจ่ายเงิน"
          value={formatPercent(support.conversionRate ?? 0)}
          hint="เป้าสุขภาพดี: ≥ 2%"
          hintClass={
            (support.conversionRate ?? 0) >= 2
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : undefined
          }
          loading={isLoading}
        />
        <TwoToneStatCard
          icon={Wallet}
          label="รายได้สู่ศิลปิน"
          value={`฿${formatNumber(support.revenue ?? 0)}`}
          loading={isLoading}
        />
        <TwoToneStatCard
          icon={Coins}
          label="เฉลี่ยต่อครั้ง"
          value={`฿${formatNumber(support.avgSupport ?? 0)}`}
          loading={isLoading}
        />
        <TwoToneStatCard
          icon={Sprout}
          label="ลูกค้าใหม่"
          value={formatNumber(support.firstTimeSupporters ?? 0)}
          hint={`รวม ${support.uniqueSupporters ?? 0} คน`}
          loading={isLoading}
        />
        <TwoToneStatCard
          icon={Users}
          label="ศิลปินเปิดใช้"
          value={`${adoptionRate.toFixed(0)}%`}
          hint={`${adoption.pwywArtists ?? 0}/${adoption.totalArtists ?? 0} คน`}
          loading={isLoading}
        />
      </div>

      {/* 2. Main Content Grid (By Source Breakdown + Recent Supports Table) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 items-start">
        {/* Left Column (1 col): By Source Breakdown Card */}
        <section className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
          {/* Layer 1: Header Bar */}
          <div className="px-4 py-2.5">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              ช่องทางที่พาคนมาจ่าย
            </h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              จาก <code className="font-mono bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.2 rounded">?ref=</code> ของลิงก์แชร์
            </p>
          </div>

          {/* Layer 2: Inner Canvas */}
          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3.5">
            {(data?.bySource ?? []).map((s) => (
              <div key={s.source}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">
                    {SOURCE_LABEL[s.source] ?? s.source}
                  </span>
                  <span className="text-zinc-400 tabular-nums text-[11px]">
                    {s.count} ครั้ง · ฿{formatNumber(s.revenue)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#1b64f2] transition-all duration-300"
                    style={{ width: `${(s.count / maxSource) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {!isLoading && (data?.bySource ?? []).length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-4">
                ยังไม่มีข้อมูลในช่วงนี้
              </p>
            )}
          </div>
        </section>

        {/* Right Column (2 cols): Recent Supports Table */}
        <div className="xl:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
          {/* Layer 1: Header Bar */}
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake size={14} className="text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                รายการให้กำลังใจล่าสุด
              </h2>
            </div>
            <span className="text-[11px] font-medium text-zinc-500">
              {recentSupports.length} รายการ
            </span>
          </div>

          {/* Layer 2: Inner Table Canvas */}
          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      ผู้ให้กำลังใจ
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      ผลงานที่ซัพพอร์ต
                    </th>
                    <th className="hidden md:table-cell py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      มาจาก
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                      จำนวน
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                      เมื่อ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        กำลังโหลดข้อมูล…
                      </td>
                    </tr>
                  ) : recentSupports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        <EmptyState
                          icon={HeartHandshake}
                          title="ยังไม่มีคนให้กำลังใจในช่วงนี้"
                          description="ศิลปินที่เปิด pwyw แล้ว ลองกดปุ่ม “คัดลอกลิงก์ขาย” ไปแปะใน X ดูครับ"
                        />
                      </td>
                    </tr>
                  ) : (
                    recentSupports.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                            {row.buyerName || "ไม่ระบุชื่อ"}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            @{row.buyerUsername ?? "—"}
                          </p>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[180px] block">
                            {row.productName}
                          </span>
                        </td>
                        <td className="hidden md:table-cell py-2.5 px-4">
                          <span className="inline-flex items-center rounded-md border border-zinc-200/90 bg-zinc-100/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300">
                            {SOURCE_LABEL[row.source ?? "direct"] ?? row.source}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold font-mono text-zinc-900 dark:text-zinc-50">
                          <MoneyCell amount={Number(row.amount || 0)} />
                        </td>
                        <td className="py-2.5 px-4 text-right text-zinc-400">
                          <TimeCell value={row.createdAt} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
