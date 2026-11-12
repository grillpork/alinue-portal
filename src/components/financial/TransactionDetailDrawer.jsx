"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Landmark,
  Layers,
  Printer,
  Receipt,
  Scale,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import DualBadge from "@/components/ui/DualBadge";
import { getStatus } from "@/lib/statusRegistry";
import { formatBaht, formatRelativeTime } from "@/lib/formatters";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/utils/cn";

export default function TransactionDetailDrawer({
  isOpen = false,
  onClose,
  transaction = null,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!transaction) return null;

  const statusMeta = getStatus(transaction.status);

  const handleCopyRef = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกรหัสอ้างอิงแล้ว", text);
  };

  const isIncome = transaction.netAmount > 0 && transaction.type !== "creator_payout";
  const isPayout = transaction.type === "creator_payout";
  const isRefund = transaction.type === "refund";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 flex w-full max-w-full pl-0 sm:pl-10 justify-end">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="รายละเอียดรายการเดินบัญชี"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-full sm:max-w-xl bg-white dark:bg-zinc-900 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800 shadow-2xl flex flex-col h-full"
            >
              {/* Drawer Top Header (Sticky) */}
              <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-850 dark:to-zinc-900 px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      "size-12 rounded-xl text-white flex items-center justify-center text-lg font-bold shadow-sm ring-4 ring-white dark:ring-zinc-900 shrink-0",
                      isIncome
                        ? "bg-blue-600"
                        : isPayout
                        ? "bg-purple-600"
                        : isRefund
                        ? "bg-rose-600"
                        : "bg-zinc-700"
                    )}
                  >
                    <Landmark size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                        {transaction.ref}
                      </h2>
                      <DualBadge
                        left={{
                          label: statusMeta.labelTh,
                          icon: statusMeta.icon,
                          tone: statusMeta.tone,
                        }}
                        right={{
                          label: transaction.channel || "PromptPay",
                          icon: CreditCard,
                          tone: "neutral",
                        }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {transaction.typeLabel}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body (Hidden Scrollbar) */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                {/* Amount Hero Card */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      ยอดสุทธิ (Net Amount)
                    </span>
                    <span
                      className={cn(
                        "text-2xl sm:text-3xl font-bold tracking-tight font-sans tabular-nums mt-0.5 block",
                        transaction.netAmount < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-zinc-900 dark:text-zinc-50"
                      )}
                    >
                      {formatBaht(transaction.netAmount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400 block">ยอดรวมก่อนหัก (Gross)</span>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                      {formatBaht(transaction.grossAmount)}
                    </span>
                  </div>
                </div>

                {/* Financial Ledger Breakdown Breakdown */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-850/40 space-y-2.5">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Receipt size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>รายละเอียดการแจกแจงค่าธรรมเนียมและภาษี (Itemized Breakdown)</span>
                  </h3>

                  <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-xs">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-zinc-600 dark:text-zinc-400">1. ยอดเรียกเก็บรวม (Gross Transaction)</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                        {formatBaht(transaction.grossAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-zinc-600 dark:text-zinc-400">2. ส่วนแบ่งค่าธรรมเนียมแพลตฟอร์ม Commi (10%)</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                        - {formatBaht(transaction.feeAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-zinc-600 dark:text-zinc-400">3. ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax - WHT)</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
                        - {formatBaht(transaction.whtAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100/60 dark:bg-zinc-800/60 px-2 rounded-lg mt-1">
                      <span>คงเหลือสุทธิ (Settlement Net Amount)</span>
                      <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                        {formatBaht(transaction.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Counterparty & Order Context */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-850/40 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <User size={14} className="text-purple-600 dark:text-purple-400" />
                    <span>ข้อมูลคู่สัญญาและปลายทาง (Counterparty Details)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">คู่สัญญา / ผู้เกี่ยวข้อง</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-0.5 truncate">
                        {transaction.partyName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 block">บัญชีปลายทาง / ช่องทาง</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-0.5 truncate">
                        {transaction.payoutAccount || transaction.channel}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 block">เลขอ้างอิงคำสั่งซื้อ (Order Number)</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                          {transaction.orderNumber || "—"}
                        </span>
                        {transaction.orderNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopyRef(transaction.orderNumber)}
                            className="text-zinc-400 hover:text-blue-600 cursor-pointer"
                            title="คัดลอกเลขอ้างอิง"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 block">ใบกำกับภาษี / เอกสารอ้างอิง (Tax Invoice)</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold block mt-0.5">
                        {transaction.vatInvoiceNumber || "รอนำส่งในรอบสิ้นเดือน"}
                      </span>
                    </div>
                  </div>

                  {transaction.description && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">บันทึกรายการ:</span>
                      {transaction.description}
                    </div>
                  )}
                </div>

                {/* Settlement Timeline */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-850/40 space-y-2.5">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>ลำดับเวลาการทำธุรกรรม (Settlement Log)</span>
                  </h3>

                  <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span>สร้างรายการในระบบ:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {formatRelativeTime(transaction.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>เวลาที่ตัดรอบ / ชำระเสร็จสมบูรณ์:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {transaction.settledAt ? formatRelativeTime(transaction.settledAt) : "รอยืนยันจาก Payment Gateway"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Footer (Sticky Action Bar) */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-200/80 bg-zinc-50/95 dark:border-zinc-800 dark:bg-zinc-900/90 backdrop-blur-sm shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("ส่งออกสลิปรายการสำเร็จ", `ใบเสร็จรับเงิน ${transaction.ref}`);
                    }}
                    className="btn-primary rounded-lg px-4.5 py-2 text-xs font-semibold cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>พิมพ์ใบเสร็จ / ใบกำกับ</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
