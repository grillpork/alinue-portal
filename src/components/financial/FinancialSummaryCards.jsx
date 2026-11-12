"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Coins,
  CreditCard,
  DollarSign,
  HelpCircle,
  Landmark,
  PiggyBank,
  Receipt,
  Scale,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { formatBaht } from "@/lib/formatters";
import { cn } from "@/utils/cn";

function TwoToneStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  badgeText,
  badgeType = "success",
  loading = false,
  tooltip,
}) {
  const badgeStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/40",
    blue: "bg-blue-50 text-[#1b64f2] border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/40",
    purple: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/40",
    amber: "bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40",
    danger: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/40",
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
      {/* Layer 1: Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
            {Icon ? <Icon size={13} /> : null}
          </span>
          <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {label}
          </span>
        </div>
        {badgeText && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.2 text-[10px] font-bold border",
              badgeStyles[badgeType] || badgeStyles.success
            )}
          >
            {badgeType === "success" && <TrendingUp size={10} className="stroke-[2.5]" />}
            <span>{badgeText}</span>
          </span>
        )}
      </div>

      {/* Layer 2: Inner Canvas */}
      <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1">
        {loading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans tabular-nums">
            {value}
          </p>
        )}

        {subtext && (
          <p className="mt-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FinancialSummaryCards({ summary, loading = false }) {
  const gmv = summary?.totalGmv ?? 1842600;
  const netRevenue = summary?.netPlatformRevenue ?? 184260;
  const payouts = summary?.creatorPayoutsDisbursed ?? 1425800;
  const escrow = summary?.escrowBalance ?? 228110;
  const refunds = summary?.refundsTotal ?? 4430;
  const wht = summary?.withholdingTax30d ?? 42774;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      <TwoToneStatCard
        icon={Coins}
        label="ยอดขายรวม (GMV)"
        value={formatBaht(gmv)}
        subtext="+18.4% จากเดือนก่อนหน้า"
        badgeText="+18.4%"
        badgeType="success"
        loading={loading}
      />
      <TwoToneStatCard
        icon={Landmark}
        label="รายได้สุทธิระบบ (Take Rate)"
        value={formatBaht(netRevenue)}
        subtext="10.0% ค่าธรรมเนียมเฉลี่ย"
        badgeText="+21.2%"
        badgeType="blue"
        loading={loading}
      />
      <TwoToneStatCard
        icon={Banknote}
        label="โอนเงินศิลปินแล้ว"
        value={formatBaht(payouts)}
        subtext="77.4% ของยอดขายรวม"
        badgeText="Paid"
        badgeType="purple"
        loading={loading}
      />
      <TwoToneStatCard
        icon={PiggyBank}
        label="พักเงินรอส่งมอบ (Escrow)"
        value={formatBaht(escrow)}
        subtext="พร้อมปล่อยเมื่อครบกำหนด"
        badgeText="Hold"
        badgeType="amber"
        loading={loading}
      />
      <TwoToneStatCard
        icon={Scale}
        label="ภาษีหัก ณ ที่จ่าย (3%)"
        value={formatBaht(wht)}
        subtext="รอนำส่ง ภ.ง.ด.3/53"
        badgeText="Tax"
        badgeType="blue"
        loading={loading}
      />
      <TwoToneStatCard
        icon={Receipt}
        label="ยอดคืนเงิน (Refunds)"
        value={formatBaht(refunds)}
        subtext="อัตราข้อพิพาทต่ำ 0.24%"
        badgeText="0.24%"
        badgeType="danger"
        loading={loading}
      />
    </div>
  );
}
