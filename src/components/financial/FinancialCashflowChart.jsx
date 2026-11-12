"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Layers,
  PieChart,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { formatBaht, formatCompact, formatPercent } from "@/lib/formatters";
import { cn } from "@/utils/cn";

export default function FinancialCashflowChart({ summary, loading = false }) {
  const [activeMetric, setActiveMetric] = useState("all"); // 'all' | 'gmv' | 'revenue' | 'payouts'

  const monthlyTrends = summary?.monthlyTrends ?? [
    { month: "เม.ย.", gmv: 1120000, revenue: 112000, payouts: 890000 },
    { month: "พ.ค.", gmv: 1280000, revenue: 128000, payouts: 1020000 },
    { month: "มิ.ย.", gmv: 1410000, revenue: 141000, payouts: 1120000 },
    { month: "ก.ค.", gmv: 1560000, revenue: 156000, payouts: 1240000 },
    { month: "ส.ค.", gmv: 1710000, revenue: 171000, payouts: 1350000 },
    { month: "ก.ย.", gmv: 1842600, revenue: 184260, payouts: 1425800 },
  ];

  const categoryBreakdown = summary?.categoryBreakdown ?? [
    { name: "โมเดล 3D & VTuber Rig", amount: 773892.0, share: 42, color: "bg-blue-600 dark:bg-blue-500" },
    { name: "ภาพวาดและคอมมิชชัน 2D", amount: 663336.0, share: 36, color: "bg-purple-600 dark:bg-purple-500" },
    { name: "ให้กำลังใจ & ทิป (PWYW)", amount: 257964.0, share: 14, color: "bg-emerald-600 dark:bg-emerald-500" },
    { name: "Asset Packs & Brushes", amount: 147408.0, share: 8, color: "bg-amber-500 dark:bg-amber-400" },
  ];

  const channelBreakdown = summary?.channelBreakdown ?? [
    { channel: "PromptPay QR (สแกนจ่ายทันที)", share: 64, amount: 1179264.0, fee: "0% ค่าธรรมเนียม", icon: QrCode },
    { channel: "Credit / Debit Card (Stripe)", share: 26, amount: 479076.0, fee: "2.9% + ฿10 ต่อรายการ", icon: CreditCard },
    { channel: "Direct Bank Transfer (KBank/SCB)", share: 10, amount: 184260.0, fee: "ฟรีโอนอัตโนมัติ", icon: Wallet },
  ];

  const maxGmv = Math.max(...monthlyTrends.map((t) => t.gmv));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 select-none">
      {/* Left: 8 Cols - Monthly Cashflow & Revenue Trends */}
      <div className="lg:col-span-8 rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
        {/* Layer 1: Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
              <BarChart3 size={13} />
            </span>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                แนวโน้มกระแสเงินสดและรายได้ 6 เดือนย้อนหลัง (Cashflow & Take-Rate)
              </h3>
            </div>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1 rounded-md border border-zinc-200/90 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-950 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveMetric("all")}
              className={cn(
                "rounded px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeMetric === "all"
                  ? "bg-blue-600 text-white shadow-2xs dark:bg-blue-500 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              ทั้งหมด (All)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("gmv")}
              className={cn(
                "rounded px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeMetric === "gmv"
                  ? "bg-blue-600 text-white shadow-2xs dark:bg-blue-500 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              ยอดขาย GMV
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("payouts")}
              className={cn(
                "rounded px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeMetric === "payouts"
                  ? "bg-blue-600 text-white shadow-2xs dark:bg-blue-500 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              จ่ายศิลปิน
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("revenue")}
              className={cn(
                "rounded px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeMetric === "revenue"
                  ? "bg-blue-600 text-white shadow-2xs dark:bg-blue-500 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              รายได้ระบบ (10%)
            </button>
          </div>
        </div>

        {/* Layer 2: Inner Canvas Chart Area */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1">
          {/* Chart Header Highlights */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">ยอดขายรวม (GMV)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">จ่ายศิลปิน (Payouts)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">กำไรขั้นต้น (Commi Fee 10%)</span>
              </div>
            </div>

            <span className="text-[11px] text-zinc-400 font-medium">
              อัตราการเติบโตเฉลี่ย MoM: <strong className="text-emerald-600 dark:text-emerald-400">+19.8%</strong>
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 sm:h-48 pt-2 pb-1">
            {monthlyTrends.map((t, idx) => {
              const gmvHeight = (t.gmv / maxGmv) * 100;
              const payoutHeight = (t.payouts / maxGmv) * 100;
              const revHeight = (t.revenue / maxGmv) * 100;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-zinc-900 text-white text-[10px] rounded-lg p-2 shadow-lg border border-zinc-700 whitespace-nowrap dark:bg-zinc-800">
                    <p className="font-bold text-zinc-200">{t.month}</p>
                    <p className="text-blue-300">GMV: {formatBaht(t.gmv)}</p>
                    <p className="text-purple-300">Payout: {formatBaht(t.payouts)}</p>
                    <p className="text-emerald-300">Net Fee: {formatBaht(t.revenue)}</p>
                  </div>

                  {/* Multi-tier Bar Container */}
                  <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full pb-1">
                    {(activeMetric === "all" || activeMetric === "gmv") && (
                      <div
                        style={{ height: `${gmvHeight}%` }}
                        className="w-full bg-blue-600/90 dark:bg-blue-500/90 rounded-t-sm group-hover:brightness-110 transition-all shadow-2xs"
                        title={`GMV: ${formatBaht(t.gmv)}`}
                      />
                    )}
                    {(activeMetric === "all" || activeMetric === "payouts") && (
                      <div
                        style={{ height: `${payoutHeight}%` }}
                        className="w-full bg-purple-500/90 dark:bg-purple-400/90 rounded-t-sm group-hover:brightness-110 transition-all shadow-2xs"
                        title={`Payout: ${formatBaht(t.payouts)}`}
                      />
                    )}
                    {(activeMetric === "all" || activeMetric === "revenue") && (
                      <div
                        style={{ height: `${Math.max(8, revHeight)}%` }}
                        className="w-full bg-emerald-500/90 dark:bg-emerald-400/90 rounded-t-sm group-hover:brightness-110 transition-all shadow-2xs"
                        title={`Fee: ${formatBaht(t.revenue)}`}
                      />
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mt-2">
                    {t.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
            <span>ฐานข้อมูลทางบัญชีผ่านการกระทบยอดกับ ธนาคารกสิกรไทย & Stripe API แล้ว</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">รอบภาษี 09/2026</span>
          </div>
        </div>
      </div>

      {/* Right: 4 Cols - Revenue by Category & Payment Gateways */}
      <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
        {/* Category Revenue Distribution Card */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col">
          <div className="flex items-center gap-2 px-3.5 py-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
              <PieChart size={13} />
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              สัดส่วนยอดขายตามหมวดหมู่ (Categories)
            </span>
          </div>

          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
            {/* Multi-segment Combined Progress Bar */}
            <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
              {categoryBreakdown.map((cat, idx) => (
                <div
                  key={idx}
                  style={{ width: `${cat.share}%` }}
                  className={cn("h-full", cat.color)}
                  title={`${cat.name}: ${cat.share}%`}
                />
              ))}
            </div>

            {/* Legend List */}
            <div className="space-y-2 pt-1 text-xs">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("size-2.5 rounded-full shrink-0", cat.color)} />
                    <span className="text-zinc-700 dark:text-zinc-300 truncate font-medium text-[11px]">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      {formatBaht(cat.amount)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">({cat.share}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Gateway Distribution Card */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col">
          <div className="flex items-center gap-2 px-3.5 py-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
              <CreditCard size={13} />
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              ช่องทางการชำระเงิน (Payment Gateways)
            </span>
          </div>

          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 space-y-2.5">
            {channelBreakdown.map((item, idx) => {
              const Icon = item.icon || Wallet;
              return (
                <div key={idx} className="p-2 rounded-lg border border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-[11px]">
                      <Icon size={12} className="text-blue-600 dark:text-blue-400" />
                      {item.channel}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 font-mono text-[11px]">
                      {item.share}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{formatBaht(item.amount)}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.fee}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
