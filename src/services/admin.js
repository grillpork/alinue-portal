import api from "@/lib/api";
import { queryCollection } from "./queryCollection";
import {
  mockAuditLogs,
  mockCategories,
  mockCreatorApplications,
  mockDisputes,
  mockEmployees,
  mockFinancialSummary,
  mockFinancialTransactions,
  mockOrders,
  mockOverview,
  mockPosts,
  mockProducts,
  mockPromotions,
  mockReports,
  mockSupportMetrics,
  mockUsers,
  mockWithdrawals,
  mockModerationAppeals,
  mockModerationLogs,
  mockModerationStats,
} from "@/data/mockAdmin";

/**
 * Admin data access layer — the ONLY place that knows whether data comes from
 * the mock dataset or the real alinue-backend admin API.
 * Flip NEXT_PUBLIC_ADMIN_USE_MOCK=false (after /admin/* endpoints exist) to go live.
 */
const USE_MOCK = process.env.NEXT_PUBLIC_ADMIN_USE_MOCK !== "false";

/** Small artificial latency so skeleton states are exercised in development. */
const MOCK_LATENCY = 260;

function mockResolve(payload) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(payload), MOCK_LATENCY),
  );
}

// Mutable copies let mock mutations behave like a real write (survive refetch).
const store = {
  products: [...mockProducts],
  orders: [...mockOrders],
  users: [...mockUsers],
  posts: [...mockPosts],
  "creator-applications": [...mockCreatorApplications],
  withdrawals: [...mockWithdrawals],
  disputes: [...mockDisputes],
  "audit-logs": [...mockAuditLogs],
  reports: [...mockReports],
  promotions: [...mockPromotions],
  employees: [...mockEmployees],
  financial: [...mockFinancialTransactions],
  "moderation-appeals": [...mockModerationAppeals],
  "moderation-logs": [...mockModerationLogs],
  // nested subCategories → deep clone เพื่อให้ mock CRUD ไม่แก้ต้นฉบับ
  categories: JSON.parse(JSON.stringify(mockCategories)),
};

const SEARCH = {
  products: ["name", "creator.name", "creator.username", "category"],
  orders: ["orderNumber", "product.name", "buyer.name", "channel"],
  users: ["name", "username", "email", "role"],
  posts: ["title", "author.name", "author.username"],
  "creator-applications": [
    "displayName",
    "applicantName",
    "applicantUsername",
    "applicantEmail",
  ],
  withdrawals: ["artistName", "artistUsername"],
  disputes: ["orderNumber", "productName", "buyerEmail"],
  reports: ["productName", "reporterName", "reporterUsername", "reason"],
  promotions: ["code", "title", "slug"],
  employees: ["name", "username", "email", "nickname", "phone", "roleLabel", "departmentLabel", "position", "employeeCode"],
  financial: ["ref", "orderNumber", "description", "partyName", "channel", "typeLabel", "vatInvoiceNumber"],
  "moderation-appeals": ["user.name", "user.username", "appealReason", "reasons"],
  "moderation-logs": ["user.name", "user.username", "ipAddress", "reasons", "actionTaken"],
};

export async function fetchOverview() {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/overview");
    return data?.data ?? data;
  }
  return mockResolve({
    ...mockOverview,
    pendingOrders: store.orders.filter((o) => o.status === "pending").length,
    pendingApplications: store["creator-applications"].filter(
      (a) => a.status === "pending",
    ).length,
    reportedItems:
      store.products.filter((p) => p.status === "reported").length +
      store.posts.filter((p) => p.status === "reported").length,
    recentOrders: [...store.orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    topProducts: [...store.products]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
  });
}

function fetchCollection(key, searchFields, params) {
  if (!USE_MOCK) {
    return api
      .get(`/admin/${key}`, { params })
      .then(({ data }) => data?.data ?? data);
  }
  return mockResolve(queryCollection(store[key], { ...params, searchFields }));
}

export const fetchProducts = (params) =>
  fetchCollection("products", SEARCH.products, params);
export const fetchOrders = (params) =>
  fetchCollection("orders", SEARCH.orders, {
    statusField: "status",
    ...params,
  });
export const fetchUsers = (params) =>
  fetchCollection("users", SEARCH.users, params);
export const fetchPosts = (params) =>
  fetchCollection("posts", SEARCH.posts, params);

