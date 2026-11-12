"use client";

import { Download, RotateCcw, SearchCode } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import TableToolbar from "@/components/ui/TableToolbar";
import DataTable from "@/components/ui/DataTable";
import TablePagination from "@/components/ui/TablePagination";
import EmptyState from "@/components/ui/EmptyState";
import { useAdminTableState } from "@/hooks/useAdminTableState";
import { useRowStatusActions } from "@/hooks/useRowStatusActions";
import { exportRowsToCsv } from "@/lib/exportCsv";
import { toast } from "@/components/ui/Toast";

/**
 * AdminListScreen — one screen, four entities.
 * Owns the URL-synced table state, the status mutation helpers, CSV export and the
 * loading/empty states; pages only pass configuration (columns + filter options).
 */
export default function AdminListScreen({
  title,
  description,
  collection,
  useCollectionQuery,
  searchPlaceholder = "ค้นหา...",
  statusOptions,
  sortOptions,
  defaultSort = "updatedAt:desc",
  columns,
  exportFilename,
  emptyTitle = "ไม่พบรายการที่ตรงเงื่อนไข",
  emptyDescription = "ลองปรับตัวกรอง ล้างคำค้นหา หรือรีเฟรชข้อมูลอีกครั้ง",
  minWidth = "56rem",
  topContent,
  sidebarContent,
  extraActions,
}) {
  const {
    params,
    onQueryChange,
    onStatusChange,
    onSortChange,
    onPageChange,
    onReset,
  } = useAdminTableState({ defaultSort });
  const { data, isLoading, refetch } = useCollectionQuery(params);
  const { changeStatus, isPending } = useRowStatusActions(collection);

  const resolvedColumns = columns({ changeStatus, isPending });
  const rows = data?.rows ?? [];

  const handleExport = () => {
    if (rows.length === 0) {
      toast.warning("ยังไม่มีข้อมูลให้ส่งออก", "ปรับตัวกรองให้มีรายการก่อน");
      return;
    }
    exportRowsToCsv({
      filename: exportFilename,
      rows,
      columns: resolvedColumns,
    });
    toast.success(
      "สร้างไฟล์ CSV เรียบร้อย",
      `${rows.length} รายการถูกดาวน์โหลดแล้ว`,
    );
  };

  const renderToolbar = () => (
    <TableToolbar
      search={{
        value: params.q,
        onChange: onQueryChange,
        placeholder: searchPlaceholder,
      }}
      onRefresh={() => refetch()}
      isRefreshing={isLoading}
      filters={[
        ...(statusOptions
          ? [
              {
                label: "สถานะ",
                value: params.status,
                onChange: onStatusChange,
                options: statusOptions,
              },
            ]
          : []),
        ...(sortOptions
          ? [
              {
                label: "เรียงตาม",
                value: params.sort,
                onChange: onSortChange,
                options: sortOptions,
              },
            ]
          : []),
      ]}
    />
  );

  const renderDataTable = () => (
    <DataTable
      columns={resolvedColumns}
      rows={rows}
      loading={isLoading}
      minWidth={minWidth}
      caption={title}
      empty={
        params.q || params.status !== "all" ? (
          <EmptyState
            icon={SearchCode}
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Button variant="secondary" size="sm" onClick={onReset}>
                ล้างตัวกรองทั้งหมด
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={SearchCode}
            title={emptyTitle}
            description={emptyDescription}
          />
        )
      }
      pagination={
        <TablePagination
          page={data?.page ?? params.page}
          pageCount={data?.pageCount ?? 1}
          from={data?.from ?? 0}
          to={data?.to ?? 0}
          total={data?.filteredTotal ?? 0}
          onPageChange={onPageChange}
        />
      }
    />
  );

  return (
    <div className="space-y-4 select-none">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="secondary" onClick={handleExport}>
              <Download size={14} />
              ส่งออก CSV
            </Button>
            <Button variant="secondary" onClick={() => refetch()}>
              <RotateCcw size={14} />
              รีเฟรช
            </Button>
            {extraActions}
          </>
        }
      />

      {topContent && (
        typeof topContent === "function" ? topContent({ data, isLoading, rows }) : topContent
      )}

      {sidebarContent ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 items-start">
          <div className="xl:col-span-8 space-y-4">
            {renderToolbar()}
            {renderDataTable()}
          </div>
          <aside className="xl:col-span-4 space-y-4">
            {typeof sidebarContent === "function"
              ? sidebarContent({ data, isLoading, rows })
              : sidebarContent}
          </aside>
        </div>
      ) : (
        <>
          {renderToolbar()}
          {renderDataTable()}
        </>
      )}
    </div>
  );
}
