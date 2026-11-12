"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownLeft,
  CheckCircle2,
  Coins,
  DollarSign,
  HandCoins,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  XCircle,
} from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { NameCell, StatusCell, TimeCell } from "@/components/shared/cells";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useDisputes, useResolveDispute } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { formatBaht } from "@/lib/formatters";
import { cn } from "@/utils/cn";

const DISPUTE_STATUSES = ["refund_requested", "refunded"];

const SORT_OPTIONS = [
  { value: "refundRequestedAt:desc", label: "ขอนานสุดทีหลัง" },
  { value: "amount:desc", label: "ยอดสูงสุดก่อน" },
];

const REASON_LABEL = {
  file_broken: "ไฟล์เสีย",
  not_as_described: "ไม่ตรงคำอธิบาย",
  wrong_item: "ซื้อผิดชิ้น",
  accidental: "กดซื้อไม่ตั้งใจ",
  other: "อื่นๆ",
};

const bahtText = (v) => formatBaht(Number(v || 0));

function TwoToneStatCard({ icon: Icon, label, value, hint, hintClass, loading }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
      {/* Layer 1: Header Bar */}
      <div className="flex items-center gap-2 px-3.5 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
          {Icon ? <Icon size={13} /> : null}
        </span>
        <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
      </div>

      {/* Layer 2: Inner Canvas */}
      <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1">
        {loading ? (
          <div className="h-7 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
            {value}
          </p>
        )}

        {hint && !loading && (
          <p className={cn("mt-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500", hintClass)}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function ResolveDialog({ target, mode, onClose, onSubmit, busy }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!target) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [target, onClose]);

  const isRefund = mode === "refund";
  return (
    <AnimatePresence>
      {target && mode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="ปิดหน้าต่าง"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-xs dark:bg-black/65"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isRefund ? "อนุมัติคืนเงิน" : "ปฏิเสธคำขอคืนเงิน"}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 420 }}
            className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70"
          >
            {/* Layer 1: Header Shell */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border shadow-2xs",
                    isRefund
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400",
                  )}
                >
                  {isRefund ? <HandCoins size={14} /> : <ShieldOff size={14} />}
                </span>
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {isRefund
                    ? `คืนเงิน ${bahtText(target.amount)}`
                    : `ปฏิเสธคำขอของ ${target.buyerEmail}`}
                </h2>
              </div>

              <span
                className={cn(
                  "rounded border px-2 py-0.5 text-[10px] font-semibold shrink-0 ml-2",
                  isRefund
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
                    : "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60",
                )}
              >
                {isRefund ? "อนุมัติคืนเงิน" : "ปฏิเสธคำขอ"}
              </span>
            </div>

            {/* Layer 2: Inner Content Canvas */}
            <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between rounded-md border border-zinc-200/80 bg-zinc-50/60 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400">เลขออเดอร์ / สินค้า</span>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {target.orderNumber} · {target.productName}
                  </p>
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {bahtText(target.amount)}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {isRefund
                  ? "ระบบจะเรียก Stripe refund ตามจำนวนออเดอร์ และหักเงินคืนจากกระเป๋า artist อัตโนมัติ (balance อาจติดลบถ้า withdraw ไปแล้ว)"
                  : "ออเดอร์จะกลับเป็น paid — เหตุผลนี้จะแสดงและส่งอีเมลถึงผู้ซื้อ (จำเป็น)"}
              </p>

              {target.refundNote && (
                <blockquote className="rounded-md border border-zinc-200/80 bg-zinc-50/70 p-3 text-[12px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">ผู้ซื้อระบุเหตุผล:</span> “{target.refundNote}”
                </blockquote>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {isRefund ? "ชี้แจงเพิ่มเติม (ไม่บังคับ)" : "เหตุผลที่ต้องปฏิเสธ (จำเป็น)"}
                </label>
                <textarea
                  autoFocus
                  rows={3}
                  maxLength={1000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    isRefund
                      ? "ระบุรายละเอียดเพิ่มเติมสำหรับการคืนเงิน..."
                      : "ระบุเหตุผลที่ปฏิเสธคำขอคืนเงินนี้..."
                  }
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Layer 3: Footer Bar */}
            <div className="border-t border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 flex items-center justify-end gap-2 dark:border-zinc-800 dark:bg-zinc-900/70">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="cursor-pointer rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-2xs disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={busy || (!isRefund && !note.trim())}
                onClick={() => onSubmit(note.trim())}
                className={cn(
                  "cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-2xs disabled:cursor-not-allowed disabled:opacity-50",
                  isRefund
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700",
                )}
              >
                {busy
                  ? "กำลังบันทึก…"
                  : isRefund
                    ? "อนุมัติคืนเงิน"
                    : "ปฏิเสธคำขอ"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function buildColumns({ onResolve }) {
  return [
    {
      key: "product",
      header: "รายการที่พิพาท",
      cell: (row) => (
        <NameCell
          label={row.productName || "สินค้าถูกลบ"}
          meta={`${row.orderNumber} · ผู้ซื้อ ${row.buyerEmail}`}
        />
      ),
      exportValue: (row) => `${row.orderNumber} ${row.productName}`,
    },
    {
      key: "amount",
      header: "ยอด",
      align: "end",
      cell: (row) => (
        <span className="text-[13px] font-semibold text-zinc-800 tabular-nums dark:text-zinc-100">
          {bahtText(row.amount)}
        </span>
      ),
      exportValue: (row) => row.amount,
    },
    {
      key: "refundReason",
      header: "เหตุผลผู้ซื้อ",
      cell: (row) => (
        <div className="min-w-0 max-w-[220px]">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {REASON_LABEL[row.refundReason] ?? row.refundReason ?? "—"}
          </span>
          {row.refundNote && (
            <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400 dark:text-zinc-500">
              {row.refundNote}
            </p>
          )}
        </div>
      ),
      exportValue: (row) => `${row.refundReason}: ${row.refundNote ?? ""}`,
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (row) => <StatusCell status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "refundRequestedAt",
      header: "ขอเมื่อ",
      align: "end",
      cell: (row) => <TimeCell value={row.refundRequestedAt} />,
      exportValue: (row) => row.refundRequestedAt,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (row) => (
        <RowActionsMenu
          label={`ตัวเลือกของ ${row.orderNumber}`}
          actions={[
            {
              key: "refund",
              label: "อนุมัติคืนเงิน",
              icon: HandCoins,
              disabled: row.status !== "refund_requested",
              onSelect: () => onResolve(row, "refund"),
            },
            {
              key: "deny",
              label: "ปฏิเสธคำขอ",
              icon: ShieldOff,
              tone: "danger",
              disabled: row.status !== "refund_requested",
              onSelect: () => onResolve(row, "deny"),
            },
          ]}
        />
      ),
    },
  ];
}

function DisputesScreen() {
  const [target, setTarget] = useState(null);
  const [mode, setMode] = useState(null);
  const mutation = useResolveDispute();

  const submit = (note) => {
    mutation.mutate(
      { id: target.id, decision: mode, adminNote: note || undefined },
      {
        onSuccess: (order) => {
          toast.success(
            mode === "refund" ? "คืนเงินสำเร็จ" : "ปฏิเสธคำขอแล้ว",
            mode === "refund"
              ? `Stripe: ${order?.stripeRefundId ?? "—"} · หักกระเป๋าartist แล้ว`
              : `${target.orderNumber} กลับสถานะ paid และอีเมลถึงผู้ซื้อแล้ว`,
          );
          setTarget(null);
          setMode(null);
        },
        onError: (error) =>
          toast.error(
            "บันทึกไม่สำเร็จ",
            error?.error || error?.message || "เรื่องอาจถูกตรวจไปแล้ว",
          ),
      },
    );
  };

  return (
    <>
      <AdminListScreen
        title="ข้อพิพาทและคืนเงิน"
        description="Window คืนเงิน 14 วันหลังชำระเงิน — อนุมัติแล้วระบบคืนทั้งฝั่ง Stripe และ ledger artist"
        collection="disputes"
        useCollectionQuery={useDisputes}
        searchPlaceholder="ค้นหาเลขออเดอร์ / ชื่อสินค้า / อีเมลผู้ซื้อ..."
        statusOptions={statusOptions(DISPUTE_STATUSES, {
          allLabel: "ทุกสถานะ",
        })}
        sortOptions={SORT_OPTIONS}
        defaultSort="refundRequestedAt:desc"
        topContent={({ data, isLoading }) => {
          const rows = data?.rows ?? [];
          const pendingRefunds = rows.filter((r) => r.status === "refund_requested");
          const refundedList = rows.filter((r) => r.status === "refunded");
          const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
          const totalCount = data?.total ?? rows.length;

          return (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <TwoToneStatCard
                icon={AlertTriangle}
                label="รออนุมัติคืนเงิน"
                value={pendingRefunds.length}
                hint="ต้องตรวจสอบและตัดสินใจ"
                hintClass="text-amber-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={CheckCircle2}
                label="คืนเงินแล้ว"
                value={refundedList.length}
                hint="ดำเนินการสำเร็จ"
                hintClass="text-emerald-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={Coins}
                label="มูลค่าข้อพิพาทรวม"
                value={formatBaht(totalAmount)}
                hint="ยอดรวมในระบบ"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={Scale}
                label="ข้อพิพาททั้งหมด"
                value={totalCount}
                hint="บันทึกในระบบ"
                loading={isLoading}
              />
            </div>
          );
        }}
        columns={() =>
          buildColumns({
            onResolve: (row, m) => {
              setTarget(row);
              setMode(m);
            },
          })
        }
        exportFilename="commi-disputes"
        emptyTitle="ไม่มีข้อพิพาทค้างคิว"
        emptyDescription="สัญญาณดี — ไม่มีใครขอคืนเงินในช่วงนี้"
        minWidth="58rem"
      />
      <ResolveDialog
        key={`${target?.id ?? "none"}-${mode ?? "closed"}`}
        target={target}
        mode={mode}
        busy={mutation.isPending}
        onClose={() => {
          setTarget(null);
          setMode(null);
        }}
        onSubmit={submit}
      />
    </>
  );
}

export default function DisputesPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <DisputesScreen />
    </Suspense>
  );
}
