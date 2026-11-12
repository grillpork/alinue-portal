"use client";

import { Suspense } from "react";
import { Archive, CheckCircle2, ExternalLink, Package, Pause, Play, ShoppingBag } from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import {
  CountCell,
  MoneyCell,
  NameCell,
  PersonCell,
  RateCell,
  StatusCell,
  TimeCell,
} from "@/components/shared/cells";
import { useProducts } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { storefrontUrl } from "@/lib/links";

const PRODUCT_STATUSES = [
  "active",
  "draft",
  "review",
  "paused",
  "reported",
  "archived",
];

const SORT_OPTIONS = [
  { value: "updatedAt:desc", label: "อัปเดตล่าสุด" },
  { value: "revenue:desc", label: "รายได้สูงสุด" },
  { value: "sales:desc", label: "ยอดขายสูงสุด" },
  { value: "name:asc", label: "ชื่อ ก-ฮ" },
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
        {hint && (
          <p className={`mt-1.5 text-[11px] ${hintClass || "text-zinc-400 dark:text-zinc-500"}`}>
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
      header: "สินค้า",
      cell: (product) => (
        <NameCell
          label={product.name}
          meta={`${product.category} · ${product.trigger}`}
        />
      ),
      exportValue: (product) => product.name,
    },
    {
      key: "creator",
      header: "ครีเอเตอร์",
      cell: (product) => (
        <PersonCell
          name={product.creator.name}
          username={product.creator.username}
        />
      ),
      exportValue: (product) => `@${product.creator.username}`,
    },
    {
      key: "price",
      header: "ราคา",
      align: "end",
      cell: (product) =>
        product.price === 0 ? (
          <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
            FREE
          </span>
        ) : (
          <MoneyCell amount={product.price} />
        ),
      exportValue: (product) => product.price,
    },
    {
      key: "sales",
      header: "ยอดขาย",
      align: "end",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (product) => <CountCell value={product.sales} />,
      exportValue: (product) => product.sales,
    },
    {
      key: "successRate",
      header: "อัตราปิดการขาย",
      align: "end",
      className: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (product) => <RateCell value={product.successRate} />,
      exportValue: (product) => product.successRate,
    },
    {
      key: "updatedAt",
      header: "อัปเดต",
      align: "end",
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (product) => <TimeCell value={product.updatedAt} />,
      exportValue: (product) => product.updatedAt,
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (product) => <StatusCell status={product.status} />,
      exportValue: (product) => product.status,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (product) => (
        <RowActionsMenu
          busy={isPending}
          label={`ตัวเลือกของ ${product.name}`}
          actions={[
            {
              key: "publish",
              label: "เผยแพร่สินค้า",
              icon: Play,
              disabled: product.status === "active",
              onSelect: () =>
                changeStatus(product, "active", {
                  successTitle: "เผยแพร่สินค้าแล้ว",
                }),
            },
            {
              key: "pause",
              label: "พักชั่วคราว",
              icon: Pause,
              disabled: product.status !== "active",
              onSelect: () =>
                changeStatus(product, "paused", {
                  successTitle: "พักการเผยแพร่แล้ว",
                }),
            },
            {
              key: "open",
              label: "เปิดหน้าสินค้า",
              icon: ExternalLink,
              onSelect: () =>
                window.open(
                  storefrontUrl(`/products/${product.id}`),
                  "_blank",
                  "noopener",
                ),
            },
            {
              key: "archive",
              label: "ส่งเข้าคลังถาวร",
              icon: Archive,
              tone: "danger",
              confirm: {
                title: "ส่งสินค้านี้เข้าคลังถาวร?",
                description: `“${product.name}” จะถูกซ่อนจากหน้าร้านทันที ครีเอเตอร์จะกลับมาเปิดขายได้เองภายหลัง`,
                confirmLabel: "ย้ายเข้าคลัง",
              },
              onSelect: () =>
                changeStatus(product, "archived", {
                  successTitle: "ย้ายเข้าคลังถาวรแล้ว",
                }),
            },
          ]}
        />
      ),
    },
  ];
}

function ProductsScreen() {
  return (
    <AdminListScreen
      title="คลังสินค้าทั้งหมด"
      description="ตรวจสอบ อนุมัติ และควบคุมการมองเห็นสินค้าดิจิทัลทั้งระบบ"
      collection="products"
      useCollectionQuery={useProducts}
      searchPlaceholder="ค้นหาสินค้าหรือครีเอเตอร์..."
      statusOptions={statusOptions(PRODUCT_STATUSES, { allLabel: "ทุกสถานะ" })}
      sortOptions={SORT_OPTIONS}
      columns={buildColumns}
      exportFilename="commi-products"
      emptyTitle="ไม่พบสินค้าที่ตรงเงื่อนไข"
      emptyDescription="ลองปรับตัวกรองสถานะ หรือค้นหาด้วยชื่อครีเอเตอร์"
      topContent={({ rows, isLoading }) => {
        const activeCount = rows.filter((r) => r.status === "active").length;
        const pausedCount = rows.filter((r) => r.status === "paused").length;
        const archivedCount = rows.filter((r) => r.status === "archived").length;
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TwoToneStatCard
              icon={CheckCircle2}
              label="เปิดขายอยู่"
              value={activeCount}
              hint="แสดงบนหน้าร้าน"
              hintClass="text-emerald-600 dark:text-emerald-400 font-medium"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={Pause}
              label="พักการขาย"
              value={pausedCount}
              hint="ซ่อนชั่วคราว"
              hintClass={pausedCount > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : undefined}
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={Archive}
              label="ในคลังถาวร"
              value={archivedCount}
              hint="สินค้าถูกเก็บเข้าคลัง"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={Package}
              label="สินค้าทั้งหมด"
              value={rows.length}
              hint="ในมุมมองปัจจุบัน"
              loading={isLoading}
            />
          </div>
        );
      }}
    />
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <ProductsScreen />
    </Suspense>
  );
}
