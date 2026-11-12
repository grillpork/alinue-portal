"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Admin working preferences. These are not decorative: the dashboard's attention
 * list reads the same keys, so switching one off actually removes a prompt.
 */
export const ADMIN_PREFERENCES = [
  {
    key: "notifyPendingOrders",
    label: "แจ้งเตือนคำสั่งซื้อค้างชำระ",
    description: "แสดงรายการที่รอชำระเงินในแบนเนอร์ของแดชบอร์ด",
  },
  {
    key: "notifyReports",
    label: "แจ้งเตือนรายการถูกรายงาน",
    description: "แสดงโพสต์และสินค้าที่มีผู้ใช้รายงานเข้ามา",
  },
  {
    key: "notifyNewUsers",
    label: "แจ้งเตือนบัญชีใหม่รอตรวจสอบ",
    description: "แสดงจำนวนครีเอเตอร์ที่สมัครภายใน 7 วันล่าสุด",
  },
];

export const useAdminPreferences = create(
  persist(
    (set, get) => ({
      notifyPendingOrders: true,
      notifyReports: true,
      notifyNewUsers: true,
      toggle: (key) => set({ [key]: !get()[key] }),
    }),
    { name: "commi-admin-preferences" },
  ),
);

/** False on the server and first client paint — gate persisted values with it. */
export function usePreferencesHydrated() {
  return useSyncExternalStore(
    () => undefined,
    () => true,
    () => false,
  );
}
