"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHeroBanners,
  updateHeroBanners,
  fetchAllBanners,
  createBanner,
  updateBanner,
  updateBannerStatus,
  deleteBanner,
} from "@/services/banners";

export const bannerKeys = {
  all: ["admin-banners"],
  hero: ["admin-banners", "hero"],
  list: (params) => ["admin-banners", "list", params],
};

export function useAdminHeroBanners() {
  return useQuery({
    queryKey: bannerKeys.hero,
    queryFn: fetchHeroBanners,
  });
}

export function useAdminBannersList(params) {
  return useQuery({
    queryKey: bannerKeys.list(params),
    queryFn: () => fetchAllBanners(params),
  });
}

export function useBannerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    queryClient.invalidateQueries({ queryKey: bannerKeys.hero });
  };

  const saveHero = useMutation({
    mutationFn: updateHeroBanners,
    onSuccess: invalidate,
  });

  const create = useMutation({
    mutationFn: createBanner,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateBanner(id, payload),
    onSuccess: invalidate,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }) => updateBannerStatus(id, status),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteBanner,
    onSuccess: invalidate,
  });

  return {
    saveHero,
    create,
    update,
    toggleStatus,
    remove,
  };
}
