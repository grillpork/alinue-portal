"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  X,
} from "lucide-react";
import DualBadge from "@/components/ui/DualBadge";
import { getStatus } from "@/lib/statusRegistry";
import { formatRelativeTime } from "@/lib/formatters";
import { PERMISSION_GROUPS } from "./EmployeeFormDrawer";

export default function EmployeeDetailDrawer({
  isOpen = false,
  onClose,
  employee = null,
  onEdit,
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

  if (!employee) return null;

  const statusMeta = getStatus(employee.status);

  // Flatten permission label lookup
  const permMap = {};
  PERMISSION_GROUPS.forEach((group) => {
    group.permissions.forEach((p) => {
      permMap[p.id] = { label: p.label, group: group.title };
    });
  });

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
              aria-label="รายละเอียดเจ้าหน้าที่"
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
                    style={{ backgroundColor: employee.avatarBg || "#1b64f2" }}
                    className="size-12 rounded-xl text-white flex items-center justify-center text-lg font-bold shadow-sm ring-4 ring-white dark:ring-zinc-900 shrink-0 select-none"
                  >
                    {employee.nickname ? employee.nickname.slice(0, 1) : employee.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        {employee.name}
                      </h2>
                      {employee.nickname && (
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          ({employee.nickname})
                        </span>
                      )}
                      <DualBadge
                        left={{
                          label: statusMeta.labelTh,
                          icon: statusMeta.icon,
                          tone: statusMeta.tone,
                        }}
                        right={{
                          label: employee.departmentLabel || employee.roleLabel || "Staff",
                          icon: Shield,
                          tone: "neutral",
                        }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                      @{employee.username} · รหัส {employee.employeeCode || employee.id}
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

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                {/* Quick Metrics & Department */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850/60">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">ตำแหน่ง</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
                      {employee.position || employee.roleLabel}
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850/60">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">แผนกสังกัด</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
                      {employee.departmentLabel}
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850/60 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">เข้าสู่ระบบล่าสุด</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                      {employee.lastLogin ? formatRelativeTime(employee.lastLogin) : "ยังไม่เคยเข้าสู่ระบบ"}
                    </span>
                  </div>
                </div>

                {/* Contact Details Card */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-850/40 space-y-2.5">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    ข้อมูลการติดต่อและสถานที่ทำงาน
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-zinc-400 shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-zinc-400 shrink-0" />
                      <span>{employee.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-zinc-400 shrink-0" />
                      <span>{employee.location || "Bangkok HQ"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-zinc-400 shrink-0" />
                      <span>เริ่มงาน: {formatRelativeTime(employee.joinedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-850/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <KeyRound size={13} className="text-blue-600 dark:text-blue-400" />
                      <span>สิทธิ์การใช้งานระบบ ({employee.permissions?.length || 0} สิทธิ์)</span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {employee.permissions && employee.permissions.length > 0 ? (
                      employee.permissions.map((permId) => (
                        <span
                          key={permId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-[11px] font-medium border border-blue-200/60 dark:border-blue-900/60"
                        >
                          <CheckCircle2 size={11} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{permMap[permId]?.label || permId}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">ไม่มีสิทธิ์พิเศษ</span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {employee.notes && (
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-850/60 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      หน้าที่รับผิดชอบและหมายเหตุ:
                    </span>
                    {employee.notes}
                  </div>
                )}
              </div>

              {/* Drawer Bottom Footer (Sticky) */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-200/80 bg-zinc-50/95 dark:border-zinc-800 dark:bg-zinc-900/80 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit?.(employee);
                  }}
                  className="btn-primary rounded-lg px-4.5 py-2 text-xs font-semibold cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>แก้ไขข้อมูลและสิทธิ์</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