/**
 * Status transition used by row actions across products / orders / users / posts.
 * @param {'products'|'orders'|'users'|'posts'} collection
 */
export async function updateRowStatus(collection, id, status) {
  if (!USE_MOCK) {
    const { data } = await api.patch(`/admin/${collection}/${id}/status`, {
      status,
    });
    return data?.data ?? data;
  }

  const row = store[collection].find((item) => item.id === id);
  if (!row) {
    throw { message: "ไม่พบรายการนี้ในระบบ (404)" };
  }
  row.status = status;
  row.updatedAt = new Date().toISOString();
  return mockResolve({ ...row });
}

/**
 * Creator applications — flat row shape shared by mock and real API responses.
 */
function toApplicationRow(r) {
  return {
    id: r.id,
    userId: r.userId ?? r.applicant?.id,
    displayName: r.displayName,
    applicantName: r.applicant?.name ?? r.applicantName,
    applicantUsername: r.applicant?.username ?? r.applicantUsername,
    applicantEmail: r.applicant?.email ?? r.applicantEmail,
    categories: r.categories ?? [],
    portfolioUrls: r.portfolioUrls ?? [],
    sampleUrls: r.sampleUrls ?? [],
    bio: r.bio ?? null,
    willSellNsfw: Boolean(r.willSellNsfw),
    status: r.status,
    reviewNote: r.reviewNote ?? null,
    createdAt: r.createdAt,
    reviewedAt: r.reviewedAt ?? null,
  };
}

/**
 * NOTE: real backend supports only status/page filters here (no q/sort) —
 * search and sorting are mock-only until /admin/creator-applications gains params.
 */
export async function fetchCreatorApplications(params = {}) {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/creator-applications", {
      params: { status: params.status, page: params.page, limit: params.limit },
    });
    const rows = (data?.data ?? []).map(toApplicationRow);
    const limit = data?.limit ?? rows.length ?? 0;
    return {
      rows,
      page: data?.page ?? 1,
      limit,
      pageCount: 1, // backend ไม่คืน total — pagination ของตารางจะโชว์แค่หน้าปัจจุบัน
      from: rows.length ? (data?.page ?? 1) * limit - limit + 1 : 0,
      to: rows.length,
      filteredTotal: rows.length,
    };
  }
  return mockResolve(
    queryCollection(store["creator-applications"], {
      ...params,
      searchFields: SEARCH["creator-applications"],
      sort: params.sort || "createdAt:desc",
    }),
  );
}

export async function reviewCreatorApplication(id, decision, reviewNote) {
  if (!USE_MOCK) {
    const { data } = await api.post(
      `/admin/creator-applications/${id}/review`,
      { decision, reviewNote: reviewNote || undefined },
    );
    return data?.application ?? data;
  }

  const row = store["creator-applications"].find((a) => a.id === Number(id));
  if (!row) {
    throw { message: "ไม่พบใบสมัครนี้ (404)" };
  }
  if (row.status !== "pending") {
    throw { message: "ใบสมัครนี้ถูกตรวจไปแล้ว (409)" };
  }
  row.status = decision;
  row.reviewNote = reviewNote || null;
  row.reviewedAt = new Date().toISOString();
  return mockResolve({ ...row });
}

/** สถิติ Support (pwyw) สำหรับหน้า dashboard — read-only */
export async function fetchSupportMetrics(days = 30) {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/support-metrics", {
      params: { days },
    });
    return data;
  }
  return mockResolve({ ...mockSupportMetrics, windowDays: days });
}

/** คิวถอนเงินของศิลปิน — row shape เดียวกันทั้ง mock/real */
function toWithdrawalRow(r) {
  return {
    id: r.id,
    userId: r.userId,
    artistName: r.artist?.name ?? r.artistName,
    artistUsername: r.artist?.username ?? r.artistUsername,
    amount: r.amount,
    status: r.status,
    reference: r.reference ?? null,
    adminNote: r.adminNote ?? null,
    eligibleAt: r.eligibleAt ?? null,
    holdReason: r.holdReason ?? null,
    payoutSnapshot: r.payoutSnapshot ?? {},
    createdAt: r.createdAt,
    processedAt: r.processedAt ?? null,
  };
}

