import api from "@/lib/api";

/**
 * Fetch hero promotional banners (main and secondary) from backend
 */
export async function fetchHeroBanners() {
  const { data } = await api.get("/banners/hero");
  return data?.data ?? data;
}

/**
 * Update hero promotional banners (main and secondary)
 */
export async function updateHeroBanners(payload) {
  const { data } = await api.put("/banners/hero", payload);
  return data?.data ?? data;
}

/**
 * Fetch all banners from backend with pagination / filter
 */
export async function fetchAllBanners(params = {}) {
  const { data } = await api.get("/banners", { params });
  return data?.data ?? data;
}

/**
 * Upload banner image directly to Cloudflare R2 via backend
 */
export async function uploadBannerImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/banners/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data?.data ?? data;
}

/**
 * Create a new banner record
 */
export async function createBanner(payload) {
  const { data } = await api.post("/admin/promotions", payload);
  return data?.data ?? data;
}

/**
 * Update a banner record
 */
export async function updateBanner(id, payload) {
  const { data } = await api.put(`/admin/promotions/${id}`, payload);
  return data?.data ?? data;
}

/**
 * Toggle or update banner status
 */
export async function updateBannerStatus(id, status) {
  const { data } = await api.patch(`/admin/promotions/${id}/status`, { status });
  return data?.data ?? data;
}

/**
 * Delete a banner (soft delete)
 */
export async function deleteBanner(id) {
  const { data } = await api.delete(`/admin/promotions/${id}`);
  return data?.data ?? data;
}
