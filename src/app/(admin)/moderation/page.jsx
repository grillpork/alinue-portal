"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Gavel,
  History,
  Image as ImageIcon,
  Info,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  X,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import StatusChip from "@/components/ui/StatusChip";
import { toast } from "@/components/ui/Toast";
import {
  useModerationAppeals,
  useModerationLogs,
  useModerationStats,
  useReviewModerationAppeal,
} from "@/hooks/useAdminData";
import { cn } from "@/utils/cn";

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

/**
 * Modal สำหรับพิจารณาคำอุทธรณ์ (Human Review Modal)
 */
function AppealDecisionModal({ appeal, mode, onClose, onConfirm, isSubmitting }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!appeal) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [appeal, onClose]);

  if (!appeal || !mode) return null;
  const isApprove = mode === "approve";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", damping: 26, stiffness: 420 }}
          className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg border",
                  isApprove
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400"
                )}
              >
                {isApprove ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </span>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {isApprove ? "อนุมัติคำร้องอุทธรณ์ (ปลดบล็อก)" : "ปฏิเสธคำร้องอุทธรณ์"}
                </h3>
                <p className="text-xs text-zinc-500">
                  คำอุทธรณ์ #{appeal.id} • ผู้ส่ง: {appeal.user?.name || appeal.user?.username || "Guest"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <X size={16} />
            </button>
          </div>

          {/* Details summary */}
          <div className="my-4 space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs dark:border-zinc-800/80 dark:bg-zinc-950/50">
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">เหตุผลที่ AI ตรวจจับ:</span>
              <ul className="mt-1 list-inside list-disc text-rose-600 dark:text-rose-400">
                {appeal.reasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">ข้อความชี้แจงจากผู้ใช้:</span>
              <p className="mt-1 italic text-zinc-600 dark:text-zinc-400">
                "{appeal.appealReason}"
              </p>
            </div>
          </div>

          {/* Input note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {isApprove ? "บันทึกของเจ้าหน้าที่ (ไม่บังคับ):" : "เหตุผลในการปฏิเสธ (จำเป็น):"}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isApprove
                  ? "เช่น ตรวจสอบแล้วเป็นภาพวาดสรีระทางการแพทย์/ศิลปะ ไม่มีเจตนาลามกอนาจาร..."
                  : "ระบุเหตุผลที่ปฏิเสธ เช่น ภาพมีเนื้อหาที่ละเมิดมาตรฐานชุมชนจริง..."
              }
              className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400"
            />
          </div>

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting || (!isApprove && !note.trim())}
              className={
                isApprove
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              }
              onClick={() => onConfirm(appeal.id, mode, note)}
            >
              {isSubmitting ? "กำลังบันทึก..." : isApprove ? "ยืนยันอนุมัติและปลดบล็อก" : "ยืนยันการปฏิเสธ"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Image Preview Drawer/Dialog with Safety Blur Toggle
 */
function ImageDetailModal({ item, onClose }) {
  const [isBlurred, setIsBlurred] = useState(true);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-zinc-500" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              พรีวิวรูปภาพ #{item.id}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsBlurred((v) => !v)}
              className="flex items-center gap-1.5"
            >
              {isBlurred ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>{isBlurred ? "แสดงรูปชัด" : "เบลอเพื่อความปลอดภัย"}</span>
            </Button>
            <button
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative mt-3 flex min-h-[260px] max-h-[420px] items-center justify-center overflow-hidden rounded-lg bg-zinc-950">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt="Flagged media"
              className={cn(
                "max-h-[400px] w-auto max-w-full object-contain transition-all duration-200",
                isBlurred ? "blur-xl scale-105" : "blur-none scale-100"
              )}
            />
          ) : (
            <div className="text-center text-xs text-zinc-500">
              ไม่มีรูปภาพ หรือรูปถูกลบออกจาก R2 ไปแล้ว
            </div>
          )}

          {isBlurred && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBlurred(false)}
                className="bg-black/60 text-white border-white/20 backdrop-blur-md hover:bg-black/80"
              >
                <Eye size={14} className="mr-1.5" />
                คลิกเพื่อดูรูปภาพ (Sensitive Content)
              </Button>
            </div>
          )}
        </div>

        {/* Reasons & Scores */}
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-950">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">ข้อหาที่ระบบตรวจพบ:</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {item.reasons?.map((r, i) => (
              <span
                key={i}
                className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-400"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState("appeals"); // 'appeals' | 'logs'
  const [appealStatusFilter, setAppealStatusFilter] = useState("pending");
  const [logCategoryFilter, setLogCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [decisionModal, setDecisionModal] = useState({ appeal: null, mode: null });
  const [previewItem, setPreviewItem] = useState(null);

  // Queries
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useModerationStats();
  const {
    data: appealsData,
    isLoading: isAppealsLoading,
    refetch: refetchAppeals,
    isRefetching: isAppealsRefetching,
  } = useModerationAppeals({
    status: appealStatusFilter,
    search: searchQuery || undefined,
  });

  const {
    data: logsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
    isRefetching: isLogsRefetching,
  } = useModerationLogs({
    category: logCategoryFilter !== "all" ? logCategoryFilter : undefined,
    search: searchQuery || undefined,
  });

  // Mutation
  const reviewMutation = useReviewModerationAppeal();

  const handleDecision = async (appealId, action, reviewerNote) => {
    try {
      await reviewMutation.mutateAsync({
        id: appealId,
        action,
        reviewerNote,
      });
      toast.success(
        action === "approve"
          ? "อนุมัติคำร้องอุทธรณ์เรียบร้อยแล้ว (ปลดบล็อกสำเร็จ)"
          : "ปฏิเสธคำร้องอุทธรณ์เรียบร้อยแล้ว"
      );
      setDecisionModal({ appeal: null, mode: null });
      refetchAppeals();
      refetchStats();
    } catch (err) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการพิจารณาคำร้อง");
    }
  };

  const appealsList = appealsData?.data || [];
  const logsList = logsData?.data || [];

  return (
    <div className="space-y-6 p-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            ตรวจสอบภาพและคำอุทธรณ์ (Content Moderation & Appeals)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            ระบบความปลอดภัย 4 ขั้น: บล็อกเนื้อหาอันตราย (อนาจาร, อาวุธ, ความรุนแรง) พร้อมคิวพิจารณาคำร้องอุทธรณ์ (False Positive)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchStats();
            refetchAppeals();
            refetchLogs();
          }}
          disabled={isAppealsRefetching || isLogsRefetching}
          className="self-start sm:self-auto flex items-center gap-1.5"
        >
          <RefreshCw
            size={13}
            className={cn(isAppealsRefetching || isLogsRefetching ? "animate-spin" : "")}
          />
          <span>รีเฟรชข้อมูล</span>
        </Button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TwoToneStatCard
          icon={ShieldAlert}
          label="คำอุทธรณ์รอตรวจสอบ"
          value={stats?.pendingAppeals ?? 0}
          hint={stats?.pendingAppeals > 0 ? "ต้องการการตรวจสอบจากแอดมิน" : "ไม่มีคำร้องค้าง"}
          hintClass={stats?.pendingAppeals > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}
          loading={isStatsLoading}
        />
        <TwoToneStatCard
          icon={XCircle}
          label="สกัดภาพอันตรายทั้งหมด"
          value={stats?.totalBlocked ?? 0}
          hint={`ใน 24 ชั่วโมงล่าสุด: ${stats?.blocked24h ?? 0} รูป`}
          hintClass="text-rose-600 dark:text-rose-400"
          loading={isStatsLoading}
        />
        <TwoToneStatCard
          icon={CheckCircle2}
          label="อนุมัติคำอุทธรณ์แล้ว"
          value={stats?.approvedAppeals ?? 0}
          hint="ปลดบล็อก False Positive ให้ผู้ใช้"
          hintClass="text-emerald-600 dark:text-emerald-400"
          loading={isStatsLoading}
        />
        <TwoToneStatCard
          icon={History}
          label="ประวัติสแกนทั้งหมด"
          value={stats?.totalLogs ?? 0}
          hint="บันทึกใน moderation_logs"
          loading={isStatsLoading}
        />
      </div>

      {/* Main Tabs Header */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("appeals")}
          className={cn(
            "relative pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 px-4",
            activeTab === "appeals"
              ? "text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100"
              : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <Gavel size={15} />
          <span>คิวพิจารณาคำอุทธรณ์ (Human Moderator Queue)</span>
          {stats?.pendingAppeals > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {stats.pendingAppeals}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "relative pb-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 px-4",
            activeTab === "logs"
              ? "text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100"
              : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <History size={15} />
          <span>บันทึกความปลอดภัยภาพทั้งหมด (Moderation Logs)</span>
        </button>
      </div>

      {/* TAB 1: APPEALS QUEUE */}
      {activeTab === "appeals" && (
        <div className="space-y-4">
          {/* Sub Filters Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg dark:bg-zinc-800/60">
              {[
                { id: "pending", label: "รอตรวจสอบ" },
                { id: "approved", label: "อนุมัติแล้ว" },
                { id: "rejected", label: "ปฏิเสธแล้ว" },
                { id: "all", label: "ทั้งหมด" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAppealStatusFilter(tab.id)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold transition-all",
                    appealStatusFilter === tab.id
                      ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ใช้, เหตุผล..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Appeals Table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">รูปภาพ</th>
                    <th className="px-4 py-3">ผู้ส่งคำร้อง</th>
                    <th className="px-4 py-3">AI Detection</th>
                    <th className="px-4 py-3">เหตุผลการอุทธรณ์</th>
                    <th className="px-4 py-3">สถานะ</th>
                    <th className="px-4 py-3">วันที่ส่ง</th>
                    <th className="px-4 py-3 text-right">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {isAppealsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        กำลังโหลดรายการอุทธรณ์...
                      </td>
                    </tr>
                  ) : appealsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        ไม่พบรายการคำอุทธรณ์ในสถานะนี้
                      </td>
                    </tr>
                  ) : (
                    appealsList.map((appeal) => (
                      <tr key={appeal.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        {/* Image Preview Thumbnail */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setPreviewItem(appeal)}
                            className="group relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                          >
                            {appeal.imageUrl ? (
                              <img
                                src={appeal.imageUrl}
                                alt="thumb"
                                className="size-full object-cover blur-xs transition group-hover:blur-none"
                              />
                            ) : (
                              <ImageIcon size={18} className="text-zinc-400" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                              <Eye size={14} className="text-white" />
                            </div>
                          </button>
                        </td>

                        {/* Submitter User */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {appeal.user?.name || appeal.user?.username || "Guest"}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            @{appeal.user?.username || "unknown"} • IP: {appeal.ipAddress || "—"}
                          </div>
                        </td>

                        {/* AI Detection tags */}
                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="flex flex-wrap gap-1">
                            {appeal.reasons?.map((r, i) => (
                              <span
                                key={i}
                                className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 line-clamp-1"
                              >
                                {r.replace(/ตรวจพบ|\(.*\)/g, "").trim()}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Appeal reason */}
                        <td className="px-4 py-3 max-w-[260px]">
                          <p className="line-clamp-2 text-zinc-700 dark:text-zinc-300 italic">
                            "{appeal.appealReason}"
                          </p>
                          {appeal.reviewerNote && (
                            <p className="mt-1 text-[10px] text-zinc-400">
                              <span className="font-semibold text-zinc-600 dark:text-zinc-300">Admin Note:</span> {appeal.reviewerNote}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusChip status={appeal.status} />
                        </td>

                        {/* Created At */}
                        <td className="px-4 py-3 text-zinc-400 text-[11px] whitespace-nowrap">
                          {new Date(appeal.createdAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          {appeal.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="xs"
                                variant="outline"
                                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                onClick={() => setDecisionModal({ appeal, mode: "approve" })}
                              >
                                อนุมัติ
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                onClick={() => setDecisionModal({ appeal, mode: "reject" })}
                              >
                                ปฏิเสธ
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-400">
                              {appeal.status === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธแล้ว"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Logs Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg dark:bg-zinc-800/60">
              {[
                { id: "all", label: "หมวดหมู่ทั้งหมด" },
                { id: "nudity", label: "อนาจาร (Nudity)" },
                { id: "weapon", label: "อาวุธ (Weapon)" },
                { id: "gore", label: "ความรุนแรง (Gore)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLogCategoryFilter(cat.id)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold transition-all",
                    logCategoryFilter === cat.id
                      ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="ค้นหา IP, ผู้ใช้, URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">รูปภาพ</th>
                    <th className="px-4 py-3">ผู้ใช้ / IP Address</th>
                    <th className="px-4 py-3">ผลการตรวจจับ (Categories)</th>
                    <th className="px-4 py-3">สถานะความปลอดภัย</th>
                    <th className="px-4 py-3">Action ที่ดำเนินการ</th>
                    <th className="px-4 py-3">เวลาที่บันทึก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {isLogsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        กำลังโหลดบันทึกความปลอดภัย...
                      </td>
                    </tr>
                  ) : logsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        ไม่พบบันทึกการตรวจจับที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    logsList.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        {/* Thumbnail */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setPreviewItem(log)}
                            className="group relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                          >
                            {log.imageUrl ? (
                              <img
                                src={log.imageUrl}
                                alt="thumb"
                                className="size-full object-cover blur-xs transition group-hover:blur-none"
                              />
                            ) : (
                              <ImageIcon size={16} className="text-zinc-400" />
                            )}
                          </button>
                        </td>

                        {/* User / IP */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {log.user?.name || log.user?.username || "Guest"}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            IP: {log.ipAddress || "—"}
                          </div>
                        </td>

                        {/* Reasons */}
                        <td className="px-4 py-3 max-w-[260px]">
                          {log.reasons?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {log.reasons.map((r, i) => (
                                <span
                                  key={i}
                                  className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                                >
                                  {r.replace(/ตรวจพบ|\(.*\)/g, "").trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ปลอดภัย (Safe)
                            </span>
                          )}
                        </td>

                        {/* isSafe */}
                        <td className="px-4 py-3">
                          {log.isSafe ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={12} /> ผ่าน
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              <ShieldX size={12} /> ไม่ผ่าน
                            </span>
                          )}
                        </td>

                        {/* Action Taken */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                              log.actionTaken === "rejected_and_deleted"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                : log.actionTaken === "approved_on_appeal"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            )}
                          >
                            {log.actionTaken === "rejected_and_deleted"
                              ? "ลบจาก R2"
                              : log.actionTaken === "approved_on_appeal"
                              ? "ปลดบล็อกหลังอุทธรณ์"
                              : log.actionTaken}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-zinc-400 text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decisionModal.appeal && (
        <AppealDecisionModal
          appeal={decisionModal.appeal}
          mode={decisionModal.mode}
          onClose={() => setDecisionModal({ appeal: null, mode: null })}
          onConfirm={handleDecision}
          isSubmitting={reviewMutation.isPending}
        />
      )}

      {/* Image Preview Detail Modal */}
      {previewItem && (
        <ImageDetailModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}