export async function fetchWithdrawals(params = {}) {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/wallets/withdrawals", {
      params: { status: params.status, page: params.page, limit: params.limit },
    });
    const rows = (data?.data ?? []).map(toWithdrawalRow);
    const limit = data?.limit ?? rows.length ?? 0;
    return {
      rows,
      page: data?.page ?? 1,
      limit,
      pageCount: 1,
      from: rows.length ? (data?.page ?? 1) * limit - limit + 1 : 0,
      to: rows.length,
      filteredTotal: rows.length,
    };
  }
  return mockResolve(
    queryCollection(store.withdrawals, {
      ...params,
      searchFields: SEARCH.withdrawals,
      sort: params.sort || "createdAt:desc",
    }),
  );
}

/** อนุมัติ (จ่ายจริง+reference) / ปฏิเสธ — server ตรวจ pending ให้อีกชั้น */
export async function reviewWithdrawal(id, decision, { reference, note } = {}) {
  if (!USE_MOCK) {
    const { data } = await api.post(`/admin/wallets/withdrawals/${id}/review`, {
      decision,
      reference: reference || undefined,
      note: note || undefined,
    });
    return data?.withdrawal ?? data;
  }

  const row = store.withdrawals.find((w) => w.id === Number(id));
  if (!row) throw { message: "ไม่พบคำขอถอนนี้ (404)" };
  if (row.status !== "pending") throw { message: "คำขอนี้ถูกตรวจไปแล้ว (409)" };
  row.status = decision;
  row.reference = reference || null;
  row.adminNote = note || null;
  row.processedAt = new Date().toISOString();
  return mockResolve({ ...row });
}

/** คิวข้อพิพาท/คืนเงิน — API รับ open|resolved|all ส่วน mock ใช้ raw status */
export async function fetchDisputes(params = {}) {
  if (!USE_MOCK) {
    const mapped =
      params.status === "refunded"
        ? "resolved"
        : params.status === "all"
          ? "all"
          : "open";
    const { data } = await api.get("/admin/disputes", {
      params: { status: mapped, limit: params.limit },
    });
    return {
      rows: data?.data ?? [],
      page: 1,
      limit: (data?.data ?? []).length,
      pageCount: 1,
      from: (data?.data ?? []).length ? 1 : 0,
      to: (data?.data ?? []).length,
      filteredTotal: (data?.data ?? []).length,
    };
  }
  return mockResolve(
    queryCollection(store.disputes, {
      ...params,
      searchFields: SEARCH.disputes,
      sort: params.sort || "refundRequestedAt:desc",
    }),
  );
}

/** ชี้ขาด dispute: refund (คืนเงินจริงที่ Stripe) | deny (กลับ paid พร้อมเหตุผล) */
export async function resolveDispute(id, decision, adminNote) {
  if (!USE_MOCK) {
    const { data } = await api.post(`/admin/disputes/${id}/resolve`, {
      decision,
      adminNote: adminNote || undefined,
    });
    return data?.order ?? data;
  }
  const row = store.disputes.find((d) => d.id === Number(id));
  if (!row) throw { message: "ไม่พบเรื่องนี้ (404)" };
  if (row.status !== "refund_requested")
    throw { message: "เรื่องถูกตรวจไปแล้ว (409)" };
  if (decision === "refund") {
    row.status = "refunded";
    row.refundedAt = new Date().toISOString();
    row.stripeRefundId = `re_mock_${row.id}`;
  } else {
    if (!adminNote?.trim()) throw { message: "ปฏิเสธต้องมีเหตุผล (400)" };
    row.status = "paid_denied"; // หลุดจากคิว disputes (เหมือนระบบจริงที่กลับ paid)
  }
  row.adminNote = adminNote || null;
  return mockResolve({ ...row });
}

/** Audit trail — read-only ทั้ง mock/real */
export async function fetchAuditLogs(params = {}) {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/audit-logs", {
      params: { action: params.action, limit: params.limit },
    });
    return data; // { data, actionCounts }
  }
  let rows = store["audit-logs"];
  if (params.action && params.action !== "all") {
    rows = rows.filter((r) => r.action === params.action);
  }
  return mockResolve({
    data: rows,
    actionCounts: Object.entries(
      rows.reduce((acc, r) => {
        acc[r.action] = (acc[r.action] || 0) + 1;
        return acc;
      }, {}),
    ).map(([action, count]) => ({ action, count })),
  });
}

