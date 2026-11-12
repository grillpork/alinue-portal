"use client";

import { Suspense, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Coins,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Landmark,
  PiggyBank,
  Printer,
  Receipt,
  Scale,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import StatusChip from "@/components/ui/StatusChip";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import FinancialSummaryCards from "@/components/financial/FinancialSummaryCards";
import FinancialCashflowChart from "@/components/financial/FinancialCashflowChart";
import TransactionDetailDrawer from "@/components/financial/TransactionDetailDrawer";
import TaxExportModal from "@/components/financial/TaxExportModal";
import { useFinancialLedger, useFinancialSummary } from "@/hooks/useAdminData";
import { formatBaht, formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/utils/cn";

const FINANCIAL_STATUSES = ["settled", "escrow_hold", "processing", "refunded"];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "วันที่ทำรายการล่าสุด" },
  { value: "netAmount:desc", label: "ยอดเงินสุทธิสูงสุด" },
  { value: "grossAmount:desc", label: "ยอดรวมก่อนหักสูงสุด" },
];

const TYPE_CONFIG = {
  order_gmv: {
    label: "ยอดขาย GMV",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60",
    icon: Coins,
  },
  platform_fee: {
    label: "รายได้ระบบ 10%",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60",
    icon: Landmark,
  },
  creator_payout: {
    label: "จ่ายเงินศิลปิน",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/60",
    icon: Banknote,
  },
  pwyw_support: {
    label: "เงินสนับสนุน (Tip)",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60",
    icon: Coins,
  },
  refund: {
    label: "คืนเงิน (Refund)",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60",
    icon: ArrowDownRight,
  },
  wht_tax: {
    label: "ภาษีหัก 3%",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    icon: Scale,
  },
};

function FinancialScreen() {
  const { data: summaryData, isLoading: isSummaryLoading } = useFinancialSummary();

  const [detailTransaction, setDetailTransaction] = useState(null);
  const [taxModalOpen, setTaxModalOpen] = useState(false);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกแล้ว", `${label}: ${text}`);
  };

  const buildColumns = () => [
    {
      key: "ref",
      header: "รหัสรายการ / ประเภทธุรกรรม",
      cell: (row) => {
        const typeCfg = TYPE_CONFIG[row.type] || TYPE_CONFIG.order_gmv;
        const Icon = typeCfg.icon;
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 shadow-2xs">
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {row.ref}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border",
                    typeCfg.badgeClass
                  )}
                >
                  {typeCfg.label}
                </span>
              </div>
              <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {row.description}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "partyName",
      header: "คู่สัญญา / ช่องทาง",
      cell: (row) => (
        <div className="min-w-0">
          <span className="block truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
            {row.partyName}
          </span>
          <span className="block truncate text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
            {row.channel} {row.orderNumber ? `· ${row.orderNumber}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "grossAmount",
      header: "ยอดรวม (Gross)",
      cell: (row) => (
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          {formatBaht(row.grossAmount)}
        </span>
      ),
    },
    {
      key: "feeAmount",
      header: "ค่าธรรมเนียม (Fee 10%)",
      cell: (row) => (
        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">
          {row.feeAmount !== 0 ? formatBaht(row.feeAmount) : "—"}
        </span>
      ),
    },
    {
      key: "whtAmount",
      header: "หัก ณ ที่จ่าย (3%)",
      cell: (row) => (
        <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-medium">
          {row.whtAmount !== 0 ? formatBaht(row.whtAmount) : "—"}
        </span>
      ),
    },
    {
      key: "netAmount",
      header: "ยอดสุทธิ (Net Settlement)",
      cell: (row) => (
        <div className="font-mono text-xs font-bold tabular-nums">
          <span
            className={cn(
              row.netAmount < 0
                ? "text-rose-600 dark:text-rose-400"
                : row.type === "creator_payout"
                ? "text-purple-600 dark:text-purple-400"
                : "text-zinc-900 dark:text-zinc-100"
            )}
          >
            {formatBaht(row.netAmount)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (row) => <StatusChip status={row.status} />,
    },
    {
      key: "createdAt",
      header: "เวลาทำรายการ",
      cell: (row) => (
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setDetailTransaction(row)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-colors cursor-pointer"
            title="ดูรายละเอียดการแจกแจงภาษีและบัญชี"
          >
            <Eye size={12} />
            <span>ดูข้อมูล</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminListScreen
        title="การเงินและงบบัญชี (Financial & Ledger)"
        description="ศูนย์กลางบัญชีรายรับ-รายจ่าย ยอดขายรวม (GMV) ค่าธรรมเนียมแพลตฟอร์ม และภาษีหัก ณ ที่จ่าย (3% WHT / 7% VAT)"
        collection="financial"
        useCollectionQuery={useFinancialLedger}
        searchPlaceholder="ค้นหาเลขธุรกรรม, เลขอ้างอิงออเดอร์, ชื่อคู่สัญญา, ช่องทาง..."
        statusOptions={FINANCIAL_STATUSES}
        sortOptions={SORT_OPTIONS}
        defaultSort="createdAt:desc"
        columns={buildColumns}
        exportFilename="commi-financial-ledger-2026.csv"
        minWidth="72rem"
        extraActions={
          <Button
            variant="primary"
            onClick={() => setTaxModalOpen(true)}
            className="cursor-pointer"
          >
            <Scale size={14} />
            <span>ส่งออกเอกสารภาษี (Tax Export)</span>
          </Button>
        }
        topContent={
          <div className="space-y-4 mb-4">
            {/* 1. Six Primary KPI Cards */}
            <FinancialSummaryCards
              summary={summaryData}
              loading={isSummaryLoading}
            />

            {/* 2. Six-Month Cashflow Chart & Distribution Breakdown */}
            <FinancialCashflowChart
              summary={summaryData}
              loading={isSummaryLoading}
            />
          </div>
        }
      />

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        isOpen={Boolean(detailTransaction)}
        onClose={() => setDetailTransaction(null)}
        transaction={detailTransaction}
      />

      {/* Tax & Financial Export Modal */}
      <TaxExportModal
        isOpen={taxModalOpen}
        onClose={() => setTaxModalOpen(false)}
      />
    </>
  );
}

export default function FinancialPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton title="การเงินและงบบัญชี" count={8} />}>
      <FinancialScreen />
    </Suspense>
  );
}
