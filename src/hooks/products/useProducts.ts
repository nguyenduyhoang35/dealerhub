"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { Product, PaginatedResponse } from "../types";

export function useProducts(params?: {
  categoryId?: string;
  search?: string;
  all?: boolean;
}) {
  const queryParams = new URLSearchParams();
  if (params?.categoryId && params.categoryId !== "all") {
    queryParams.set("category_id", params.categoryId);
  }
  if (params?.search) queryParams.set("search", params.search);
  if (params?.all) queryParams.set("all", "1");

  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetcher<Product[] | PaginatedResponse<Product>>(`/api/products?${queryParams}`),
  });
}

export function useProductsInfinite(params?: {
  categoryId?: string;
  search?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["products-infinite", params?.categoryId, params?.search],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(pageParam));
      queryParams.set("limit", String(params?.limit || 20));
      if (params?.categoryId && params.categoryId !== "all") {
        queryParams.set("category_id", params.categoryId);
      }
      if (params?.search) queryParams.set("search", params.search);

      return fetcher<PaginatedResponse<Product>>(`/api/products?${queryParams}`);
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: () => fetcher<Product[]>("/api/products?all=1"),
  });
}
