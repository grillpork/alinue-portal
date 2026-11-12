"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Gavel,
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
import { useReports, useResolveReport } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { cn } from "@/utils/cn";

const REPORT_STATUSES = ["pending", "action_taken", "dismissed"];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "รายงานใหม่สุดก่อน" },
  { value: "createdAt:asc", label: "รอนานสุดก่อน" },
];

// mirror REPORT_REASONS ฝั่ง alinue-backend/services/report.service.js
const REASON_LABEL = {
  unmarked_sensitive: "เนื้อหาอ่อนไหวไม่ติดป้าย",
  misused_category: "ใช้หมวดหมู่/แท็กผิด",
  ai_or_scam: "AI / tracing / หลอกลวง",
  harassment: "กลั่นแกล้ง / doxxing",
  hate_violence: "ความเกลียดชัง / ความรุนแรง",
  misrepresentation: "แอบอ้าง / โฆษณาเกินจริง",
  other: "อื่นๆ",
};

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
  const [unpublish, setUnpublish] = useState(true);

  useEffect(() => {
    if (!target) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [target, onClose]);

  const isAction = mode === "action_taken";
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
            aria-label={isAction ? "ดำเนินการตามนโยบาย" : "ตีกลับรายงาน"}
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
                    isAction
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400",
                  )}
                >
                  {isAction ? <Gavel size={14} /> : <ShieldOff size={14} />}
                </span>
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {isAction
                    ? `ดำเนินการกับ "${target.productName || "สินค้าถูกลบ"}"`
                    : `ตีกลับรายงานของ ${target.reporterName || "ผู้รายงาน"}`}
                </h2>
              </div>

              <span
                className={cn(
                  "rounded border px-2 py-0.5 text-[10px] font-semibold shrink-0 ml-2",
                  isAction
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
                    : "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60",
                )}
              >
                {isAction ? "พบการละเมิดจริง" : "ตีกลับ / ไม่ละเมิด"}
              </span>
            </div>

            {/* Layer 2: Inner Content Canvas */}
            <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {isAction
                  ? "บันทึกว่าตรวจพบการละเมิดจริง — ผู้รายงานจะได้รับแจ้งผลทางอีเมล/กระดิ่ง"
                  : "ออเดอร์ไม่ผิดกฎ — เหตุผลนี้จะส่งถึงผู้รายงาน (จำเป็น) และเขารายงานซ้ำเรื่องเดิมได้อีก"}
              </p>

              {target.details && (
                <blockquote className="rounded-md border border-zinc-200/80 bg-zinc-50/70 p-3 text-[12px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">ผู้รายงานแจ้ง:</span> “{target.details}”
                </blockquote>
              )}

              {isAction && (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-zinc-200/80 bg-zinc-50/50 p-3 text-[12px] dark:border-zinc-800 dark:bg-zinc-900/30">
                  <input
                    type="checkbox"
                    checked={unpublish}
                    onChange={(event) => setUnpublish(event.target.checked)}
                    className="mt-0.5 size-4 accent-[#1b64f2]"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    ริบสินค้ากลับเป็นฉบับร่าง (unpublish)
                    <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                      ศิลปินได้อีเมล+notify แก้ไขแล้วยื่นเผยแพร่ใหม่ได้
                    </span>
                  </span>
                </label>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {isAction ? "ชี้แจงผลการตรวจสอบ (ไม่บังคับ)" : "เหตุผลที่ต้องตีกลับ (จำเป็น)"}
                </label>
                <textarea
                  autoFocus
                  rows={3}
                  maxLength={1000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    isAction
                      ? "ระบุรายละเอียดเพิ่มเติมสำหรับการดำเนินการ..."
                      : "ระบุเหตุผลที่ตีกลับรายงานนี้..."
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
                disabled={busy || (!isAction && !note.trim())}
                onClick={() =>
                  onSubmit(note.trim(), isAction ? unpublish : false)
                }
                className={cn(
                  "cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-2xs disabled:cursor-not-allowed disabled:opacity-50",
                  isAction
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700",
                )}
              >
                {busy
                  ? "กำลังบันทึก…"
                  : isAction
                    ? "ยืนยันว่าละเมิดจริง"
                    : "ตีกลับรายงาน"}
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
      header: "สินค้าถูกรายงาน",
      cell: (row) => (
        <NameCell
          label={row.productName || "สินค้าถูกลบ"}
          meta={`#${row.entityId} · ${REASON_LABEL[row.reason] ?? row.reason}`}
        />
      ),
      exportValue: (row) => `${row.productName} (${row.reason})`,
    },
    {
      key: "reporter",
      header: "ผู้รายงาน",
      cell: (row) => (
        <NameCell
          label={row.reporterName || "—"}
          meta={row.reporterUsername ? `@${row.reporterUsername}` : null}
        />
      ),
      exportValue: (row) => row.reporterName ?? "",
    },
    {
      key: "details",
      header: "รายละเอียด",
      cell: (row) => (
        <div className="min-w-0 max-w-[260px]">
          {row.details ? (
            <p className="line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              {row.details}
            </p>
          ) : (
            <span className="text-[11px] text-zinc-300 dark:text-zinc-600">
              ไม่ระบุ
            </span>
          )}
        </div>
      ),
      exportValue: (row) => row.details ?? "",
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (row) => <StatusCell status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "createdAt",
      header: "รายงานเมื่อ",
      align: "end",
      cell: (row) => <TimeCell value={row.createdAt} />,
      exportValue: (row) => row.createdAt,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (row) => (
        <RowActionsMenu
          label={`ตัวเลือกของรายงาน #${row.id}`}
          actions={[
            {
              key: "action_taken",
              label: "ดำเนินการตามนโยบาย",
              icon: Gavel,
              disabled: row.status !== "pending",
              onSelect: () => onResolve(row, "action_taken"),
            },
            {
              key: "dismissed",
              label: "ตีกลับ (ไม่ละเมิด)",
              icon: ShieldOff,
              tone: "danger",
              disabled: row.status !== "pending",
              onSelect: () => onResolve(row, "dismissed"),
            },
          ]}
        />
      ),
    },
  ];
}

