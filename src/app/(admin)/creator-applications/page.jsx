"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  ImageIcon,
  Images,
  Palette,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import { NameCell, StatusCell, TimeCell } from "@/components/shared/cells";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import CreatorPortfolioDrawer from "@/components/creator-applications/CreatorPortfolioDrawer";
import {
  useCreatorApplications,
  useReviewCreatorApplication,
} from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { cn } from "@/utils/cn";

const CATEGORY_LABEL = {
  illustration: "ภาพประกอบ",
  "3d": "3D",
  photo: "ภาพถ่าย",
  music: "เพลง/เสียง",
  writing: "งานเขียน",
  comic: "การ์ตูน",
  "game-asset": "Asset เกม",
  other: "อื่นๆ",
};

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "ส่งล่าสุด" },
  { value: "createdAt:asc", label: "รอนานที่สุด" },
  { value: "willSellNsfw:desc", label: "18+ ขึ้นก่อน" },
];

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

/* ── Reject dialog (Two-Tone Layered Inset Style) ── */
function RejectDialog({ target, onClose, onSubmit, busy }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!target) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [target, onClose]);

  return (
    <AnimatePresence>
      {target && (
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
            aria-label={`ปฏิเสธใบสมัครของ ${target.displayName}`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 420 }}
            className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70"
          >
            {/* Layer 1: Header Shell */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400 shadow-2xs">
                  <UserX size={14} />
                </span>
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  ปฏิเสธใบสมัครของ {target.displayName}
                </h2>
              </div>

              <span className="rounded border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/60 dark:text-rose-300 shrink-0 ml-2">
                ไม่อนุมัติ
              </span>
            </div>

            {/* Layer 2: Inner Content Canvas */}
            <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between rounded-md border border-zinc-200/80 bg-zinc-50/60 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400">ผู้สมัคร</span>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {target.displayName} <span className="text-zinc-400 font-normal">(@{target.applicantUsername})</span>
                  </p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {target.applicantEmail}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                เหตุผลนี้จะส่งให้ผู้สมัครเห็นในระบบ เพื่อให้เขาสามารถปรับปรุงผลงานและยื่นใบสมัครใหม่ได้
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  ระบุเหตุผลที่ปฏิเสธ (จำเป็น)
                </label>
                <textarea
                  autoFocus
                  rows={3}
                  maxLength={1000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="เช่น ลิงก์ portfolio เข้าไม่ถึง / ภาพตัวอย่างไม่ชัดเจนว่าทำเอง / ละเมิดลิขสิทธิ์"
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
                disabled={!note.trim() || busy}
                onClick={() => onSubmit(note.trim())}
                className="cursor-pointer rounded-md bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 shadow-2xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "กำลังบันทึก…" : "ปฏิเสธใบสมัคร"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Columns ── */
function buildColumns({ decide, setRejectTarget, onOpenPortfolio, busy }) {
  return [
    {
      key: "displayName",
      header: "ศิลปินที่สมัคร",
      cell: (row) => (
        <NameCell
          label={row.displayName}
          meta={`@${row.applicantUsername} · ${row.applicantEmail}`}
        />
      ),
      exportValue: (row) => `${row.displayName} (@${row.applicantUsername})`,
    },
    {
      key: "categories",
      header: "หมวดหมู่",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-[12px] text-zinc-600 dark:text-zinc-300">
          {(row.categories || [])
            .map((c) => CATEGORY_LABEL[c] ?? c)
            .join(" · ") || "—"}
        </span>
      ),
      exportValue: (row) => (row.categories || []).join("/"),
    },
    {
      key: "evidence",
      header: "หลักฐานและผลงาน",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenPortfolio(row)}
            className="btn-secondary rounded-lg px-2.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <Eye size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>ดูผลงาน</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono font-medium">
              {(row.sampleUrls || []).length}
            </span>
          </button>

          {/* Quick Thumbnails */}
          <div
            onClick={() => onOpenPortfolio(row)}
            className="hidden sm:flex items-center gap-1 cursor-pointer group"
            title="คลิกเพื่อดูผลงานและหลักฐานทั้งหมด"
          >
            {(row.sampleUrls || []).slice(0, 3).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`ผลงานตัวอย่างชิ้นที่ ${i + 1}`}
                loading="lazy"
                className="size-7.5 rounded-lg border border-zinc-200/80 object-cover dark:border-zinc-700 group-hover:opacity-80 transition-opacity"
              />
            ))}
            {(row.sampleUrls || []).length > 3 && (
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                +{(row.sampleUrls || []).length - 3}
              </span>
            )}
          </div>
        </div>
      ),
      exportValue: (row) =>
        `${(row.sampleUrls || []).length} ชิ้น / ${(row.portfolioUrls || []).length} ลิงก์`,
    },
    {
      key: "willSellNsfw",
      header: "เนื้อหา",
      align: "center",
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (row) =>
        row.willSellNsfw ? (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20">
            18+
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 ring-1 ring-zinc-200/70 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700/70">
            ทั่วไป
          </span>
        ),
      exportValue: (row) => (row.willSellNsfw ? "18+" : "ทั่วไป"),
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (row) => <StatusCell status={row.status} />,
      exportValue: (row) => row.status,
    },
    {
      key: "createdAt",
      header: "ส่งเมื่อ",
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
        const isPending = row.status === "pending";
        return (
          <RowActionsMenu
            busy={busy}
            label={`ตัวเลือกของใบสมัคร ${row.displayName}`}
            actions={[
              {
                key: "view_portfolio",
                label: "ดูผลงานและพอร์ตโฟลิโอ",
                icon: Eye,
                onSelect: () => onOpenPortfolio(row),
              },
              {
                key: "approve",
                label: "อนุมัติเป็นศิลปิน",
                icon: UserCheck,
                disabled: !isPending,
                confirm: {
                  title: `อนุมัติใบสมัครของ ${row.displayName}?`,
                  description: `บัญชี @${row.applicantUsername} จะได้ role creator และสร้างสินค้าได้ทันที การกระทำนี้ย้อนกลับด้วยตนเองในหน้าผู้ใช้งานเท่านั้น`,
                  confirmLabel: "อนุมัติ",
                },
                onSelect: () => decide(row, "approved"),
              },
              {
                key: "reject",
                label: "ปฏิเสธพร้อมเหตุผล",
                icon: UserX,
                tone: "danger",
                disabled: !isPending,
                onSelect: () => setRejectTarget(row),
              },
              ...(row.portfolioUrls || []).slice(0, 3).map((p, i) => ({
                key: `open-${i}`,
                label: `เปิด ${p.platform || "ลิงก์"} ของผู้สมัคร`,
                icon: ExternalLink,
                onSelect: () => window.open(p.url, "_blank", "noopener"),
              })),
            ]}
          />
        );
      },
    },
  ];
}

