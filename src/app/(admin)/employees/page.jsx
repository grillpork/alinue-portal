"use client";

import { Suspense, useState } from "react";
import {
  Ban,
  Briefcase,
  Building2,
  CheckCircle,
  Eye,
  KeyRound,
  Pencil,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import StatusChip from "@/components/ui/StatusChip";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import EmployeeFormDrawer from "@/components/employees/EmployeeFormDrawer";
import EmployeeDetailDrawer from "@/components/employees/EmployeeDetailDrawer";
import { useEmployeeMutations, useEmployees } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/utils/cn";

const EMPLOYEE_STATUSES = ["active", "on_leave", "inactive", "suspended"];

const SORT_OPTIONS = [
  { value: "joinedAt:desc", label: "เริ่มงานล่าสุด" },
  { value: "name:asc", label: "ชื่อ ก-ฮ" },
  { value: "role:asc", label: "ระดับสิทธิ์" },
  { value: "department:asc", label: "แผนก" },
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

function EmployeesScreen() {
  const { create, update, remove } = useEmployeeMutations();

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Delete Confirm Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    if (editingEmployee) {
      await update.mutateAsync({ id: editingEmployee.id, payload });
      toast.success("อัปเดตข้อมูลเจ้าหน้าที่แล้ว", `${payload.name} (${payload.roleLabel})`);
    } else {
      await create.mutateAsync(payload);
      toast.success("เพิ่มเจ้าหน้าที่ใหม่สำเร็จ", `${payload.name} ได้รับสิทธิ์เข้าใช้งานระบบแล้ว`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await remove.mutateAsync(deleteTarget.id);
      toast.success("ลบข้อมูลเจ้าหน้าที่แล้ว", `ลบ ${deleteTarget.name} ออกจากระบบเรียบร้อย`);
      setDeleteTarget(null);
    } catch (err) {
      toast.danger("ไม่สามารถลบเจ้าหน้าที่ได้", err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsDeleting(false);
    }
  };

  const buildColumns = ({ changeStatus, isPending }) => [
    {
      key: "name",
      header: "เจ้าหน้าที่ / รหัสพนักงาน",
      cell: (emp) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            style={{ backgroundColor: emp.avatarBg || "#1b64f2" }}
            className="size-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs select-none"
          >
            {emp.nickname ? emp.nickname.slice(0, 1) : emp.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">
                {emp.name}
              </span>
              {emp.nickname && (
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  ({emp.nickname})
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {emp.employeeCode || emp.id} · @{emp.username}
            </p>
          </div>
        </div>
      ),
      exportValue: (emp) => `${emp.name} (${emp.nickname || ""}) [${emp.employeeCode || emp.id}]`,
    },
    {
      key: "position",
      header: "ตำแหน่งและแผนก",
      cell: (emp) => (
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">
            {emp.position || emp.roleLabel}
          </p>
          <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
            {emp.departmentLabel}
          </p>
        </div>
      ),
      exportValue: (emp) => `${emp.position} - ${emp.departmentLabel}`,
    },
    {
      key: "role",
      header: "บทบาทสิทธิ์",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (emp) => {
        const isSuper = emp.role === "super_admin";
        const isSec = emp.role === "security_officer";
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border",
              isSuper
                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                : isSec
                ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800"
                : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
            )}
          >
            {isSuper ? <ShieldAlert size={10} /> : <Shield size={10} />}
            <span>{emp.roleLabel}</span>
          </span>
        );
      },
      exportValue: (emp) => emp.roleLabel,
    },
    {
      key: "email",
      header: "อีเมล / เบอร์โทร",
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (emp) => (
        <div className="min-w-0 text-xs">
          <p className="truncate text-zinc-700 dark:text-zinc-300">{emp.email}</p>
          {emp.phone && (
            <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {emp.phone}
            </p>
          )}
        </div>
      ),
      exportValue: (emp) => `${emp.email} ${emp.phone ? `(${emp.phone})` : ""}`,
    },
    {
      key: "permissions",
      header: "สิทธิ์ที่ได้รับ",
      align: "center",
      className: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (emp) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-[11px] font-medium border border-blue-200/60 dark:border-blue-900/60 tabular-nums">
          <KeyRound size={10} />
          <span>{emp.permissions?.length || 0} สิทธิ์</span>
        </span>
      ),
      exportValue: (emp) => (emp.permissions || []).join(", "),
    },
    {
      key: "lastLogin",
      header: "เข้าใช้งานล่าสุด",
      align: "end",
      className: "hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      cell: (emp) => (
        <span className="text-[12px] whitespace-nowrap text-zinc-500 dark:text-zinc-400">
          {emp.lastLogin ? formatRelativeTime(emp.lastLogin) : "—"}
        </span>
      ),
      exportValue: (emp) => emp.lastLogin || "Never",
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (emp) => <StatusChip status={emp.status} />,
      exportValue: (emp) => emp.status,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (emp) => (
        <RowActionsMenu
          busy={isPending || isDeleting}
          label={`ตัวเลือกของ ${emp.name}`}
          actions={[
            {
              key: "view",
              label: "ดูโปรไฟล์และสิทธิ์",
              icon: Eye,
              onSelect: () => setViewingEmployee(emp),
            },
            {
              key: "edit",
              label: "แก้ไขข้อมูลและสิทธิ์",
              icon: Pencil,
              onSelect: () => handleOpenEdit(emp),
            },
            {
              key: "activate",
              label: "เปลี่ยนสถานะเป็นพร้อมทำงาน",
              icon: CheckCircle,
              disabled: emp.status === "active",
              onSelect: () =>
                changeStatus(emp, "active", {
                  successTitle: "เปลี่ยนสถานะเจ้าหน้าที่แล้ว",
                }),
            },
            {
              key: "leave",
              label: "บันทึกการลาพักงาน (On Leave)",
              icon: UserCog,
              disabled: emp.status === "on_leave",
              onSelect: () =>
                changeStatus(emp, "on_leave", {
                  successTitle: "บันทึกการลาพักงานแล้ว",
                }),
            },
            {
              key: "suspend",
              label: "ระงับสิทธิ์เข้าใช้งานชั่วคราว",
              icon: Ban,
              tone: "danger",
              disabled: emp.status === "suspended" || emp.role === "super_admin",
              confirm: {
                title: `ระงับสิทธิ์เจ้าหน้าที่ ${emp.name}?`,
                description: "เจ้าหน้าที่จะไม่สามารถเข้าสู่ระบบแดชบอร์ดได้จนกว่าจะเปิดสิทธิ์ใหม่อีกครั้ง",
                confirmLabel: "ระงับสิทธิ์",
              },
              onSelect: () =>
                changeStatus(emp, "suspended", {
                  successTitle: "ระงับสิทธิ์เจ้าหน้าที่แล้ว",
                }),
            },
            {
              key: "delete",
              label: "ลบเจ้าหน้าที่ออกจากระบบ",
              icon: Trash2,
              tone: "danger",
              disabled: emp.role === "super_admin",
              onSelect: () => setDeleteTarget(emp),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <AdminListScreen
        title="เจ้าหน้าที่และสิทธิ์ทีมงาน (Employees & Staff)"
        description="จัดการรายชื่อผู้ดูแลระบบ กำหนดบทบาท สังกัดแผนก และควบคุมสิทธิ์การเข้าถึง (RBAC)"
        collection="employees"
        useCollectionQuery={useEmployees}
        searchPlaceholder="ค้นหาชื่อ รหัสพนักงาน แผนก หรืออีเมล..."
        statusOptions={statusOptions(EMPLOYEE_STATUSES, { allLabel: "ทุกสถานะ" })}
        sortOptions={SORT_OPTIONS}
        defaultSort="joinedAt:desc"
        extraActions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <UserPlus size={13} />
            <span>เพิ่มเจ้าหน้าที่</span>
          </button>
        }
        topContent={({ data, isLoading }) => {
          const rows = data?.rows ?? [];
          const activeCount = rows.filter((e) => e.status === "active").length;
          const deptsCount = new Set(rows.map((e) => e.department)).size;
          const superAdminsCount = rows.filter((e) => e.role === "super_admin" || e.role === "security_officer").length;
          const totalCount = data?.total ?? rows.length;

          return (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <TwoToneStatCard
                icon={Users}
                label="เจ้าหน้าที่ทั้งหมด"
                value={totalCount}
                hint="ทีมงานในระบบทั้งหมด"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={UserCheck}
                label="พร้อมปฏิบัติงาน (Active)"
                value={activeCount}
                hint="กำลังปฏิบัติหน้าที่อยู่"
                hintClass="text-emerald-500 font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={Building2}
                label="สังกัดแผนกงาน"
                value={`${deptsCount} แผนก`}
                hint="Engineering, Support, Finance..."
                hintClass="text-[#1b64f2] font-semibold"
                loading={isLoading}
              />
              <TwoToneStatCard
                icon={ShieldAlert}
                label="Super Admins & SecOps"
                value={superAdminsCount}
                hint="ผู้ดูแลสิทธิ์สูงสุดของระบบ"
                hintClass="text-purple-500 font-semibold"
                loading={isLoading}
              />
            </div>
          );
        }}
        columns={buildColumns}
        exportFilename="commi-employees"
        emptyTitle="ไม่พบข้อมูลเจ้าหน้าที่ที่ตรงเงื่อนไข"
        emptyDescription="ลองปรับตัวกรอง แผนก หรือค้นหาด้วยชื่อ/รหัสพนักงาน"
        minWidth="64rem"
      />

      {/* Form Drawer (Create & Edit) */}
      <EmployeeFormDrawer
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingEmployee}
        onSubmit={handleFormSubmit}
        busy={create.isPending || update.isPending}
      />

      {/* Detail Drawer (View Profile & Permissions) */}
      <EmployeeDetailDrawer
        isOpen={Boolean(viewingEmployee)}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee}
        onEdit={handleOpenEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`ลบเจ้าหน้าที่ ${deleteTarget?.name}?`}
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบ ${deleteTarget?.name} (${deleteTarget?.position || deleteTarget?.roleLabel}) ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบเจ้าหน้าที่"
        cancelLabel="ยกเลิก"
        destructive={true}
        busy={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <EmployeesScreen />
    </Suspense>
  );
}