/** คิวรายงานสินค้า — API รับ pending | resolved | all */
export async function fetchReports(params = {}) {
  if (!USE_MOCK) {
    const mapped =
      params.status === "action_taken" || params.status === "dismissed"
        ? "resolved"
        : params.status === "all"
          ? "all"
          : "pending";
    const { data } = await api.get("/admin/reports", {
      params: { status: mapped, limit: params.limit },
    });
    const rows = data?.data ?? [];
    return {
      rows,
      page: 1,
      limit: rows.length,
      pageCount: 1,
      from: rows.length ? 1 : 0,
      to: rows.length,
      filteredTotal: rows.length,
    };
  }
  return mockResolve(
    queryCollection(store.reports, {
      ...params,
      searchFields: SEARCH.reports,
      sort: params.sort || "createdAt:desc",
    }),
  );
}

/** ชี้ขาดรายงาน: action_taken (ริบสินค้าได้) | dismissed (ต้องมีเหตุผล) */
export async function resolveReport(id, decision, adminNote, unpublishProduct) {
  if (!USE_MOCK) {
    const { data } = await api.post(`/admin/reports/${id}/resolve`, {
      decision,
      adminNote: adminNote || undefined,
      ...(decision === "action_taken" && unpublishProduct
        ? { unpublishProduct: true }
        : {}),
    });
    return data?.report ?? data;
  }
  const row = store.reports.find((r) => r.id === Number(id));
  if (!row) throw { message: "ไม่พบรายงานนี้ (404)" };
  if (row.status !== "pending")
    throw { message: "เรื่องนี้ถูกตรวจไปแล้ว (409)" };
  if (decision === "dismissed" && !adminNote?.trim())
    throw { message: "ตีกลับต้องมีเหตุผล (400)" };
  row.status = decision;
  row.adminNote = adminNote || null;
  row.reviewedAt = new Date().toISOString();
  return mockResolve({ ...row });
}

/* ───────────────────────── Categories & Sub categories ───────────────────────── */

// slug สำหรับ mock เท่านั้น (ของจริง server สร้างจาก name) — Thai → slug อ่านไม่ออก ใช้ fallback
const mockSlug = (name, prefix) => {
  const ascii = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || `${prefix}-${Date.now().toString(36)}`;
};
const nextId = (rows) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
const nextSubId = () =>
  nextId(store.categories.flatMap((c) => c.subCategories)) + 1;
const findCategory = (id) => store.categories.find((c) => c.id === Number(id));

/** หมวดหมู่ + sub + productCount — shape ตรงกับ GET /categories/admin */
export async function fetchCategories() {
  if (!USE_MOCK) {
    const { data } = await api.get("/categories/admin");
    return data?.data ?? [];
  }
  return mockResolve(structuredClone(store.categories));
}

export async function createCategory({ name, description, imageUrl, image }) {
  const img = imageUrl || image || null;
  if (!USE_MOCK) {
    const { data } = await api.post("/categories", {
      name,
      description,
      imageUrl: img,
      image: img,
    });
    return data?.category ?? data;
  }
  if (store.categories.some((c) => c.name === name))
    throw { message: "มีหมวดหมู่ชื่อนี้อยู่แล้ว (409)" };
  const cat = {
    id: nextId(store.categories),
    name,
    slug: mockSlug(name, "cat"),
    description: description || null,
    imageUrl: img,
    image: img,
    productCount: 0,
    subCategories: [],
  };
  store.categories.push(cat);
  return mockResolve(structuredClone(cat));
}

export async function updateCategory(id, payload) {
  if (!USE_MOCK) {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data?.category ?? data;
  }
  const cat = findCategory(id);
  if (!cat) throw { message: "ไม่พบหมวดหมู่ (404)" };
  Object.assign(cat, {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
    ...(payload.imageUrl !== undefined
      ? { imageUrl: payload.imageUrl, image: payload.imageUrl }
      : {}),
    ...(payload.image !== undefined
      ? { image: payload.image, imageUrl: payload.image }
      : {}),
  });
  return mockResolve(structuredClone(cat));
}

export async function deleteCategory(id) {
  if (!USE_MOCK) {
    await api.delete(`/categories/${id}`);
    return { success: true };
  }
  const cat = findCategory(id);
  if (!cat) throw { message: "ไม่พบหมวดหมู่ (404)" };
  if (cat.productCount > 0)
    throw {
      message: `ลบไม่ได้ — มีสินค้าอยู่ในหมวดนี้ ${cat.productCount} ชิ้น`,
    };
  store.categories = store.categories.filter((c) => c.id !== cat.id);
  return mockResolve({ success: true });
}

