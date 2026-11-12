"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Layers,
  Scale,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/utils/cn";

const TAX_REPORTS = [
  {
    id: "pnd53",
    title: "รายงานภาษีหัก ณ ที่จ่าย (ภ.ง.ด.3 / ภ.ง.ด.53)",
    code: "PND.53 / PND.3",
    desc: "สรุปรายการหักภาษี 3% ของศิลปินและคู่ค้าประจำเดือน พร้อมนำส่งกรมสรรพากร",
    icon: Scale,
    format: "CSV / Text RD Format",
  },
  {
    id: "pp30",
    title: "รายงานภาษีมูลค่าเพิ่ม (ภ.พ.30 / ภาษีขาย)",
    code: "PP.30 (VAT 7%)",
    desc: "รายงานสรุปภาษีขาย 7% จากค่าธรรมเนียมแพลตฟอร์ม Commi ประจำงวดบัญชี",
    icon: Landmark,
    format: "Excel / PDF",
  },
  {
    id: "pl_monthly",
    title: "งบกำไรขาดทุนและกระแสเงินสด (Monthly P&L Statement)",
    code: "P&L Statement",
    desc: "สรุปรายรับ GMV, ส่วนแบ่งคอมมิชชัน, ค่าธรรมเนียม Payment Gateway และยอดจ่ายสุทธิ",
    icon: FileSpreadsheet,
    format: "Excel (.xlsx)",
  },
  {
    id: "creator_summary",
    title: "สรุปการจ่ายเงินศิลปินรายบุคคล (Creator Payout Ledger)",
    code: "Payout Ledger",
    desc: "รายละเอียดการโอนเงินเข้าบัญชีศิลปินทุกคน พร้อมเลขอ้างอิงธนาคาร",
    icon: FileText,
    format: "CSV (.csv)",
  },
];

const MONTH_OPTIONS = [
  { value: "2026-09", label: "กันยายน 2026 (เดือนปัจจุบัน)" },
  { value: "2026-08", label: "สิงหาคม 2026" },
  { value: "2026-07", label: "กรกฎาคม 2026" },
  { value: "2026-06", label: "มิถุนายน 2026" },
  { value: "2026-Q3", label: "ไตรมาสที่ 3/2026 (Q3 Summary)" },
  { value: "2026-YTD", label: "สรุปตั้งแต่ต้นปี (Year-To-Date 2026)" },
];

export default function TaxExportModal({ isOpen = false, onClose }) {
  const [selectedReport, setSelectedReport] = useState("pnd53");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleExport = () => {
    const reportObj = TAX_REPORTS.find((r) => r.id === selectedReport);
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success(
        "ดาวน์โหลดรายงานสำเร็จ",
        `${reportObj?.title} สำหรับรอบ ${selectedMonth} ถูกสร้างเรียบร้อยแล้ว`
      );
      onClose?.();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Box */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-2xl overflow-hidden z-10 select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs dark:bg-blue-500">
                  <Scale size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50">
                    ส่งออกเอกสารภาษีและงบบัญชี (Tax & Ledger Export)
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    เลือกรูปแบบรายงานและรอบบัญชีที่ต้องการดาวน์โหลด
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Period Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  เลือกรอบบัญชี / งวดภาษี (Accounting Period)
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Options List */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  เลือกประเภทรายงานภาษี (Report Format)
                </label>

                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
                  {TAX_REPORTS.map((report) => {
                    const isSelected = selectedReport === report.id;
                    const Icon = report.icon;
                    return (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className={cn(
                          "p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                          isSelected
                            ? "border-blue-500 bg-blue-50/70 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-100 shadow-2xs"
                            : "border-zinc-200 bg-white hover:bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                        )}
                      >
                        <div
                          className={cn(
                            "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          )}
                        >
                          <Icon size={16} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold truncate">
                              {report.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                              {report.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                            {report.desc}
                          </p>
                          <span className="text-[10px] text-zinc-400 block mt-1 font-medium">
                            รูปแบบไฟล์: {report.format}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExport}
                className="btn-primary rounded-lg px-4.5 py-2 text-xs font-semibold cursor-pointer"
              >
                <Download size={14} />
                <span>{isExporting ? "กำลังประมวลผล..." : "ดาวน์โหลดเอกสาร"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
