"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "../fetcher";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; sort_order?: number }) =>
      mutate("/api/categories", "POST", data, "Lỗi tạo danh mục"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; sort_order?: number }) =>
      mutate(`/api/categories/${id}`, "PUT", data, "Lỗi cập nhật danh mục"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      mutate(`/api/categories/${id}`, "DELETE", undefined, "Lỗi xóa danh mục"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
