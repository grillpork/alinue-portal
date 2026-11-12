"use client";

import { useToast } from "@/components/ui/Toast";
import { getStatus } from "@/lib/statusRegistry";
import { useRowStatusMutation } from "./useAdminData";

/**
 * useRowStatusActions
 * Wraps the status mutation with the toast + error handling every list screen
 * needs, so pages declare transitions instead of re-implementing the flow.
 */
export function useRowStatusActions(collection) {
  const toast = useToast();
  const mutation = useRowStatusMutation(collection);

  function changeStatus(
    row,
    status,
    { successTitle = "อัปเดตสถานะเรียบร้อย" } = {},
  ) {
    const rowLabel =
      row.name ?? row.title ?? row.orderNumber ?? row.username ?? "รายการนี้";

    mutation.mutate(
      { id: row.id, status },
      {
        onSuccess: () =>
          toast.success(
            successTitle,
            `${rowLabel} → ${getStatus(status).labelTh}`,
          ),
        onError: (error) =>
          toast.error("บันทึกไม่สำเร็จ", error?.message || "กรุณาลองอีกครั้ง"),
      },
    );
  }

  return { changeStatus, isPending: mutation.isPending };
}
