"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, CheckCircle2, Clock, Landmark, XCircle } from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { NameCell, StatusCell, TimeCell } from "@/components/shared/cells";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useWithdrawals, useReviewWithdrawal } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { formatBaht } from "@/lib/formatters";

const WITHDRAWAL_STATUSES = ["pending", "paid", "rejected"];

// helper module-level — ไม่เรียก Date.now ตรงใน render (react-hooks/purity)
function payoutHoldInfo(row) {
  if (!row?.eligibleAt) return null;
  const remainingMs = new Date(row.eligibleAt).getTime() - Date.now();
  if (remainingMs <= 0) return null;
  return {
    days: Math.ceil(remainingMs / 86_400_000),
    reason: row.holdReason || "อยู่ระหว่างระยะพักเงิน",
  };
}

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "ขอใหม่สุดก่อน" },
  { value: "amount:desc", label: "ยอดสูงสุดก่อน" },
];

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
        {hint && (
          <p className={`mt-1.5 text-[11px] ${hintClass || "text-zinc-400 dark:text-zinc-500"}`}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/** Two-Tone Layered Inset Dialog: ใส่เลขอ้างอิง (paid) / ใส่เหตุผล (rejected) */
function ReviewDialog({ target, mode, onClose, onSubmit, busy }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!target) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [target, onClose]);

  const isPaid = mode === "paid";
  const title = isPaid
    ? `ยืนยันว่าโอน ${bahtText(target?.amount)} ให้ ${target?.artistName} แล้ว?`
    : `ปฏิเสธคำขอถอนของ ${target?.artistName}?`;

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
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 420 }}
            className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70"
          >
            {/* Layer 1: Header Shell */}
            <div className="flex items-center gap-2.5 px-4 py-3">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-md border shadow-2xs ${
                  isPaid
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                    : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
                }`}
              >
                {isPaid ? <BadgeCheck size={15} /> : <XCircle size={15} />}
              </span>
              <div>
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {isPaid ? "บันทึกเลขอ้างอิงการทำธุรกรรม" : "ส่งเหตุผลการปฏิเสธให้ศิลปิน"}
                </p>
              </div>
            </div>

            {/* Layer 2: Inner Canvas */}
            <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {isPaid
                  ? "ระบุเลขที่อ้างอิงการโอนจริงจากแอปธนาคาร — ศิลปินจะเห็นเลขนี้ในประวัติการถอน"
                  : "ระบบจะคืนยอดเข้ากระเป๋าศิลปินอัตโนมัติ และศิลปินเห็นเหตุผลของคุณ"}
              </p>
              <input
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={
                  isPaid ? "เช่น KBANK-20260923-001" : "เหตุผลที่ปฏิเสธ"
                }
                maxLength={isPaid ? 120 : 500}
                className="w-full rounded-md border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-[#1b64f2] focus:outline-none focus:ring-2 focus:ring-[#1b64f2]/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              {target?.payoutSnapshot && (
                <div className="rounded-md border border-zinc-100 bg-zinc-50/80 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/50 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                    โอนเข้า: {target.payoutSnapshot.name}
                  </p>
                  <p className="mt-0.5 tabular-nums text-zinc-500">
                    พร้อมเพย์ {target.payoutSnapshot.promptpay}
                    {target.payoutSnapshot.bank ? ` · ${target.payoutSnapshot.bank}` : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Layer 3: Footer Action Bar */}
            <div className="border-t border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 flex items-center justify-end gap-2 dark:border-zinc-800 dark:bg-zinc-900/70">
              <Button variant="secondary" size="sm" onClick={onClose}>
                ยกเลิก
              </Button>
              <button
                type="button"
                disabled={!value.trim() || busy}
                onClick={() => onSubmit(value.trim())}
                className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  isPaid
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {busy
                  ? "กำลังบันทึก…"
                  : isPaid
                    ? "ยืนยันว่าโอนแล้ว"
                    : "ปฏิเสธคำขอ"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function buildColumns({ onReview }) {
  return [
    {
      key: "artist",
      header: "ศิลปิน",
      cell: (row) => (
        <NameCell label={row.artistName} meta={`@${row.artistUsername}`} />
      ),
      exportValue: (row) => `${row.artistName} (@${row.artistUsername})`,
    },
    {
      key: "amount",
      header: "ยอดถอน",
      align: "end",
      cell: (row) => (
        <span className="text-[13px] font-semibold text-zinc-800 tabular-nums dark:text-zinc-100">
          {bahtText(row.amount)}
        </span>
      ),
      exportValue: (row) => row.amount,
    },
    {
      key: "payout",
      header: "ช่องทางโอน",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (row) => {
        const hold = payoutHoldInfo(row);
        return (
          <div className="min-w-0">
            <p className="truncate text-[12px] text-zinc-600 dark:text-zinc-300">
              {row.payoutSnapshot?.name || "—"}
            </p>
            <p className="truncate text-[11px] text-zinc-400 tabular-nums dark:text-zinc-500">
              {row.payoutSnapshot?.promptpay || "ไม่ระบุ"}
              {row.payoutSnapshot?.bank ? ` · ${row.payoutSnapshot.bank}` : ""}
            </p>
            {hold && (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                พักเงินอีก {hold.days} วัน — {hold.reason}
              </p>
            )}
          </div>
        );
      },
      exportValue: (row) =>
        `${row.payoutSnapshot?.name ?? ""} ${row.payoutSnapshot?.promptpay ?? ""}`,
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (row) => <StatusCell status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "reference",
      header: "อ้างอิง/หมายเหตุ",
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          {row.reference || row.adminNote || "—"}
        </span>
      ),
      exportValue: (row) => row.reference || row.adminNote || "",
    },
    {
      key: "createdAt",
      header: "ขอถอนเมื่อ",
      align: "end",
      cell: (row) => <TimeCell value={row.createdAt} />,
      exportValue: (row) => row.createdAt,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (row) => {
        const onHold = Boolean(payoutHoldInfo(row));
        return (
          <RowActionsMenu
            label={`ตัวเลือกของคำขอถอน #${row.id}`}
            actions={[
              {
                key: "paid",
                label: onHold
                  ? "โอนได้เมื่อครบกำหนดพักเงิน"
                  : "ยืนยันว่าโอนแล้ว",
                icon: BadgeCheck,
                disabled: row.status !== "pending" || onHold,
                onSelect: () => onReview(row, "paid"),
              },
              {
                key: "rejected",
                label: "ปฏิเสธ (คืนเงิน)",
                icon: XCircle,
                tone: "danger",
                disabled: row.status !== "pending",
                onSelect: () => onReview(row, "rejected"),
              },
            ]}
          />
        );
      },
    },
  ];
}