function CreatorApplicationsScreen() {
  const review = useReviewCreatorApplication();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  const decide = (row, decision, reviewNote) => {
    review.mutate(
      { id: row.id, decision, reviewNote },
      {
        onSuccess: () =>
          toast.success(
            decision === "approved"
              ? "อนุมัติเป็นศิลปินแล้ว"
              : "ปฏิเสธใบสมัครแล้ว",
            decision === "approved"
              ? `${row.displayName} ได้สิทธิ์สร้างสินค้าทันที`
              : `${row.displayName} จะเห็นเหตุผลและยื่นใหม่ได้`,
          ),
        onError: (error) =>
          toast.error(
            "บันทึกไม่สำเร็จ",
            error?.message || error?.error || "ใบสมัครอาจถูกตรวจไปแล้ว",
          ),
      },
    );
  };

  return (
    <>
      <AdminListScreen
        title="ใบสมัครศิลปิน"
        description="ตรวจหลักฐานความเป็นเจ้าของก่อนเปิดสิทธิ์วางขาย — อนุมัติแล้ว role จะอัปเดตทันที"
        collection="creator-applications"
        useCollectionQuery={useCreatorApplications}
        searchPlaceholder="ค้นนามปากกา ยูสเซอร์เนม หรืออีเมลผู้สมัคร..."
        statusOptions={statusOptions(["pending", "approved", "rejected"], {
          allLabel: "ทุกสถานะ",
        })}
        sortOptions={SORT_OPTIONS}
        defaultSort="createdAt:desc"
        topContent={({ data, isLoading }) => {
          const rows = data?.rows ?? [];
          const pendingCount = rows.filter((r) => r.status === "pending").length;
          const approvedCount = rows.filter((r) => r.status === "approved").length;
          const rejectedCount = rows.filter((r) => r.status === "rejected").length;
          const totalCount = data?.total ?? rows.length;

          return (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <TwoToneStatCard
                icon={AlertTriangle}
                label="รอตรวจสอบ"
                value={pendingCount}
                hint="ต้องตรวจผลงานและอนุมัติ"
                hintClass="text-amber-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={UserCheck}
                label="อนุมัติเป็นศิลปินแล้ว"
                value={approvedCount}
                hint="พร้อมลงขายสินค้า"
                hintClass="text-emerald-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={UserX}
                label="ปฏิเสธแล้ว"
                value={rejectedCount}
                hint="ไม่ผ่านเกณฑ์เบื้องต้น"
                hintClass="text-rose-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={UserPlus}
                label="ใบสมัครทั้งหมด"
                value={totalCount}
                hint="บันทึกในระบบ"
                loading={isLoading}
              />
            </div>
          );
        }}
        columns={({ isPending }) =>
          buildColumns({
            decide,
            setRejectTarget,
            onOpenPortfolio: setSelectedPortfolio,
            busy: isPending || review.isPending,
          })
        }
        exportFilename="commi-creator-applications"
        emptyTitle="ไม่มีใบสมัครตรงเงื่อนไข"
        emptyDescription="ลองสลับตัวกรองสถานะ หรือรีเฟรชอีกครั้ง"
        minWidth="66rem"
      />

      {/* Portfolio Viewer Drawer */}
      <CreatorPortfolioDrawer
        isOpen={Boolean(selectedPortfolio)}
        onClose={() => setSelectedPortfolio(null)}
        application={selectedPortfolio}
        onApprove={(app) => {
          decide(app, "approved");
          setSelectedPortfolio(null);
        }}
        onReject={(app) => {
          setRejectTarget(app);
          setSelectedPortfolio(null);
        }}
        busy={review.isPending}
      />

      {/* Reject Reason Dialog */}
      <RejectDialog
        key={rejectTarget?.id ?? "closed"}
        target={rejectTarget}
        busy={review.isPending}
        onClose={() => setRejectTarget(null)}
        onSubmit={(note) => {
          decide(rejectTarget, "rejected", note);
          setRejectTarget(null);
        }}
      />
    </>
  );
}

export default function CreatorApplicationsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <CreatorApplicationsScreen />
    </Suspense>
  );
}
