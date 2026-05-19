"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { Order, PaginatedResponse, DebtInfo, AdminDebtResponse, AgentDebtDetail } from "../types";

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

export function useAdminDebt(params?: {
  page?: number;
  limit?: number;
  search?: string;
  hasDebt?: boolean | null;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.search) queryParams.set("search", params.search);
  if (params?.hasDebt !== undefined && params?.hasDebt !== null) {
    queryParams.set("hasDebt", String(params.hasDebt));
  }

  return useQuery({
    queryKey: ["admin-debt", params],
    queryFn: () => fetcher<AdminDebtResponse>(`/api/admin/debt?${queryParams}`),
  });
}

export function useAgentDebt(agentId: number | null, params?: { page?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["agent-debt", agentId, params],
    queryFn: () => fetcher<AgentDebtDetail>(`/api/admin/debt/${agentId}?${queryParams}`),
    enabled: !!agentId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      amount,
      note,
      orderId,
    }: {
      agentId: number;
      amount: number;
      note?: string;
      orderId?: number;
    }) => {
      const res = await fetch(`/api/admin/debt/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note, order_id: orderId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi ghi nhận thanh toán");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-debt"] });
      queryClient.invalidateQueries({ queryKey: ["agent-debt", variables.agentId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
