"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "../fetcher";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      agent_id: number;
      delivery_date?: string;
      note?: string;
      items: { product_id: number; qty: number; price: number }[];
    }) => mutate("/api/orders", "POST", data, "Lỗi tạo đơn hàng"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["debt"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: unknown }) =>
      mutate(`/api/orders/${id}`, "PUT", data, "Lỗi cập nhật đơn hàng"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      mutate(`/api/orders/${id}`, "DELETE", undefined, "Lỗi xóa đơn hàng"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
