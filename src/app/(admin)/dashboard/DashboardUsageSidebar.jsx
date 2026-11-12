"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Copy,
  Edit2,
  Info,
  Plus,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/utils/cn";

export default function DashboardUsageSidebar({ data, isLoading }) {
  const [showLimits, setShowLimits] = useState(false);

  const activeRequests = data?.recentOrders?.length ?? 0;
  const maxQuota = 100000;
  const usagePercentage = Math.min(100, Math.round((activeRequests / 1000) * 100)) || 0;

  const handleCopyAccountId = () => {
    navigator.clipboard?.writeText("a9814ba13876b457e43b5cd689b6f12");
    toast.success("คัดลอก Account ID แล้ว", "a9814ba13876b457e43b5cd689b6f12");
  };

  return (
    <div className="space-y-4 select-none">
      {/* 1. Top Usage Section */}
      <div className="rounded-lg border border-zinc-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Usage
          </h2>
          <button
            type="button"
            onClick={() => toast.info("Commi Enterprise Plan", "คุณกำลังใช้งานแผนงานแบบ Enterprise Cloud")}
            className="btn-primary rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer"
          >
            Upgrade
          </button>
        </div>

        <div className="mt-3 flex items-baseline justify-between text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Requests today
          </span>
          <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 tabular-nums">
            0 / {maxQuota.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-300 transition-all duration-300 dark:bg-zinc-700"
            style={{ width: `${Math.max(2, usagePercentage)}%` }}
          />
        </div>

        {/* View limits toggle */}
        <button
          type="button"
          onClick={() => setShowLimits((prev) => !prev)}
          className="mt-3 flex w-full items-center justify-end gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
        >
          <span>View limits</span>
          <ChevronDown
            size={13}
            className={cn("transition-transform duration-200", showLimits && "rotate-180")}
          />
        </button>

        {showLimits && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] space-y-1.5 text-zinc-500 dark:text-zinc-400 animate-in fade-in duration-150">
            <div className="flex justify-between">
              <span>Concurrent users</span>
              <span className="font-mono">1,000 / sec</span>
            </div>
            <div className="flex justify-between">
              <span>Burst capacity</span>
              <span className="font-mono">5,000 req / min</span>
            </div>
            <div className="flex justify-between">
              <span>Storage quota</span>
              <span className="font-mono">50 GB</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Billing Dashboard Card (Two-Tone Inset Style) */}
      <section className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Billing Dashboard
          </span>
          <ArrowRight size={13} className="text-zinc-400 dark:text-zinc-500" />
        </div>

        {/* Layer 2: Inner Canvas */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
              <span>Billable usage (current period)</span>
              <Info size={12} className="text-zinc-400" />
            </div>
            <button
              type="button"
              onClick={() => toast.info("Budget Alert", "ฟังก์ชันตั้งค่าแจ้งเตือนงบประมาณกำลังเปิดใช้งาน")}
              className="flex items-center gap-0.5 text-[11px] font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Budget Alert</span>
            </button>
          </div>

          {/* Donut Gauge Indicator */}
          <div className="flex items-center gap-4 py-1">
            <div className="relative flex size-20 shrink-0 items-center justify-center">
              <svg className="size-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-zinc-300 dark:text-zinc-700"
                  strokeDasharray="0, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-zinc-800 dark:text-zinc-200">
                $0.00
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              No billable usage incurred yet
            </p>
          </div>
        </div>
      </section>

      {/* 3. Date Window & 2x2 Mini Stat Boxes */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          September 18 - October 18
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Box 1: Requests */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Requests</span>
              <Info size={11} className="text-zinc-400" />
            </div>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              0
            </p>
          </div>

          {/* Box 2: CPU time */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>CPU time</span>
              <Info size={11} className="text-zinc-400" />
            </div>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              0 <span className="text-xs font-normal text-zinc-400">ms</span>
            </p>
          </div>

          {/* Box 3: Observability events */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Observability events</span>
              <Info size={11} className="text-zinc-400" />
            </div>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              0
            </p>
          </div>

          {/* Box 4: Workers build mins */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Workers build mins</span>
              <Info size={11} className="text-zinc-400" />
            </div>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              0
            </p>
          </div>
        </div>
      </div>

      {/* 4. Account Details Card (Two-Tone Inset Style) */}
      <section className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar */}
        <div className="px-4 py-2.5">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Account details
          </h3>
        </div>

        {/* Layer 2: Inner Canvas */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Account ID</span>
            <button
              type="button"
              onClick={handleCopyAccountId}
              className="flex items-center gap-1 font-mono text-[11px] text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 cursor-pointer"
              title="กดเพื่อคัดลอก"
            >
              <span>a9814ba13876b457e43b5cd689b6...</span>
              <Copy size={11} className="text-zinc-400" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-zinc-500 dark:text-zinc-400">Subdomain</span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              <span>tripopsaibut.workers.dev</span>
              <Edit2 size={11} className="text-zinc-400 cursor-pointer hover:text-zinc-700" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cloudflare Access Card (Two-Tone Inset Style) */}
      <section className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar */}
        <div className="px-4 py-2.5">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Cloudflare Access
          </h3>
        </div>

        {/* Layer 2: Inner Canvas */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Set up Zero Trust before requiring Access sign-in for Workers on this account.
          </p>

          <button
            type="button"
            onClick={() => toast.info("Zero Trust Security", "เชื่อมต่อ Cloudflare Zero Trust")}
            className="w-full rounded-md border border-zinc-200/90 bg-white py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
          >
            Set up Zero Trust
          </button>
        </div>
      </section>
    </div>
  );
}
