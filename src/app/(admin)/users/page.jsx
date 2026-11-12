"use client";

import { Suspense } from "react";
import {
  Ban,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import {
  CountCell,
  MoneyCell,
  NameCell,
  StatusCell,
  TimeCell,
} from "@/components/shared/cells";
import { useUsers } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { storefrontUrl } from "@/lib/links";
import { cn } from "@/utils/cn";

const USER_STATUSES = ["active", "pending", "suspended"];

const SORT_OPTIONS = [
  { value: "joinedAt:desc", label: "สมัครล่าสุด" },
  { value: "revenue:desc", label: "รายได้สูงสุด" },
  { value: "products:desc", label: "จำนวนสินค้าสูงสุด" },
  { value: "name:asc", label: "ชื่อ ก-ฮ" },
];

const ROLE_LABEL = {
  admin: "ผู้ดูแลระบบ",
  creator: "ครีเอเตอร์",
  client: "ผู้ซื้อ",
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

function buildColumns({ changeStatus, isPending }) {
  return [
    {
      key: "name",
      header: "บัญชีผู้ใช้",
      cell: (user) => (
        <NameCell
          label={user.name}
          meta={`@${user.username} · ${user.email}`}
        />
      ),
      exportValue: (user) => `${user.name} (@${user.username})`,
    },
    {
      key: "role",
      header: "บทบาท",
      cell: (user) => (
        <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
          {ROLE_LABEL[user.role] ?? user.role}
        </span>
      ),
      exportValue: (user) => user.role,
    },
    {
      key: "products",
      header: "สินค้า",
      align: "end",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (user) => <CountCell value={user.products} />,
      exportValue: (user) => user.products,
    },
    {
      key: "sales",
      header: "ยอดขาย",
      align: "end",
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (user) => <CountCell value={user.sales} />,
      exportValue: (user) => user.sales,
    },
    {
      key: "revenue",
      header: "รายได้สะสม",
      align: "end",
      cell: (user) => <MoneyCell amount={user.revenue} />,
      exportValue: (user) => user.revenue,
    },
    {
      key: "joinedAt",
      header: "สมัครเมื่อ",
      align: "end",
      className: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (user) => <TimeCell value={user.joinedAt} />,
      exportValue: (user) => user.joinedAt,
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (user) => <StatusCell status={user.status} />,
      exportValue: (user) => user.status,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (user) => (
        <RowActionsMenu
          busy={isPending}
          label={`ตัวเลือกของ ${user.name}`}
          actions={[
            {
              key: "approve",
              label: "อนุมัติบัญชี",
              icon: UserCheck,
              disabled: user.status === "active",
              onSelect: () =>
                changeStatus(user, "active", {
                  successTitle: "อนุมัติบัญชีแล้ว",
                }),
            },
            {
              key: "suspend",
              label: "ระงับบัญชี",
              icon: Ban,
              tone: "danger",
              disabled: user.status === "suspended" || user.role === "admin",
              confirm: {
                title: `ระงับบัญชี @${user.username}?`,
                description:
                  "สินค้าทั้งหมดจะถูกซ่อนชั่วคราว และบัญชีจะเข้าสู่ระบบไม่ได้จนกว่าจะได้รับการอนุมัติอีกครั้ง",
                confirmLabel: "ระงับบัญชี",
              },
              onSelect: () =>
                changeStatus(user, "suspended", {
                  successTitle: "ระงับบัญชีแล้ว",
                }),
            },
            {
              key: "open",
              label: "เปิดโปรไฟล์หน้าร้าน",
              icon: ExternalLink,
              onSelect: () =>
                window.open(
                  storefrontUrl(`/@${user.username}`),
                  "_blank",
                  "noopener",
                ),
            },
          ]}
        />
      ),
    },
  ];
}

function UsersScreen() {
  return (
    <AdminListScreen
      title="ผู้ใช้งานทั้งหมด"
      description="อนุมัติครีเอเตอร์ใหม่ ตรวจสอบบทบาท และระงับบัญชีที่ละเมิดกฎ"
      collection="users"
      useCollectionQuery={useUsers}
      searchPlaceholder="ค้นหาชื่อ ยูสเซอร์เนม หรืออีเมล..."
      statusOptions={statusOptions(USER_STATUSES, { allLabel: "ทุกสถานะ" })}
      sortOptions={SORT_OPTIONS}
      defaultSort="joinedAt:desc"
      topContent={({ data, isLoading }) => {
        const rows = data?.rows ?? [];
        const creatorsCount = rows.filter((u) => u.role === "creator").length;
        const clientsCount = rows.filter((u) => u.role === "client" || (!u.role && u.role !== "admin")).length;
        const suspendedCount = rows.filter((u) => u.status === "suspended").length;
        const totalCount = data?.total ?? rows.length;

        return (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <TwoToneStatCard
              icon={Users}
              label="ผู้ใช้งานทั้งหมด"
              value={totalCount}
              hint="บัญชีที่ลงทะเบียนในระบบ"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={Sparkles}
              label="ครีเอเตอร์ (Creators)"
              value={creatorsCount}
              hint="มีสิทธิ์สร้างและวางขายสินค้า"
              hintClass="text-[#1b64f2] font-semibold"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={ShoppingBag}
              label="ผู้ซื้อทั่วไป (Clients)"
              value={clientsCount}
              hint="บัญชีผู้ซื้อในระบบ"
              hintClass="text-emerald-500 font-semibold"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={Ban}
              label="ถูกระงับบัญชี"
              value={suspendedCount}
              hint="ระงับการเข้าสู่ระบบ"
              hintClass="text-rose-500 font-semibold"
              loading={isLoading}
            />
          </div>
        );
      }}
      columns={buildColumns}
      exportFilename="commi-users"
      emptyTitle="ไม่พบผู้ใช้งานที่ตรงเงื่อนไข"
      emptyDescription="ลองค้นหาด้วย @username หรืออีเมลของบัญชี"
      minWidth="62rem"
    />
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <UsersScreen />
    </Suspense>
  );
}
