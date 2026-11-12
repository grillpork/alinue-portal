"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAuditLogs,
  createCategory,
  createEmployee,
  createPromotion,
  createSubCategory,
  deleteCategory,
  deleteEmployee,
  deletePromotion,
  deleteSubCategory,
  fetchCategories,
  fetchCreatorApplications,
  fetchDisputes,
  fetchEmployees,
  fetchFinancialLedger,
  fetchFinancialSummary,
  fetchModerationStats,
  fetchModerationAppeals,
  reviewModerationAppeal,
  fetchModerationLogs,
  fetchOrders,
  fetchOverview,
  fetchPosts,
  fetchProducts,
  fetchPromotions,
  fetchReports,
  fetchSupportMetrics,
  fetchUsers,
  fetchWithdrawals,
  resolveDispute,
  resolveReport,
  reviewCreatorApplication,
  reviewWithdrawal,
  updateCategory,
  updateEmployee,
  updatePromotion,
  updateRowStatus,
  updateSubCategory,
} from "@/services/admin";

/** Centralised query keys — mutations invalidate without guessing string shapes. */
export const adminKeys = {
  overview: ["overview"],
  products: (params) => ["products", params],
  orders: (params) => ["orders", params],
  users: (params) => ["users", params],
  posts: (params) => ["posts", params],
  creatorApplications: (params) => ["creator-applications", params],
  supportMetrics: (days) => ["support-metrics", days],
  withdrawals: (params) => ["withdrawals", params],
  disputes: (params) => ["disputes", params],
  reports: (params) => ["reports", params],
  categories: ["categories"],
  promotions: (params) => ["promotions", params],
  employees: (params) => ["employees", params],
  financial: (params) => ["financial", params],
  financialSummary: ["financial-summary"],
  moderationStats: ["moderation-stats"],
  moderationAppeals: (params) => ["moderation-appeals", params],
  moderationLogs: (params) => ["moderation-logs", params],
};

export function useOverview() {
  return useQuery({ queryKey: adminKeys.overview, queryFn: fetchOverview });
}

/** Support (pwyw) metrics — หน้า dashboard read-only, refetch ทุก 2 นาที */
export function useSupportMetrics(days = 30) {
  return useQuery({
    queryKey: adminKeys.supportMetrics(days),
    queryFn: () => fetchSupportMetrics(days),
    refetchInterval: 1000 * 60 * 2,
  });
}

/** Audit trail — read-only, filter ด้วย action */
export function useAuditLogs(action = "all") {
  return useQuery({
    queryKey: ["audit-logs", action],
    queryFn: () => fetchAuditLogs({ action, limit: 100 }),
    placeholderData: (previous) => previous,
  });
}

/** หมวดหมู่ + หมวดหมู่ย่อย (master-detail) — refetch ทั้งก้อนหลังทุก mutation */
export function useCategories() {
  return useQuery({
    queryKey: adminKeys.categories,
    queryFn: fetchCategories,
  });
}

/**
 * รวมทุก action ของหมวดไว้ใน hook เดียว — invalidation ตรงกันทั้ง 6 อย่าง
 * คืน mutation objects: createCategory / updateCategory / deleteCategory /
 * createSubCategory / updateSubCategory / deleteSubCategory
 */
export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.categories });

  return {
    createCategory: useMutation({
      mutationFn: createCategory,
      onSuccess,
    }),
    updateCategory: useMutation({
      mutationFn: ({ id, ...payload }) => updateCategory(id, payload),
      onSuccess,
    }),
    deleteCategory: useMutation({
      mutationFn: (id) => deleteCategory(id),
      onSuccess,
    }),
    createSubCategory: useMutation({
      mutationFn: ({ categoryId, ...payload }) =>
        createSubCategory(categoryId, payload),
      onSuccess,
    }),
    updateSubCategory: useMutation({
      mutationFn: ({ categoryId, subId, ...payload }) =>
        updateSubCategory(categoryId, subId, payload),
      onSuccess,
    }),
    deleteSubCategory: useMutation({
      mutationFn: ({ categoryId, subId }) =>
        deleteSubCategory(categoryId, subId),
      onSuccess,
    }),
  };
}

/**
 * One factory keeps the four table resources identical in shape:
 * same key convention, same cache window, same invalidation.
 */
function makeTableQuery(name, fetcher) {
  return function useTableRows(params) {
    return useQuery({
      queryKey: adminKeys[name](params),
      queryFn: () => fetcher(params),
      placeholderData: (previous) => previous, // keep rows while refetching filters
    });
  };
}

export const useProducts = makeTableQuery("products", fetchProducts);
export const useOrders = makeTableQuery("orders", fetchOrders);
export const useUsers = makeTableQuery("users", fetchUsers);
export const usePosts = makeTableQuery("posts", fetchPosts);
export const useCreatorApplications = makeTableQuery(
  "creatorApplications",
  fetchCreatorApplications,
);
export const useWithdrawals = makeTableQuery("withdrawals", fetchWithdrawals);
export const useDisputes = makeTableQuery("disputes", fetchDisputes);
export const useReports = makeTableQuery("reports", fetchReports);
export const useFinancialLedger = makeTableQuery("financial", fetchFinancialLedger);

export function useFinancialSummary() {
  return useQuery({
    queryKey: adminKeys.financialSummary,
    queryFn: fetchFinancialSummary,
  });
}

/** ชี้ขาดรายงาน — refresh คิว */
export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, decision, adminNote, unpublishProduct }) =>
      resolveReport(id, decision, adminNote, unpublishProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

/** ชี้ขาดข้อพิพาท — refresh คิว */
export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, decision, adminNote }) =>
      resolveDispute(id, decision, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/** อนุมัติ/ปฏิเสธคำขอถอน — refresh คิว + ตัวเลขเจ้าหนี้รวม */
export function useReviewWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, decision, reference, note }) =>
      reviewWithdrawal(id, decision, { reference, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

/** Approve/reject an application — refreshing the queue and the sidebar badge. */
export function useReviewCreatorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, decision, reviewNote }) =>
      reviewCreatorApplication(id, decision, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-applications"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

/** Status transition + cache refresh for every collection's row actions. */
export function useRowStatusMutation(collection) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateRowStatus(collection, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collection] });
      queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });
}

/** Promotions collection hook */
export function usePromotions(params) {
  return useQuery({
    queryKey: adminKeys.promotions(params),
    queryFn: () => fetchPromotions(params),
  });
}

/** Promotions mutation hooks */
export function usePromotionMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updatePromotion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  const remove = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  return { create, update, remove };
}

/** Employees collection hook */
export function useEmployees(params) {
  return useQuery({
    queryKey: adminKeys.employees(params),
    queryFn: () => fetchEmployees(params),
  });
}

/** Employees mutation hooks */
export function useEmployeeMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return { create, update, remove };
}

/* ───────────────────────── Moderation & Appeals Hooks ───────────────────────── */

export function useModerationStats() {
  return useQuery({
    queryKey: adminKeys.moderationStats,
    queryFn: fetchModerationStats,
  });
}

export function useModerationAppeals(params = {}) {
  return useQuery({
    queryKey: adminKeys.moderationAppeals(params),
    queryFn: () => fetchModerationAppeals(params),
  });
}

export function useReviewModerationAppeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reviewerNote }) =>
      reviewModerationAppeal(id, action, reviewerNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-appeals"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-logs"] });
    },
  });
}

export function useModerationLogs(params = {}) {
  return useQuery({
    queryKey: adminKeys.moderationLogs(params),
    queryFn: () => fetchModerationLogs(params),
  });
}


