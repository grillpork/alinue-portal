"use client";

import PageHeader from "@/components/ui/PageHeader";
import TableToolbar from "@/components/ui/TableToolbar";
import DataTable from "@/components/ui/DataTable";
import TablePagination from "@/components/ui/TablePagination";

/**
 * AdminTablePage — the shared skeleton for every list screen:
 * header → toolbar (search + filters) → table → pagination.
 * Pages supply only configuration (columns, filters, data), which keeps the four
 * admin lists visually identical by construction rather than by copy-paste.
 */
export default function AdminTablePage({
  title,
  description,
  headerActions,
  search,
  filters,
  columns,
  data,
  loading,
  onPageChange,
  empty,
  minWidth,
  caption,
}) {
  const rows = data?.rows ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} actions={headerActions} />

      {(search || filters?.length > 0) && (
        <section aria-label="ตัวกรองตาราง (Table filters)">
          <TableToolbar search={search} filters={filters} />
        </section>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        empty={empty}
        minWidth={minWidth}
        caption={caption}
        pagination={
          <TablePagination
            page={data?.page ?? 1}
            pageCount={data?.pageCount ?? 1}
            from={data?.from ?? 0}
            to={data?.to ?? 0}
            total={data?.filteredTotal ?? 0}
            onPageChange={onPageChange}
          />
        }
      />
    </div>
  );
}
