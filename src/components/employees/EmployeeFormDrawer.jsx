"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle2,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserCog,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const DEPARTMENTS = [
  { id: "engineering", label: "Engineering & IT", labelTh: "เทคโนโลยีและระบบสารสนเทศ", icon: ShieldCheck },
  { id: "support", label: "Customer Care & Support", labelTh: "บริการลูกค้าและช่วยเหลือ", icon: UserCheck },
  { id: "finance", label: "Finance & Accounting", labelTh: "การเงินและบัญชี", icon: Briefcase },
  { id: "operations", label: "Trust & Community Safety", labelTh: "ตรวจสอบเนื้อหาและความปลอดภัย", icon: Shield },
  { id: "marketing", label: "Marketing & Growth", labelTh: "การตลาดและการเติบโต", icon: Sparkles },
];

export const ROLES = [
  { id: "super_admin", label: "Super Administrator", department: "engineering", desc: "สิทธิ์สูงสุด เข้าถึงและจัดการได้ทุกระบบ" },
  { id: "security_officer", label: "Security & Compliance Officer", department: "engineering", desc: "ดูแลความปลอดภัย ตรวจสอบการเข้าถึง และ Audit Trail" },
  { id: "support_lead", label: "Support Team Lead", department: "support", desc: "หัวหน้าทีมบริการลูกค้า ดูแลข้อพิพาทและเคสพิเศษ" },
  { id: "support_agent", label: "Support Agent", department: "support", desc: "เจ้าหน้าที่บริการลูกค้า ตรวจสอบสถานะคำสั่งซื้อ" },
  { id: "finance_manager", label: "Finance & Payout Manager", department: "finance", desc: "อนุมัติคิวถอนเงินศิลปิน และสรุปบัญชีรายรับ-จ่าย" },
  { id: "content_moderator", label: "Content & Trust Moderator", department: "operations", desc: "ตรวจสอบสินค้าใหม่ ใบสมัครศิลปิน และรายงานความปลอดภัย" },
  { id: "marketing_admin", label: "Growth & Marketing Admin", department: "marketing", desc: "จัดการโปรโมชั่น โค้ดส่วนลด และแบนเนอร์หน้าแรก" },
];

export const PERMISSION_GROUPS = [
  {
    id: "users_creators",
    title: "ผู้ใช้งานและครีเอเตอร์",
    permissions: [
      { id: "manage_users", label: "จัดการผู้ใช้งาน / ระงับบัญชี" },
      { id: "review_creator_applications", label: "ตรวจสอบและอนุมัติใบสมัครศิลปิน" },
    ],
  },
  {
    id: "commerce_content",
    title: "สินค้า คำสั่งซื้อ และโปรโมชั่น",
    permissions: [
      { id: "manage_products", label: "จัดการสินค้าและหมวดหมู่" },
      { id: "manage_orders", label: "ดูและอัปเดตสถานะคำสั่งซื้อ" },
      { id: "manage_promotions", label: "สร้างและจัดการโปรโมชั่น / โค้ดส่วนลด" },
      { id: "manage_posts", label: "ดูแลและจัดการโพสต์คอมมูนิตี้" },
    ],
  },
  {
    id: "finance_payouts",
    title: "การเงินและคิวถอนเงิน",
    permissions: [
      { id: "view_finances", label: "ดูรายงานรายรับ-รายได้รวมของแพลตฟอร์ม" },
      { id: "manage_payouts", label: "อนุมัติและโอนเงินคิวถอนเงินศิลปิน" },
      { id: "export_tax_reports", label: "ส่งออกรายงานภาษีและเอกสารทางบัญชี" },
    ],
  },
  {
    id: "trust_system",
    title: "ความปลอดภัยและการดูแลระบบ",
    permissions: [
      { id: "handle_disputes", label: "ตัดสินข้อพิพาทและคำร้องขอคืนเงิน" },
      { id: "handle_reports", label: "ตรวจสอบและชี้ขาดรายงานร้องเรียน" },
      { id: "audit_logs", label: "เข้าถึงและตรวจสอบ Audit Logs" },
      { id: "manage_employees", label: "จัดการข้อมูลและสิทธิ์ทีมงาน " },
      { id: "system_settings", label: "ปรับแต่งการตั้งค่าระบบหลัก (System Settings)" },
    ],
  },
];

