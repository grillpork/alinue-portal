"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronDown,
  Filter,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { useAuditLogs } from "@/hooks/useAdminData";
import { cn } from "@/utils/cn";

const DATE_RANGES = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

function formatTimestamp(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Sparkline SVG area chart for KPI cards
function SparklineArea({ className }) {
  return (
    <svg
      viewBox="0 0 100 40"
      className={cn("h-8 w-20 shrink-0", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="blueSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M 0,38 Q 25,36 50,28 T 100,6 L 100,40 L 0,40 Z"
        fill="url(#blueSpark)"
      />
      <path
        d="M 0,38 Q 25,36 50,28 T 100,6"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useAuditLogs(actionFilter);

  const logs = data?.data ?? [];
  const actionCounts = data?.actionCounts ?? [];

  // Metrics computation
  const totalActions = logs.length;
  const uniqueActors = useMemo(() => {
    const actors = new Set(logs.map((l) => l.actorLabel || l.actorRole || "system"));
    return actors.size;
  }, [logs]);

  const productsImpacted = useMemo(() => {
    return logs.filter((l) => l.entityType === "product" || l.entityType === "category").length;
  }, [logs]);

  // Activity Bar Chart computation
  const chartData = useMemo(() => {
    // Generate 5 buckets representing intervals
    return [
      { label: "Sep 18, 11:00", count: 0 },
      { label: "Sep 19, 17:00", count: 0 },
      { label: "Sep 20, 23:00", count: 0 },
      { label: "Sep 22, 05:00", count: 0 },
      { label: "Sep 23, 23:00", count: totalActions || 2 },
    ];
  }, [totalActions]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 2.1);

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* 1. Page Header (Cloudflare Style) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="size-5 text-zinc-700 dark:text-zinc-300" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Audit logs
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            See the history of changes made within this account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Switch to old Audit Logs</span>
          </button>

          <button
            type="button"
            className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <BookOpen size={13} />
            <span>Documentation</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar & Date Range (Cloudflare Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left: Add Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Filter size={12} className="text-zinc-400" />
            <span>+ Add filter</span>
            {actionFilter !== "all" && (
              <span className="ml-1 rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                {actionFilter}
              </span>
            )}
          </button>

          {filterMenuOpen && (
            <div className="absolute left-0 top-[calc(100%+4px)] z-30 w-56 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <p className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Filter by Action
              </p>
              <button
                type="button"
                onClick={() => {
                  setActionFilter("all");
                  setFilterMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer",
                  actionFilter === "all"
                    ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50",
                )}
              >
                <span>ทุกการกระทำ (All Actions)</span>
                <span className="text-[10px] text-zinc-400">{logs.length}</span>
              </button>
              {actionCounts.map((c) => (
                <button
                  key={c.action}
                  type="button"
                  onClick={() => {
                    setActionFilter(c.action);
                    setFilterMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer",
                    actionFilter === c.action
                      ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50",
                  )}
                >
                  <span className="truncate">{c.action}</span>
                  <span className="text-[10px] text-zinc-400">{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Date Range & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDateMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-md border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Calendar size={12} className="text-zinc-400" />
              <span>{DATE_RANGES.find((d) => d.value === dateRange)?.label}</span>
              <ChevronDown size={11} className="text-zinc-400" />
            </button>

            {dateMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-40 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                {DATE_RANGES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => {
                      setDateRange(d.value);
                      setDateMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                      dateRange === d.value
                        ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            aria-label="รีเฟรชข้อมูล"
            title="รีเฟรชข้อมูล"
            className="flex size-8 items-center justify-center rounded-md border border-zinc-200/90 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={cn(isRefetching && "animate-spin text-purple-600")}
            />
          </button>
        </div>
      </div>

      {/* 3. Actions Over Time Card & Bar Graph (Two-Tone Layered Inset Style) */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar (Tinted Gray Background) */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Actions Over Time
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-blue-400 bg-blue-500/20 ring-2 ring-blue-400/30" />
              <span className="text-zinc-600 dark:text-zinc-300 text-[11px] font-medium tabular-nums">
                {totalActions} Success
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-rose-400 bg-rose-500/20 ring-2 ring-rose-400/30" />
              <span className="text-zinc-600 dark:text-zinc-300 text-[11px] font-medium tabular-nums">
                0 Failed
              </span>
            </div>
          </div>
        </div>

        {/* Layer 2: Inner Canvas (Crisp White Background with Rounded Top & Top Border) */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex gap-3 h-32">
            {/* Y Axis Labels */}
            <div className="flex flex-col justify-between text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums text-right w-6 py-0.5 shrink-0">
              <span>2.1</span>
              <span>1.4</span>
              <span>0.7</span>
              <span>0</span>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex flex-col justify-between relative">
              {/* Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
                <div className="border-b border-zinc-100 dark:border-zinc-900 w-full" />
                <div className="border-b border-zinc-100 dark:border-zinc-900 w-full" />
                <div className="border-b border-zinc-100 dark:border-zinc-900 w-full" />
                <div className="border-b border-zinc-200/80 dark:border-zinc-800 w-full" />
              </div>

              {/* Bars */}
              <div className="relative z-10 flex h-full items-end justify-between px-6 pb-0.5">
                {chartData.map((item, idx) => {
                  const heightPercent = item.count > 0 ? Math.min(100, Math.round((item.count / maxCount) * 100)) : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="rounded bg-zinc-900 px-2 py-1 text-[10px] text-white shadow-md dark:bg-zinc-800 whitespace-nowrap">
                          <span className="font-semibold">{item.label}</span>: {item.count} Actions
                        </div>
                      </div>

                      {heightPercent > 0 ? (
                        <div
                          style={{ height: `${Math.max(16, heightPercent)}%` }}
                          className="w-3.5 rounded-t-[2px] bg-[#2b7fff] hover:bg-[#1a6feb] transition-colors cursor-pointer"
                        />
                      ) : (
                        <div className="h-0.5 w-3.5 bg-transparent" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 pt-1.5 border-t border-zinc-200/80 dark:border-zinc-800">
                {chartData.map((item, idx) => (
                  <span key={idx} className="truncate">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Four Metric / KPI Summary Cards (Two-Tone Layered Inset Style) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Actions */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
          <div className="flex items-center justify-between px-3.5 py-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Total Actions</span>
              <ChevronDown size={12} className="text-zinc-400" />
            </div>
          </div>
          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex items-baseline justify-between flex-1">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {totalActions}
            </span>
            <SparklineArea />
          </div>
        </div>

        {/* Card 2: Unique Actors */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
          <div className="flex items-center justify-between px-3.5 py-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Unique Actors</span>
              <ChevronDown size={12} className="text-zinc-400" />
            </div>
          </div>
          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex items-baseline justify-between flex-1">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {uniqueActors}
            </span>
            <SparklineArea />
          </div>
        </div>

        {/* Card 3: Products Impacted */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Products Impacted
            </span>
          </div>
          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex items-baseline gap-2 flex-1">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {productsImpacted}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              ↘ 100.00%
            </span>
          </div>
        </div>

        {/* Card 4: Failure Rate */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Failure Rate
            </span>
          </div>
          <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1">
            <div>
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
                0 <span className="text-lg font-normal text-zinc-400">%</span>
              </span>
            </div>
            <div className="mt-2 h-0.5 w-full rounded-full bg-emerald-500/80" />
          </div>
        </div>
      </div>

      {/* 5. Cloudflare Style Data Table (Two-Tone Layered Inset Style) */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar (Tinted Gray Background) */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText size={14} className="text-zinc-600 dark:text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Audit Event Records
            </h2>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            {logs.length} events logged
          </span>
        </div>

        {/* Layer 2: Inner Canvas (Crisp White Background with Rounded Top & Top Border) */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 font-medium">
                  <th className="py-2.5 px-4 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      Action Time <span className="text-[#1b64f2] text-[10px]">↓</span>
                    </span>
                  </th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Action Type</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Resource</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Actor Email</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Actor Context</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Zone Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Loading audit logs…</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    No audit logs recorded in this period.
                  </td>
                </tr>
              ) : (
                logs.map((row) => {
                  const actionParts = (row.action || "update.action").split(".");
                  const mainType = actionParts[0] || "update";
                  const subType = (actionParts[1] || row.action || "SYSTEM").toUpperCase();

                  const resourceType = row.entityType || "user";
                  const actorEmail =
                    row.actorLabel ||
                    (row.actorRole === "admin"
                      ? "admin@commi.market"
                      : `${row.actorLabel || "user"}@gmail.com`);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Action Time */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-600 dark:text-zinc-300">
                        {formatTimestamp(row.createdAt)}
                      </td>

                      {/* Action Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {mainType}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                          {subType}
                        </p>
                      </td>

                      {/* Resource */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {resourceType}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {resourceType} {row.entityId ? `#${row.entityId}` : ""}
                        </p>
                      </td>

                      {/* Actor Email */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {actorEmail}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {row.actorRole === "admin" ? "Admin" : "User"}
                        </p>
                      </td>

                      {/* Actor Context */}
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {row.ip ? `IP: ${row.ip}` : "API (no credential detail)"}
                      </td>

                      {/* Zone Name */}
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                        -
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
}
