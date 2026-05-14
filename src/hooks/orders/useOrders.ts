"use client";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { Order, PaginatedResponse, DebtInfo } from "../types";

export function useOrders(params?: { status?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set("status", params.status);
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetcher<PaginatedResponse<Order>>(`/api/orders?${queryParams}`),
  });
}

export function useAdminOrders(params?: { status?: string; page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set("status", params.status);
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => fetcher<PaginatedResponse<Order>>(`/api/orders?${queryParams}`),
  });
}

export function useOrder(id: number | string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetcher<Order>(`/api/orders/${id}`),
    enabled: !!id,
  });
}

export function useDebt(params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["debt", params],
    queryFn: () => fetcher<DebtInfo>(`/api/debt?${queryParams}`),
  });
}