export default function EmployeeFormDrawer({
  isOpen = false,
  onClose,
  initialData = null,
  onSubmit,
  busy = false,
}) {
  const isEdit = Boolean(initialData?.id);

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("support");
  const [role, setRole] = useState("support_agent");
  const [status, setStatus] = useState("active");
  const [location, setLocation] = useState("Bangkok HQ");
  const [avatarBg, setAvatarBg] = useState("#1b64f2");
  const [permissions, setPermissions] = useState([]);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setNickname(initialData.nickname || "");
      setUsername(initialData.username || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setPosition(initialData.position || "");
      setDepartment(initialData.department || "support");
      setRole(initialData.role || "support_agent");
      setStatus(initialData.status || "active");
      setLocation(initialData.location || "Bangkok HQ");
      setAvatarBg(initialData.avatarBg || "#1b64f2");
      setPermissions(initialData.permissions || ["manage_orders"]);
      setNotes(initialData.notes || "");
      setErrorMsg("");
    } else {
      // Default new employee
      setName("");
      setNickname("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPosition("");
      setDepartment("support");
      setRole("support_agent");
      setStatus("active");
      setLocation("Bangkok HQ");
      setAvatarBg("#1b64f2");
      setPermissions(["manage_orders", "handle_disputes"]);
      setNotes("");
      setErrorMsg("");
    }
  }, [initialData, isOpen]);

  // Auto-fill default permissions and position based on role selection
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const roleObj = ROLES.find((r) => r.id === newRole);
    if (roleObj) {
      setDepartment(roleObj.department);
      if (!isEdit && !position) {
        setPosition(roleObj.label);
      }
      if (newRole === "super_admin") {
        setPermissions(PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id)));
      } else if (newRole === "support_lead") {
        setPermissions(["manage_users", "manage_orders", "handle_disputes", "handle_reports", "audit_logs"]);
      } else if (newRole === "finance_manager") {
        setPermissions(["manage_orders", "manage_payouts", "view_finances", "export_tax_reports", "audit_logs"]);
      } else if (newRole === "content_moderator") {
        setPermissions(["manage_products", "manage_posts", "handle_reports", "review_creator_applications"]);
      } else if (newRole === "marketing_admin") {
        setPermissions(["manage_promotions", "manage_products", "view_finances"]);
      } else if (newRole === "security_officer") {
        setPermissions(["manage_users", "audit_logs", "system_settings"]);
      } else if (newRole === "support_agent") {
        setPermissions(["manage_orders", "handle_disputes"]);
      }
    }
  };

  const togglePermission = (permId) => {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const selectAllPermissions = () => {
    const all = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id));
    setPermissions(all);
  };

  const clearAllPermissions = () => {
    setPermissions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("กรุณากรอกชื่อ-นามสกุลของเจ้าหน้าที่");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    const deptObj = DEPARTMENTS.find((d) => d.id === department);
    const roleObj = ROLES.find((r) => r.id === role);

    const payload = {
      name: name.trim(),
      nickname: nickname.trim(),
      username: username.trim() || name.toLowerCase().replace(/\s+/g, "."),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      position: position.trim() || roleObj?.label || "Staff Member",
      department,
      departmentLabel: deptObj?.label || department,
      role,
      roleLabel: roleObj?.label || role,
      status,
      location: location.trim(),
      avatarBg,
      permissions,
      notes: notes.trim(),
    };

    try {
      setErrorMsg("");
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

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
              aria-label={isEdit ? "แก้ไขข้อมูลเจ้าหน้าที่" : "เพิ่มเจ้าหน้าที่ใหม่"}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-full sm:max-w-2xl bg-white dark:bg-zinc-900 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800 shadow-2xl flex flex-col h-full"
            >
              {/* Drawer Top Header (Sticky) */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9.5 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0 dark:bg-blue-500">
                    <UserCog size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                      {isEdit ? "แก้ไขข้อมูลเจ้าหน้าที่ (Edit Staff)" : "เพิ่มพนักงาน / เจ้าหน้าที่ใหม่ (New Staff)"}
                    </h2>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {isEdit
                        ? `รหัส ${initialData.employeeCode || initialData.id} · ปรับปรุงสิทธิ์การเข้าถึง (RBAC)`
                        : "สร้างบัญชีทีมงาน กำหนดแผนก บทบาท และสิทธิ์การใช้งานระบบ"}
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

              {/* Form Body (Scrollable with elegant styling) */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                  {errorMsg && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                      <AlertCircle className="size-4 shrink-0 text-rose-600" />
                      <span className="font-medium">{errorMsg}</span>
                    </div>
                  )}

                  {/* Section 1: General Information & Contact */}
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-2.5 dark:border-zinc-800">
                      <User size={14} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        1. ข้อมูลทั่วไปและช่องทางติดต่อ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="เช่น ฐิติกร สุวรรณศรี"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          ชื่อเล่น (Nickname)
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น ท็อป, แนน, นนท์"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          อีเมลบริษัท (Work Email) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={13} className="absolute left-3 top-2.5 text-zinc-400" />
                          <input
                            type="email"
                            required
                            placeholder="staff@commi.co"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          เบอร์โทรศัพท์ติดต่อ
                        </label>
                        <div className="relative">
                          <Phone size={13} className="absolute left-3 top-2.5 text-zinc-400" />
                          <input
                            type="tel"
                            placeholder="08x-xxx-xxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          ชื่อผู้ใช้ระบบ (Username)
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น thitikorn.top"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          สถานที่ปฏิบัติงาน (Location)
                        </label>
                        <div className="relative">
                          <MapPin size={13} className="absolute left-3 top-2.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="เช่น Bangkok HQ / Remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Department, Role & Status */}
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-2.5 dark:border-zinc-800">
                      <Briefcase size={14} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        2. ตำแหน่ง แผนก และระดับสิทธิ์
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          ระดับสิทธิ์และบทบาท (Role Level)
                        </label>
                        <select
                          value={role}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100"
                        >
                          {ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          สังกัดแผนก (Department)
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.label} ({d.labelTh})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          ชื่อตำแหน่งเฉพาะ (Job Title / Position)
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น Senior Financial Controller"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          สถานะการปฏิบัติงาน (Status)
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100"
                        >
                          <option value="active">Active (ปฏิบัติงานอยู่)</option>
                          <option value="on_leave">On Leave (ลาพักงาน / ลาพักร้อน)</option>
                          <option value="inactive">Inactive (พักการใช้งาน / สิ้นสุดสัญญา)</option>
                          <option value="suspended">Suspended (ระงับสิทธิ์ชั่วคราว)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Permission Matrix (RBAC) */}
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2.5 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <KeyRound size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          3. การกำหนดสิทธิ์การเข้าถึง (RBAC Permissions)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={selectAllPermissions}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                        >
                          เลือกทั้งหมด
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <button
                          type="button"
                          onClick={clearAllPermissions}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          ล้างสิทธิ์
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {PERMISSION_GROUPS.map((group) => (
                        <div key={group.id} className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                            {group.title}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.permissions.map((p) => {
                              const isChecked = permissions.includes(p.id);
                              return (
                                <label
                                  key={p.id}
                                  onClick={() => togglePermission(p.id)}
                                  className={cn(
                                    "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none",
                                    isChecked
                                      ? "border-blue-200 bg-blue-50/80 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-200 font-medium shadow-2xs"
                                      : "border-zinc-200/90 bg-white text-zinc-600 hover:bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "size-4 rounded-md flex items-center justify-center border transition-colors shrink-0",
                                      isChecked
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                                    )}
                                  >
                                    {isChecked && <Check size={11} strokeWidth={3} />}
                                  </div>
                                  <span className="text-[11px] leading-tight">{p.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Notes */}
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      หมายเหตุเพิ่มเติม / หน้าที่รับผิดชอบ
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เช่น ผู้ดูแลระบบหลัก ดูแลโครงสร้าง Infrastructure และความปลอดภัยทั้งระบบ"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Drawer Sticky Bottom Footer */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-200/80 bg-zinc-50/95 dark:border-zinc-800 dark:bg-zinc-900/90 backdrop-blur-sm shrink-0">
                  <span className="text-[11px] text-zinc-400">
                    {permissions.length} สิทธิ์ที่เลือกไว้
                  </span>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={busy}
                      className="btn-secondary rounded-lg px-4 py-2 text-xs font-medium cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="btn-primary rounded-lg px-5 py-2 text-xs font-semibold cursor-pointer"
                    >
                      {busy ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มเจ้าหน้าที่"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
