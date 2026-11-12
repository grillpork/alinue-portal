"use client";

import { Suspense, useState, useMemo } from "react";
import {
  BadgePercent,
  Eye,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointerClick,
  Plus,
  RefreshCw,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TableToolbar from "@/components/ui/TableToolbar";
import TablePagination from "@/components/ui/TablePagination";
import PromotionCard from "@/components/promotions/PromotionCard";
import VoucherCard from "@/components/promotions/VoucherCard";
import PromotionFormModal from "@/components/promotions/PromotionFormModal";
import VoucherFormModal from "@/components/promotions/VoucherFormModal";
import { usePromotions, usePromotionMutations } from "@/hooks/useAdminData";
import { toast } from "@/components/ui/Toast";
import { formatBaht, formatCompact, formatNumber } from "@/lib/formatters";
import { cn } from "@/utils/cn";

function PromotionsContent() {
  const [activeTab, setActiveTab] = useState("banners"); // 'banners' | 'vouchers'

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal states
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, refetch } = usePromotions({
    page: 1,
    limit: 100, // Fetch all for local tab segregation
    q: search.trim(),
    status: statusFilter,
    sort: "createdAt:desc",
  });

  const { create, update, remove } = usePromotionMutations();

  const allItems = data?.rows ?? data?.data ?? [];

  // Split into Banners and Vouchers
  const banners = useMemo(() => {
    return allItems.filter((item) => item.image || item.placement || item.impressions !== undefined);
  }, [allItems]);

  const vouchers = useMemo(() => {
    return allItems.filter((item) => !item.image && !item.placement && (item.code || item.discountValue));
  }, [allItems]);

  // Current tab items with filtering
  const currentTabItems = useMemo(() => {
    let list = activeTab === "banners" ? banners : vouchers;

    if (activeTab === "banners" && placementFilter !== "all") {
      list = list.filter((b) => b.placement?.includes(placementFilter));
    }

    if (activeTab === "vouchers" && discountTypeFilter !== "all") {
      list = list.filter((v) => v.discountType === discountTypeFilter);
    }

    return list;
  }, [activeTab, banners, vouchers, placementFilter, discountTypeFilter]);

  // Pagination for current list
  const totalItems = currentTabItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return currentTabItems.slice(start, start + pageSize);
  }, [currentTabItems, page, pageSize]);

  // Banner Stats
  const bannerStats = useMemo(() => {
    const active = banners.filter((b) => b.status === "active").length;
    const views = banners.reduce((sum, b) => sum + (b.impressions || b.requests || 0), 0);
    const clicks = banners.reduce((sum, b) => sum + (b.clicks || b.usageCount || 0), 0);
    return { active, views, clicks };
  }, [banners]);

  // Voucher Stats
  const voucherStats = useMemo(() => {
    const active = vouchers.filter((v) => v.status === "active").length;
    const usage = vouchers.reduce((sum, v) => sum + (v.usageCount || 0), 0);
    const gmv = vouchers.reduce((sum, v) => sum + (v.totalGmv || 0), 0);
    return { active, usage, gmv };
  }, [vouchers]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    if (activeTab === "banners") {
      setBannerModalOpen(true);
    } else {
      setVoucherModalOpen(true);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    if (activeTab === "banners") {
      setBannerModalOpen(true);
    } else {
      setVoucherModalOpen(true);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === "active" ? "paused" : "active";
    try {
      await update.mutateAsync({
        id: item.id,
        payload: { status: nextStatus },
      });
      toast.success(
        nextStatus === "active" ? "เปิดใช้งานแล้ว" : "พักการใช้งานชั่วคราวแล้ว",
        item.title || item.code
      );
    } catch (err) {
      toast.error("ดำเนินการไม่สำเร็จ", err?.message);
    }
  };

  const handleSaveItem = async (payload) => {
    try {
      if (editingItem) {
        await update.mutateAsync({
          id: editingItem.id,
          payload,
        });
        toast.success("บันทึกการแก้ไขแล้ว", payload.title || payload.code);
      } else {
        await create.mutateAsync(payload);
        toast.success("สร้างรายการใหม่สำเร็จ", payload.title || payload.code);
      }
      setBannerModalOpen(false);
      setVoucherModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ", err?.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      toast.success("ลบรายการแล้ว", deleteTarget.title || deleteTarget.code);
      setDeleteTarget(null);
    } catch (err) {
      toast.error("ลบไม่สำเร็จ", err?.message);
    }
  };

  const tabs = [
    {
      id: "banners",
      label: "สไลด์แบนเนอร์",
      labelEn: "Slide Banners",
      icon: LayoutTemplate,
      count: banners.length,
    },
    {
      id: "vouchers",
      label: "โค้ดส่วนลด",
      labelEn: "Voucher Codes",
      icon: BadgePercent,
      count: vouchers.length,
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <PageHeader
        title="โปรโมชั่นและการตลาด"
        description="จัดการแบนเนอร์สไลด์หน้าแรก (Hero Banners) และรหัสคูปองส่วนลดสำหรับคอมมูนิตี้"
        action={
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            icon={Plus}
            size="sm"
          >
            {activeTab === "banners" ? "เพิ่มแบนเนอร์ใหม่" : "สร้างโค้ดส่วนลด"}
          </Button>
        }
      />

      {/* 2. Top Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px",
                isActive
                  ? "border-[#1b64f2] text-[#1b64f2] dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Contextual KPI Summary Header Cards */}
      {activeTab === "banners" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Active Banners */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>แบนเนอร์ที่เปิดแสดงผล</span>
              <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <LayoutTemplate size={14} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {bannerStats.active}
              </span>
              <span className="text-xs text-zinc-400">
                จากทั้งหมด {banners.length} รายการ
              </span>
            </div>
          </div>

          {/* Card 2: Total Views */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>ยอดการมองเห็นรวม (Views)</span>
              <span className="flex size-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Eye size={14} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {formatCompact(bannerStats.views)}
              </span>
              <span className="text-xs text-zinc-400">ครั้ง</span>
            </div>
          </div>

          {/* Card 3: Total Clicks */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>ยอดคลิกทั้งหมด (Clicks)</span>
              <span className="flex size-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <MousePointerClick size={14} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {formatNumber(bannerStats.clicks)}
              </span>
              <span className="text-xs text-zinc-400">ครั้ง</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Active Vouchers */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>โค้ดที่เปิดใช้งาน</span>
              <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <BadgePercent size={14} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {voucherStats.active}
              </span>
              <span className="text-xs text-zinc-400">
                จากทั้งหมด {vouchers.length} โค้ด
              </span>
            </div>
          </div>

          {/* Card 2: Total Redemptions */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>จำนวนครั้งที่ใช้ส่วนลด</span>
              <span className="flex size-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Users size={14} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {formatNumber(voucherStats.usage)}
              </span>
              <span className="text-xs text-zinc-400">ครั้ง</span>
            </div>
          </div>

          {/* Card 3: Total GMV */}
          <div className="rounded-lg border border-zinc-200/90 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>ยอดขายรวมที่เกิดขึ้น (GMV)</span>
              <span className="flex size-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <TrendingUp size={14} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {formatBaht(voucherStats.gmv)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Segmented Filter Toolbar */}
      <TableToolbar
        search={{
          value: search,
          onChange: (val) => {
            setSearch(val);
            setPage(1);
          },
          placeholder:
            activeTab === "banners"
              ? "ค้นหาด้วยชื่อแบนเนอร์ หรือลิงก์..."
              : "ค้นหาด้วยรหัสโค้ด หรือชื่อแคมเปญ...",
        }}
        filters={[
          {
            key: "status",
            label: "สถานะ",
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val);
              setPage(1);
            },
            options: [
              { value: "all", label: "ทุกสถานะ" },
              { value: "active", label: "เปิดใช้งาน (Active)" },
              { value: "scheduled", label: "ตั้งเวลาไว้ (Scheduled)" },
              { value: "paused", label: "พักการใช้งาน (Paused)" },
              { value: "expired", label: "หมดอายุ (Expired)" },
            ],
          },
          ...(activeTab === "banners"
            ? [
                {
                  key: "placement",
                  label: "ตำแหน่ง",
                  value: placementFilter,
                  onChange: (val) => {
                    setPlacementFilter(val);
                    setPage(1);
                  },
                  options: [
                    { value: "all", label: "ทุกตำแหน่ง" },
                    { value: "Hero Banner #1", label: "Hero Banner #1 (ซ้ายใหญ่)" },
                    { value: "Hero Banner #2", label: "Hero Banner #2 (ขวาบน)" },
                    { value: "Category", label: "Category Header" },
                    { value: "Popup", label: "Popup Announcement" },
                  ],
                },
              ]
            : [
                {
                  key: "discountType",
                  label: "ประเภท",
                  value: discountTypeFilter,
                  onChange: (val) => {
                    setDiscountTypeFilter(val);
                    setPage(1);
                  },
                  options: [
                    { value: "all", label: "ทุกประเภท" },
                    { value: "percentage", label: "เปอร์เซ็นต์ (%)" },
                    { value: "fixed", label: "จำนวนเงินคงที่ (฿)" },
                  ],
                },
              ]),
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      {/* 5. Items Cards List / Container Canvas */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 shadow-2xs overflow-hidden dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {activeTab === "banners"
                ? "รายการสไลด์แบนเนอร์"
                : "รายการโค้ดส่วนลด"}
            </h2>
            <span className="rounded-md bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-bold font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {totalItems}
            </span>
          </div>

          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            แสดง {paginatedItems.length} จาก {totalItems} รายการ
          </span>
        </div>

        {/* Layer 2: Inner Canvas with Card Grid */}
        <div className="rounded-t-lg rounded-b-lg border-t border-b border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-lg border border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/40 animate-pulse"
                />
              ))}
            </div>
          ) : paginatedItems.length === 0 ? (
            <EmptyState
              icon={activeTab === "banners" ? LayoutTemplate : Tag}
              title={
                activeTab === "banners"
                  ? "ไม่พบรายการแบนเนอร์"
                  : "ไม่พบรายการโค้ดส่วนลด"
              }
              description={
                search
                  ? "ไม่พบรายการที่ตรงกับคำค้นหา"
                  : activeTab === "banners"
                  ? "ยังไม่มีสไลด์แบนเนอร์ในระบบ คุณสามารถเพิ่มแบนเนอร์ใหม่ได้ทันที"
                  : "ยังไม่มีโค้ดส่วนลดในระบบ คุณสามารถสร้างโค้ดส่วนลดใหม่ได้ทันที"
              }
              action={
                <Button
                  variant="primary"
                  onClick={handleOpenCreate}
                  icon={Plus}
                  size="sm"
                >
                  {activeTab === "banners"
                    ? "เพิ่มแบนเนอร์แรก"
                    : "สร้างโค้ดส่วนลดแรก"}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {paginatedItems.map((item) =>
                activeTab === "banners" ? (
                  <PromotionCard
                    key={item.id}
                    promotion={item}
                    onEdit={handleOpenEdit}
                    onDelete={(target) => setDeleteTarget(target)}
                    onToggleStatus={handleToggleStatus}
                    onViewDetails={(target) => {
                      toast.info(`แบนเนอร์ ${target.title}`, `ลิงก์: ${target.slug || target.targetUrl}`);
                    }}
                  />
                ) : (
                  <VoucherCard
                    key={item.id}
                    voucher={item}
                    onEdit={handleOpenEdit}
                    onDelete={(target) => setDeleteTarget(target)}
                    onToggleStatus={handleToggleStatus}
                    onViewDetails={(target) => {
                      toast.info(`โค้ด ${target.code}`, `เปิดดูคำสั่งซื้อที่ใช้โค้ด ${target.title}`);
                    }}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Layer 3: Footer Pagination */}
        {totalPages > 1 && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* 6. Modals */}
      <PromotionFormModal
        isOpen={bannerModalOpen}
        initialData={editingItem}
        availableVouchers={vouchers}
        onClose={() => {
          setBannerModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
        busy={create.isPending || update.isPending}
      />

      <VoucherFormModal
        isOpen={voucherModalOpen}
        initialData={editingItem}
        onClose={() => {
          setVoucherModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
        busy={create.isPending || update.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`ยืนยันการลบ ${deleteTarget?.title || deleteTarget?.code || ""}`}
        description="คุณต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้"
        confirmLabel="ลบรายการ"
        cancelLabel="ยกเลิก"
        tone="danger"
        busy={remove.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-28 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </div>
      }
    >
      <PromotionsContent />
    </Suspense>
  );
}