export async function createSubCategory(categoryId, { name, description }) {
  if (!USE_MOCK) {
    const { data } = await api.post(
      `/categories/${categoryId}/sub-categories`,
      { name, description },
    );
    return data?.subCategory ?? data;
  }
  const cat = findCategory(categoryId);
  if (!cat) throw { message: "ไม่พบหมวดหมู่หลัก (404)" };
  if (cat.subCategories.some((s) => s.name === name))
    throw { message: "มีหมวดหมู่ย่อยชื่อนี้อยู่แล้ว (409)" };
  const sub = {
    id: nextSubId(),
    name,
    slug: mockSlug(name, "sub"),
    description: description || null,
    productCount: 0,
  };
  cat.subCategories.push(sub);
  return mockResolve(structuredClone(sub));
}

export async function updateSubCategory(categoryId, subId, payload) {
  if (!USE_MOCK) {
    const { data } = await api.put(
      `/categories/${categoryId}/sub-categories/${subId}`,
      payload,
    );
    return data?.subCategory ?? data;
  }
  const cat = findCategory(categoryId);
  const sub = cat?.subCategories.find((s) => s.id === Number(subId));
  if (!sub) throw { message: "ไม่พบหมวดหมู่ย่อย (404)" };
  Object.assign(sub, {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
    ...(payload.description !== undefined
      ? { description: payload.description }
      : {}),
  });
  return mockResolve(structuredClone(sub));
}

export async function deleteSubCategory(categoryId, subId) {
  if (!USE_MOCK) {
    await api.delete(`/categories/${categoryId}/sub-categories/${subId}`);
    return { success: true };
  }
  const cat = findCategory(categoryId);
  if (!cat) throw { message: "ไม่พบหมวดหมู่หลัก (404)" };
  const sub = cat.subCategories.find((s) => s.id === Number(subId));
  if (!sub) throw { message: "ไม่พบหมวดหมู่ย่อย (404)" };
  if (sub.productCount > 0)
    throw {
      message: `ลบไม่ได้ — มีสินค้าอยู่ในหมวดนี้ ${sub.productCount} ชิ้น`,
    };
  cat.subCategories = cat.subCategories.filter((s) => s.id !== sub.id);
  return mockResolve({ success: true });
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export const fetchPromotions = (params) =>
  fetchCollection("promotions", SEARCH.promotions, params);

export async function createPromotion(payload) {
  if (!USE_MOCK) {
    const { data } = await api.post("/admin/promotions", payload);
    return data?.data ?? data;
  }
  const id = `promo-${Date.now()}`;
  const code = (payload.code || "").toUpperCase().trim();
  if (store.promotions.some((p) => p.code === code)) {
    throw { message: `โค้ดโปรโมชั่น ${code} มีอยู่ในระบบแล้ว` };
  }
  const newPromo = {
    id,
    code,
    title: payload.title || "โปรโมชั่นใหม่",
    slug: payload.slug || `commi.co/p/${code.toLowerCase()}`,
    discountType: payload.discountType || "percentage",
    discountValue: Number(payload.discountValue) || 10,
    minSpend: Number(payload.minSpend) || 0,
    maxDiscount: payload.maxDiscount ? Number(payload.maxDiscount) : null,
    status: payload.status || "active",
    createdAt: new Date().toISOString(),
    expiresAt: payload.expiresAt || new Date(Date.now() + 86400000 * 30).toISOString(),
    usageCount: 0,
    maxUsage: payload.maxUsage ? Number(payload.maxUsage) : null,
    totalGmv: 0,
    ordersCount: 0,
    speedMs: 0.2,
  };
  store.promotions.unshift(newPromo);
  return mockResolve(structuredClone(newPromo));
}

export async function updatePromotion(id, payload) {
  if (!USE_MOCK) {
    const { data } = await api.put(`/admin/promotions/${id}`, payload);
    return data?.data ?? data;
  }
  const promo = store.promotions.find((p) => p.id === id);
  if (!promo) throw { message: "ไม่พบข้อมูลโปรโมชั่น (404)" };
  if (payload.code && payload.code.toUpperCase() !== promo.code) {
    const code = payload.code.toUpperCase().trim();
    if (store.promotions.some((p) => p.id !== id && p.code === code)) {
      throw { message: `โค้ดโปรโมชั่น ${code} มีอยู่ในระบบแล้ว` };
    }
    promo.code = code;
  }
  Object.assign(promo, {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
    ...(payload.discountType !== undefined ? { discountType: payload.discountType } : {}),
    ...(payload.discountValue !== undefined ? { discountValue: Number(payload.discountValue) } : {}),
    ...(payload.minSpend !== undefined ? { minSpend: Number(payload.minSpend) } : {}),
    ...(payload.maxDiscount !== undefined ? { maxDiscount: payload.maxDiscount ? Number(payload.maxDiscount) : null } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.expiresAt !== undefined ? { expiresAt: payload.expiresAt } : {}),
    ...(payload.maxUsage !== undefined ? { maxUsage: payload.maxUsage ? Number(payload.maxUsage) : null } : {}),
  });
  return mockResolve(structuredClone(promo));
}

export async function deletePromotion(id) {
  if (!USE_MOCK) {
    await api.delete(`/admin/promotions/${id}`);
    return { success: true };
  }
  const idx = store.promotions.findIndex((p) => p.id === id);
  if (idx === -1) throw { message: "ไม่พบโปรโมชั่นนี้ (404)" };
  store.promotions.splice(idx, 1);
  return mockResolve({ success: true });
}

/* ==========================================================================
   Employees & Staff Management Service
   ========================================================================== */

export async function fetchEmployees(params = {}) {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/employees", { params });
    return data?.data ?? data;
  }
  return mockResolve(
    queryCollection(store.employees, params, {
      searchKeys: SEARCH.employees,
      defaultSort: "joinedAt:desc",
    }),
  );
}

