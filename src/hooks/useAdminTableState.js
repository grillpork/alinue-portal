"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * useAdminTableState
 * Single source of truth for the table controls (search / status / sort / page),
 * mirrored into the URL so every filtered view is deep-linkable and survives reload.
 *
 * Only `q` is held in local state (typing needs instant feedback); the rest are read
 * straight from the URL, which keeps state flow one-directional.
 */
export function useAdminTableState({
  defaultSort = "updatedAt:desc",
  defaultLimit = 10,
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") || "");

  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || defaultSort;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Number(searchParams.get("limit") || defaultLimit));

  const push = useCallback(
    (next) => {
      const params = new URLSearchParams();
      if (next.q) params.set("q", next.q);
      if (next.status && next.status !== "all")
        params.set("status", next.status);
      if (next.sort && next.sort !== defaultSort) params.set("sort", next.sort);
      if (next.page && next.page > 1) params.set("page", String(next.page));

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, defaultSort],
  );

  const urlQuery = searchParams.get("q") || "";

  // Debounce URL writes so typing does not spam the history stack.
  useEffect(() => {
    if (query === urlQuery) return undefined;
    const timer = setTimeout(
      () => push({ q: query, status, sort, page: 1 }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, urlQuery, status, sort, push]);

  const actions = useMemo(
    () => ({
      onQueryChange: setQuery,
      onStatusChange: (nextStatus) =>
        push({ q: query, status: nextStatus, sort, page: 1 }),
      onSortChange: (nextSort) =>
        push({ q: query, status, sort: nextSort, page: 1 }),
      onPageChange: (nextPage) =>
        push({ q: query, status, sort, page: nextPage }),
      onReset: () => {
        setQuery("");
        push({ q: "", status: "all", sort: defaultSort, page: 1 });
      },
    }),
    [push, query, status, sort, defaultSort],
  );

  return { params: { q: query, status, sort, page, limit }, ...actions };
}
