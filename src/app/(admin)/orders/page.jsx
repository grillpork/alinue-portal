"use client";

import { Suspense } from "react";
import { Check, CheckCircle2, Clock, RotateCcw, ShoppingBag, X } from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import {
  MoneyCell,
  NameCell,
  PaymentChannelCell,
  PersonCell,
  StatusCell,
  TimeCell,
} from "@/components/shared/cells";
import { useOrders } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";

const ORDER_STATUSES = ["pending", "succeeded", "canceled", "refunded"];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "ล่าสุดก่อน" },
  { value: "createdAt:asc", label: "เก่าสุดก่อน" },
  { value: "amount:desc", label: "มูลค่าสูงก่อน" },
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
      key: "product",
      header: "สินค้า",
      cell: (order) => (
        <NameCell label={order.product.name} meta={order.product.category} />
      ),
      exportValue: (order) => order.product.name,
    },
    {
      key: "buyer",
      header: "ผู้ซื้อ",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (order) => (
        <PersonCell name={order.buyer.name} username={order.buyer.username} />
      ),
      exportValue: (order) => order.buyer.username,
    },
    {
      key: "channel",
      header: "ช่องทางชำระเงิน",
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (order) => <PaymentChannelCell channel={order.channel} />,
      exportValue: (order) => order.channel,
    },
    {
      key: "amount",
      header: "มูลค่า",
      align: "end",
      cell: (order) => <MoneyCell amount={order.amount} />,
      exportValue: (order) => order.amount,
    },
    {
      key: "createdAt",
      header: "สร้างเมื่อ",
      align: "end",
      className: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (order) => <TimeCell value={order.createdAt} />,
      exportValue: (order) => order.createdAt,
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (order) => <StatusCell status={order.status} />,
      exportValue: (order) => order.status,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (order) => (
        <RowActionsMenu
          busy={isPending}
          label={`ตัวเลือกของคำสั่งซื้อ ${order.orderNumber}`}
          actions={[
            {
              key: "mark-paid",
              label: "ยืนยันว่าชำระแล้ว",
              icon: Check,
              disabled: order.status === "succeeded",
              onSelect: () =>
                changeStatus(order, "succeeded", {
                  successTitle: "ยืนยันคำสั่งซื้อแล้ว",
                }),
            },
            {
              key: "cancel",
              label: "ยกเลิกคำสั่งซื้อ",
              icon: X,
              tone: "danger",
              disabled: order.status === "canceled",
              confirm: {
                title: "ยกเลิกคำสั่งซื้อนี้?",
                description: `${order.orderNumber} · ${order.product.name} — ผู้ซื้อจะได้รับแจ้งทางอีเมลทันที`,
                confirmLabel: "ยกเลิกคำสั่งซื้อ",
              },
              onSelect: () =>
                changeStatus(order, "canceled", {
                  successTitle: "ยกเลิกคำสั่งซื้อแล้ว",
                }),
            },
            {
              key: "refund",
              label: "คืนเงินเต็มจำนวน",
              icon: RotateCcw,
              tone: "danger",
              disabled: order.status !== "succeeded",
              confirm: {
                title: "คืนเงินคำสั่งซื้อนี้?",
                description:
                  "เงินจะถูกคืนผ่านช่องทางเดิมภายใน 7 วันทำการ การทำรายการนี้ย้อนกลับไม่ได้",
                confirmLabel: "ยืนยันคืนเงิน",
              },
              onSelect: () =>
                changeStatus(order, "refunded", {
                  successTitle: "ส่งคำขอคืนเงินแล้ว",
                }),
            },
          ]}
        />
      ),
    },
  ];
}

function OrdersScreen() {
  return (
    <AdminListScreen
      title="คำสั่งซื้อทั้งหมด"
      description="ติดตามการชำระเงินที่ยังค้าง อนุมัติรายการ และจัดการเงินคืน"
      collection="orders"
      useCollectionQuery={useOrders}
      searchPlaceholder="ค้นหาเลขที่คำสั่งซื้อหรือสินค้า..."
      statusOptions={statusOptions(ORDER_STATUSES, { allLabel: "ทุกสถานะ" })}
      sortOptions={SORT_OPTIONS}
      defaultSort="createdAt:desc"
      columns={buildColumns}
      exportFilename="commi-orders"
      emptyTitle="ไม่พบคำสั่งซื้อที่ตรงเงื่อนไข"
      emptyDescription="ลองเลือกสถานะเป็น “ทุกสถานะ” หรือล้างคำค้นหา"
      minWidth="60rem"
      topContent={({ rows, isLoading }) => {
        const pendingCount = rows.filter((r) => r.status === "pending").length;
        const succeededCount = rows.filter((r) => r.status === "succeeded").length;
        const refundedCount = rows.filter((r) => ["canceled", "refunded"].includes(r.status)).length;
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TwoToneStatCard
              icon={Clock}
              label="รอดำเนินการ"
              value={pendingCount}
              hint="ต้องติดตามชำระ"
              hintClass={pendingCount > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : undefined}
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={CheckCircle2}
              label="ชำระสำเร็จ"
              value={succeededCount}
              hint="ออเดอร์สมบูรณ์"
              hintClass="text-emerald-600 dark:text-emerald-400 font-medium"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={RotateCcw}
              label="ยกเลิก / คืนเงิน"
              value={refundedCount}
              hint="ยกเลิกหรือขอคืน"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={ShoppingBag}
              label="ออเดอร์ทั้งหมด"
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <OrdersScreen />
    </Suspense>
  );
}