export async function createEmployee(payload) {
  if (!USE_MOCK) {
    const { data } = await api.post("/admin/employees", payload);
    return data?.data ?? data;
  }
  const email = (payload.email || "").toLowerCase().trim();
  if (store.employees.some((e) => e.email.toLowerCase() === email)) {
    throw { message: `อีเมล ${email} มีผู้ใช้งานแล้วในระบบ` };
  }
  const newEmp = {
    id: `emp-${Date.now()}`,
    employeeCode: `EMP-${String(store.employees.length + 1).padStart(3, "0")}`,
    name: payload.name?.trim() || "เจ้าหน้าที่ใหม่",
    username: payload.username?.trim() || `staff_${Date.now().toString().slice(-4)}`,
    nickname: payload.nickname?.trim() || "",
    email: email,
    phone: payload.phone?.trim() || "",
    role: payload.role || "support_agent",
    roleLabel: payload.roleLabel || "Support Agent",
    department: payload.department || "support",
    departmentLabel: payload.departmentLabel || "Customer Care & Support",
    position: payload.position?.trim() || "Staff Member",
    status: payload.status || "active",
    avatarBg: payload.avatarBg || "#1b64f2",
    permissions: Array.isArray(payload.permissions) ? payload.permissions : ["manage_orders"],
    joinedAt: new Date().toISOString(),
    lastLogin: null,
    location: payload.location?.trim() || "Bangkok HQ",
    notes: payload.notes?.trim() || "",
  };
  store.employees.unshift(newEmp);
  return mockResolve(structuredClone(newEmp));
}

export async function updateEmployee(id, payload) {
  if (!USE_MOCK) {
    const { data } = await api.put(`/admin/employees/${id}`, payload);
    return data?.data ?? data;
  }
  const emp = store.employees.find((e) => e.id === id);
  if (!emp) throw { message: "ไม่พบข้อมูลพนักงาน (404)" };

  if (payload.email && payload.email.toLowerCase() !== emp.email.toLowerCase()) {
    const email = payload.email.toLowerCase().trim();
    if (store.employees.some((e) => e.id !== id && e.email.toLowerCase() === email)) {
      throw { message: `อีเมล ${email} มีผู้ใช้งานแล้วในระบบ` };
    }
    emp.email = email;
  }

  Object.assign(emp, {
    ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
    ...(payload.username !== undefined ? { username: payload.username.trim() } : {}),
    ...(payload.nickname !== undefined ? { nickname: payload.nickname.trim() } : {}),
    ...(payload.phone !== undefined ? { phone: payload.phone.trim() } : {}),
    ...(payload.role !== undefined ? { role: payload.role } : {}),
    ...(payload.roleLabel !== undefined ? { roleLabel: payload.roleLabel } : {}),
    ...(payload.department !== undefined ? { department: payload.department } : {}),
    ...(payload.departmentLabel !== undefined ? { departmentLabel: payload.departmentLabel } : {}),
    ...(payload.position !== undefined ? { position: payload.position.trim() } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.avatarBg !== undefined ? { avatarBg: payload.avatarBg } : {}),
    ...(payload.permissions !== undefined ? { permissions: payload.permissions } : {}),
    ...(payload.location !== undefined ? { location: payload.location.trim() } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes.trim() } : {}),
  });

  return mockResolve(structuredClone(emp));
}