function ReportsScreen() {
  const [target, setTarget] = useState(null);
  const [mode, setMode] = useState(null);
  const mutation = useResolveReport();

  const submit = (note, unpublish) => {
    mutation.mutate(
      {
        id: target.id,
        decision: mode,
        adminNote: note || undefined,
        unpublishProduct: Boolean(unpublish),
      },
      {
        onSuccess: () => {
          toast.success(
            mode === "action_taken"
              ? "บันทึกการดำเนินการแล้ว"
              : "ตีกลับรายงานแล้ว",
            mode === "action_taken"
              ? unpublish
                ? "สินค้าถูกริบเป็นฉบับร่าง + แจ้งทั้งสองฝ่ายแล้ว"
                : "แจ้งผู้รายงานแล้ว"
              : "ผู้รายงานจะได้รับเหตุผลทางอีเมล/กระดิ่ง",
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
        title="รายงานจากผู้ใช้"
        description="ผู้ชมรายงานสินค้าผิดกฎ — ชี้ขาดแล้วระบบแจ้งผลผู้รายงาน (และศิลปินเมื่อริบสินค้า) อัตโนมัติ"
        collection="reports"
        useCollectionQuery={useReports}
        searchPlaceholder="ค้นหาชื่อสินค้า / ผู้รายงาน / เหตุผล..."
        statusOptions={statusOptions(REPORT_STATUSES, { allLabel: "ทุกสถานะ" })}
        sortOptions={SORT_OPTIONS}
        defaultSort="createdAt:desc"
        topContent={({ data, isLoading }) => {
          const rows = data?.rows ?? [];
          const pendingCount = rows.filter((r) => r.status === "pending").length;
          const actionTakenCount = rows.filter((r) => r.status === "action_taken").length;
          const dismissedCount = rows.filter((r) => r.status === "dismissed").length;
          const totalCount = data?.total ?? rows.length;

          return (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <TwoToneStatCard
                icon={AlertTriangle}
                label="ค้างตรวจสอบ"
                value={pendingCount}
                hint="ต้องได้รับการพิจารณา"
                hintClass="text-amber-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={CheckCircle2}
                label="ดำเนินการแล้ว"
                value={actionTakenCount}
                hint="พบการละเมิดจริง"
                hintClass="text-emerald-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={XCircle}
                label="ตีกลับ / ยกเลิก"
                value={dismissedCount}
                hint="ไม่พบการละเมิด"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={Flag}
                label="รายงานทั้งหมด"
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
        exportFilename="commi-reports"
        emptyTitle="ไม่มีรายงานค้างคิว"
        emptyDescription="คอมมูนิตี้สงบเรียบร้อยดีในช่วงนี้ 🎨"
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

export default function ReportsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <ReportsScreen />
    </Suspense>
  );
}