function WithdrawalsScreen() {
  const [review, setReview] = useState(null); // { target, mode }
  const mutation = useReviewWithdrawal();

  const submitReview = (value) => {
    const { target, mode } = review;
    mutation.mutate(
      {
        id: target.id,
        decision: mode,
        reference: mode === "paid" ? value : undefined,
        note: mode === "rejected" ? value : undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            mode === "paid" ? "บันทึกการโอนแล้ว" : "ปฏิเสธและคืนเงินแล้ว",
            `${target.artistName} · ${bahtText(target.amount)}`,
          );
          setReview(null);
        },
        onError: (error) =>
          toast.error(
            "บันทึกไม่สำเร็จ",
            error?.error || error?.message || "คำขอนี้อาจถูกตรวจไปแล้ว",
          ),
      },
    );
  };

  return (
    <>
      <AdminListScreen
        title="คิวถอนเงินศิลปิน"
        description="โอนผ่านพร้อมเพย์จากแอปธนาคารของคุณ แล้วกด “ยืนยันว่าโอนแล้ว” พร้อมเลขอ้างอิง — ปฏิเสธจะคืนยอดเข้ากระเป๋าอัตโนมัติ"
        collection="withdrawals"
        useCollectionQuery={useWithdrawals}
        searchPlaceholder="ค้นหาชื่อหรือยูสเซอร์เนมศิลปิน..."
        statusOptions={statusOptions(WITHDRAWAL_STATUSES, {
          allLabel: "ทุกสถานะ",
        })}
        sortOptions={SORT_OPTIONS}
        defaultSort="createdAt:desc"
        columns={() =>
          buildColumns({
            onReview: (target, mode) => setReview({ target, mode }),
          })
        }
        exportFilename="commi-withdrawals"
        emptyTitle="ไม่มีคำขอถอนตรงเงื่อนไข"
        emptyDescription="ช่วงนี้ยังไม่มีศิลปินกดถอนเงิน — ลองเปลี่ยนตัวกรองสถานะ"
        minWidth="60rem"
        topContent={({ rows, isLoading }) => {
          const pendingCount = rows.filter((r) => r.status === "pending").length;
          const paidCount = rows.filter((r) => r.status === "paid").length;
          const rejectedCount = rows.filter((r) => r.status === "rejected").length;
          const totalPendingAmount = rows
            .filter((r) => r.status === "pending")
            .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

          return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TwoToneStatCard
                icon={Clock}
                label="รอโอนเงิน"
                value={pendingCount}
                hint={`ยอดรอโอน ฿${totalPendingAmount.toLocaleString()}`}
                hintClass={pendingCount > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : undefined}
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={CheckCircle2}
                label="โอนสำเร็จแล้ว"
                value={paidCount}
                hint="ทำรายการเรียบร้อย"
                hintClass="text-emerald-600 dark:text-emerald-400 font-medium"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={XCircle}
                label="ปฏิเสธคำขอ"
                value={rejectedCount}
                hint="คืนเงินเข้ากระเป๋า"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={Landmark}
                label="คำขอทั้งหมด"
                value={rows.length}
                hint="ในมุมมองปัจจุบัน"
                loading={isLoading}
              />
            </div>
          );
        }}
      />
      <ReviewDialog
        key={`${review?.target?.id ?? "none"}-${review?.mode ?? "closed"}`}
        target={review?.target ?? null}
        mode={review?.mode ?? null}
        busy={mutation.isPending}
        onClose={() => setReview(null)}
        onSubmit={submitReview}
      />
    </>
  );
}

export default function WithdrawalsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <WithdrawalsScreen />
    </Suspense>
  );
}