export async function deleteEmployee(id) {
  if (!USE_MOCK) {
    await api.delete(`/admin/employees/${id}`);
    return { success: true };
  }
  const idx = store.employees.findIndex((e) => e.id === id);
  if (idx === -1) throw { message: "ไม่พบพนักงานคนนี้ (404)" };
  if (store.employees[idx].role === "super_admin" && store.employees.filter((e) => e.role === "super_admin").length <= 1) {
    throw { message: "ไม่สามารถลบ Super Administrator คนสุดท้ายของระบบได้" };
  }
  store.employees.splice(idx, 1);
  return mockResolve({ success: true });
}

export const fetchFinancialLedger = (params) =>
  fetchCollection("financial", SEARCH.financial, params);

export async function fetchFinancialSummary() {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/financial/summary");
    return data?.data ?? data;
  }
  return mockResolve(structuredClone(mockFinancialSummary));
}

/* ───────────────────────── Moderation & Appeals ───────────────────────── */

export async function fetchModerationStats() {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/moderation/stats");
    return data?.stats ?? data;
  }
  const pendingCount = store["moderation-appeals"].filter((a) => a.status === "pending").length;
  const approvedCount = store["moderation-appeals"].filter((a) => a.status === "approved").length;
  const rejectedCount = store["moderation-appeals"].filter((a) => a.status === "rejected").length;
  return mockResolve({
    ...mockModerationStats,
    pendingAppeals: pendingCount,
    approvedAppeals: approvedCount,
    rejectedAppeals: rejectedCount,
    totalAppeals: store["moderation-appeals"].length,
  });
}

export async function fetchModerationAppeals(params = {}) {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/moderation/appeals", { params });
    return data;
  }
  return mockResolve(
    queryCollection(store["moderation-appeals"], {
      ...params,
      searchFields: SEARCH["moderation-appeals"],
      sort: params.sort || "createdAt:desc",
    })
  );
}

export async function reviewModerationAppeal(id, action, reviewerNote) {
  if (!USE_MOCK) {
    const { data } = await api.post(`/admin/moderation/appeals/${id}/review`, {
      action,
      reviewerNote,
    });
    return data?.appeal ?? data;
  }
  const row = store["moderation-appeals"].find((a) => a.id === Number(id));
  if (!row) throw { message: "ไม่พบคำร้องอุทธรณ์นี้ (404)" };
  if (row.status !== "pending")
    throw { message: "คำร้องนี้ได้รับการพิจารณาไปแล้ว (409)" };
  if (action === "reject" && !reviewerNote?.trim())
    throw { message: "การปฏิเสธต้องระบุเหตุผล (400)" };

  row.status = action === "approve" ? "approved" : "rejected";
  row.reviewerNote = reviewerNote || null;
  row.reviewedAt = new Date().toISOString();
  row.reviewer = {
    id: 1,
    name: "Admin Super",
    username: "admin",
  };

  // หากอนุมัติ ให้อัปเดต log ด้วย
  if (action === "approve" && row.logId) {
    const log = store["moderation-logs"].find((l) => l.id === row.logId);
    if (log) {
      log.isSafe = true;
      log.actionTaken = "approved_on_appeal";
    }
  }

  return mockResolve({ ...row });
}

export async function fetchModerationLogs(params = {}) {
  if (!USE_MOCK) {
    const { data } = await api.get("/admin/moderation/logs", { params });
    return data;
  }
  return mockResolve(
    queryCollection(store["moderation-logs"], {
      ...params,
      searchFields: SEARCH["moderation-logs"],
      sort: params.sort || "createdAt:desc",
    })
  );
}



