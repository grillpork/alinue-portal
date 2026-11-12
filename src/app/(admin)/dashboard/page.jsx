"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  RefreshCw,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useOverview } from "@/hooks/useAdminData";
import {
  useAdminPreferences,
  usePreferencesHydrated,
} from "@/hooks/useAdminPreferences";
import { formatBaht, formatCompact, formatNumber, formatPercent } from "@/lib/formatters";
import { toast } from "@/components/ui/Toast";
import { storefrontUrl } from "@/lib/links";
import InitialTile from "@/components/ui/InitialTile";
import StatusChip from "@/components/ui/StatusChip";
import { cn } from "@/utils/cn";
import DashboardUsageSidebar from "./DashboardUsageSidebar";

// Segmented Metric Card Widget (Matching Orders & Revenue Trends rounded-lg style)
function SegmentedMetricCard({
  title,
  subtitle,
  value,
  badgeText,
  badgeType = "success",
  vsText = "vs last month",
  percent = 70,
  barColor = "bg-[#76c800]",
}) {
  const totalBars = 22;
  const filledCount = Math.min(totalBars, Math.max(1, Math.round(totalBars * (percent / 100))));

  const badgeStyles = {
    success: "bg-lime-50 text-lime-700 border-lime-200/60 dark:bg-lime-950/60 dark:text-lime-400 dark:border-lime-800/40",
    blue: "bg-blue-50 text-[#1b64f2] border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/40",
    purple: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/40",
    warning: "bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40",
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
      {/* Layer 1: Header Bar (Tinted Gray Background) */}
      <div className="flex items-start justify-between gap-2 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[10px] text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-0.5 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="ตัวเลือก"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Layer 2: Inner Canvas (Crisp White Background with Rounded Top & Top Border) */}
      <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1">
        {/* Metric Value + Badge */}
        <div className="flex items-baseline justify-between flex-wrap gap-1.5">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans tabular-nums">
            {value}
          </span>
          <div className="flex items-center gap-1.5">
            {badgeText && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.2 text-[10px] font-bold border",
                  badgeStyles[badgeType] || badgeStyles.success,
                )}
              >
                {badgeType === "success" && <TrendingUp size={10} className="stroke-[2.5]" />}
                <span>{badgeText}</span>
              </span>
            )}
            {vsText && (
              <span className="text-[10px] text-zinc-400 font-medium">
                {vsText}
              </span>
            )}
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="mt-3 flex items-center gap-1 sm:gap-1.5">
          {Array.from({ length: totalBars }).map((_, i) => {
            const isFilled = i < filledCount;
            return (
              <div
                key={i}
                className={cn(
                  "h-3.5 sm:h-4 flex-1 rounded-xs transition-all duration-300",
                  isFilled ? barColor : "bg-zinc-100 dark:bg-zinc-800/80",
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const DATE_RANGES = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  const hydrated = usePreferencesHydrated();
  const preferences = useAdminPreferences();
  const { data, isLoading, isFetching, refetch } = useOverview();

  const revenue30d = data?.revenue30d ?? 125400;
  const totalProducts = data?.totalProducts ?? 42;
  const pendingOrders = data?.pendingOrders ?? 3;
  const completionRate = data?.completionRate ?? 94.2;

  // Chart data computation for Orders & Activity over time
  const chartData = useMemo(() => {
    return [
      { label: "Sep 01 - 07", orders: 18, revenue: "฿32.4k" },
      { label: "Sep 08 - 14", orders: 24, revenue: "฿41.2k" },
      { label: "Sep 15 - 21", orders: 31, revenue: "฿58.9k" },
      { label: "Sep 22 - 28", orders: 28, revenue: "฿49.8k" },
      { label: "Sep 29 - 30", orders: 12, revenue: "฿21.5k" },
    ];
  }, []);

  const maxOrders = Math.max(...chartData.map((d) => d.orders), 35);

  // Attention items respecting admin preferences
  const attention = [
    hydrated &&
      preferences.notifyPendingOrders &&
      pendingOrders > 0 && {
        label: `${pendingOrders} คำสั่งซื้อรอชำระ`,
        href: "/orders?status=pending",
      },
    hydrated &&
      preferences.notifyReports &&
      data?.reportedItems > 0 && {
        label: `${data.reportedItems} รายการถูกรายงาน`,
        href: "/posts?status=reported",
      },
    hydrated &&
      preferences.notifyNewUsers &&
      data?.newUsers7d > 0 && {
        label: `${data.newUsers7d} ผู้ใช้ใหม่รอตรวจสอบ`,
        href: "/users?status=pending",
      },
  ].filter(Boolean);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 select-none">
      {/* 1. Header (Matching Audit Log & Settings style) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-zinc-700 dark:text-zinc-300" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Overview
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            ภาพรวมสินค้า คำสั่งซื้อ ยอดขาย และสถานะการทำงานของแพลตฟอร์ม Commi
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDateMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-md border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
            >
              <Calendar size={13} className="text-zinc-400" />
              <span>
                {DATE_RANGES.find((d) => d.value === dateRange)?.label}
              </span>
              <ChevronDown size={12} className="text-zinc-400" />
            </button>

            {dateMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => {
                      setDateRange(range.value);
                      setDateMenuOpen(false);
                      toast.info("อัปเดตช่วงเวลา", range.label);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left cursor-pointer transition-colors",
                      dateRange === range.value
                        ? "bg-blue-50 font-semibold text-[#1b64f2] dark:bg-blue-950/50 dark:text-blue-400"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                    )}
                  >
                    <span>{range.label}</span>
                    {dateRange === range.value && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => {
              refetch();
              toast.info("กำลังรีเฟรชข้อมูล", "อัปเดตตัวเลขล่าสุดแล้ว");
            }}
            aria-label="รีเฟรชข้อมูล"
            title="รีเฟรชข้อมูล"
            className="flex size-8 items-center justify-center rounded-md border border-zinc-200/90 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
          >
            <RefreshCw
              size={13}
              className={cn(isFetching && "animate-spin text-[#1b64f2]")}
            />
          </button>

          {/* Documentation / Storefront Primary Button */}
          <a
            href={storefrontUrl("/")}
            target="_blank"
            rel="noreferrer"
            className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
          >
            <BookOpen size={13} />
            <span>Storefront</span>
          </a>
        </div>
      </div>

      {/* Main 2-Column Grid (Left: 8 Cols Operational Cockpit / Right: 4 Cols Dedicated Usage & Account Sidebar) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 items-start">
        {/* Left Column (8 cols): Attention, KPIs, Trends Chart, Recent Orders */}
        <div className="xl:col-span-8 space-y-4">
          {/* 2. Attention Banner Strip (If any alerts exist) */}
          {attention.length > 0 && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3.5 py-2.5 sm:flex-row sm:items-center dark:border-amber-500/20 dark:bg-amber-500/5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  รายการที่ต้องตรวจสอบ ({attention.length} รายการ):
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                {attention.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-1 rounded-md border border-amber-300/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow-2xs transition-colors hover:bg-amber-50 dark:border-amber-600/30 dark:bg-zinc-900 dark:text-amber-300 dark:hover:bg-zinc-800"
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={11} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Four Metric KPI Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Card 1: Revenue 30d */}
            <SegmentedMetricCard
              title="Revenue (30d)"
              subtitle="Monthly sales volume"
              value={isLoading ? "—" : formatBaht(revenue30d)}
              badgeText="+14.8%"
              badgeType="success"
              vsText="vs last month"
              percent={82}
              barColor="bg-[#76c800]"
            />

            {/* Card 2: Total Products */}
            <SegmentedMetricCard
              title="Total Products"
              subtitle="Active items & listings"
              value={isLoading ? "—" : totalProducts}
              badgeText={`${data?.activeWorkflows ?? totalProducts} Active`}
              badgeType="purple"
              vsText="in storefront"
              percent={75}
              barColor="bg-purple-600 dark:bg-purple-500"
            />

            {/* Card 3: Conversion Rate */}
            <SegmentedMetricCard
              title="Conversion Rate"
              subtitle="Checkout completion rate"
              value={isLoading ? "—" : `${completionRate}%`}
              badgeText="+2.4%"
              badgeType="success"
              vsText="Target 90%"
              percent={completionRate}
              barColor="bg-[#76c800]"
            />

            {/* Card 4: Pending Orders */}
            <SegmentedMetricCard
              title="Pending Orders"
              subtitle="Awaiting verification"
              value={isLoading ? "—" : pendingOrders}
              badgeText="Action required"
              badgeType="warning"
              vsText="in queue"
              percent={35}
              barColor="bg-amber-500"
            />
          </div>

          {/* 4. Actions & Orders Over Time Card (Two-Tone Layered Inset Style) */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
            {/* Layer 1: Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Orders & Revenue Trends
                </h2>
                <span className="text-[11px] text-zinc-400">· 30 Days Interval</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full border border-blue-400 bg-blue-500/20 ring-2 ring-blue-400/30" />
                  <span className="text-zinc-600 dark:text-zinc-300 text-[11px] font-medium tabular-nums">
                    Completed Orders
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full border border-zinc-400 bg-zinc-400/20" />
                  <span className="text-zinc-400 text-[11px] font-medium tabular-nums">
                    Target Level
                  </span>
                </div>
              </div>
            </div>

            {/* Layer 2: Inner Canvas */}
            <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="relative h-28 w-full">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                  <div className="border-b border-zinc-100 dark:border-zinc-900" />
                  <div className="border-b border-zinc-100 dark:border-zinc-900" />
                  <div className="border-b border-zinc-100 dark:border-zinc-900" />
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around px-2 sm:px-6">
                  {chartData.map((item, idx) => {
                    const heightPercent = Math.round((item.orders / maxOrders) * 100);
                    return (
                      <div
                        key={idx}
                        className="group relative flex flex-col items-center h-full justify-end"
                      >
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap z-20 shadow-xs">
                          {item.orders} คำสั่งซื้อ ({item.revenue})
                        </div>

                        <div
                          className="w-7 sm:w-12 rounded-t-[2px] transition-all duration-300 bg-[#2b7fff] hover:bg-[#1a6feb] cursor-pointer"
                          style={{ height: `${Math.max(8, heightPercent)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="mt-2 flex items-center justify-around border-t border-zinc-200/80 pt-2 text-[10px] text-zinc-400 dark:border-zinc-800">
                {chartData.map((item, idx) => (
                  <span key={idx} className="truncate">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Recent Orders Table (Two-Tone Layered Inset Style) */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
            {/* Layer 1: Header Bar */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-zinc-600 dark:text-zinc-400" />
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Recent Orders (คำสั่งซื้อล่าสุด)
                </h2>
              </div>
              <Link
                href="/orders"
                className="text-[11px] font-semibold text-[#1b64f2] hover:underline flex items-center gap-0.5 transition-colors"
              >
                <span>View all orders</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>

            {/* Layer 2: Inner Canvas */}
            <div className="rounded-t-lg border-t border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Order / Product
                      </th>
                      <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                        Amount
                      </th>
                      <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {(data?.recentOrders ?? []).slice(0, 5).map((order) => (
                      <tr
                        key={order.id || order.orderNumber}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                            {order.product?.name || "Digital Asset"}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400">
                            {order.orderNumber || order.id}
                          </p>
                        </td>
                        <td className="py-2.5 px-4">
                          <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                            {order.buyer?.name || "Customer"}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            @{order.buyer?.username || "user"}
                          </p>
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold font-mono text-zinc-900 dark:text-zinc-50">
                          {formatBaht(order.amount)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <StatusChip status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dedicated Column (4 cols): Cloudflare Style Usage, Billing & Account Sidebar */}
        <aside className="xl:col-span-4 space-y-4">
          <DashboardUsageSidebar data={data} isLoading={isLoading} />
        </aside>
      </div>
    </div>
  );
}
