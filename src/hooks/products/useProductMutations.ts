"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "../fetcher";
import type { Product } from "../types";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Product, "id" | "category">) =>
      mutate("/api/products", "POST", data, "Lỗi tạo sản phẩm"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Omit<Product, "category">) =>
      mutate(`/api/products/${id}`, "PUT", data, "Lỗi cập nhật sản phẩm"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      mutate(`/api/products/${id}`, "DELETE", undefined, "Lỗi xóa sản phẩm"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
    },
  });
}
