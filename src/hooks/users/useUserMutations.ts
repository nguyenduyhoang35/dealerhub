"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "../fetcher";
import type { User } from "../types";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<User, "id" | "role" | "agent"> & { pin?: string }) =>
      mutate("/api/users", "POST", data, "Lỗi tạo tài khoản"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Omit<User, "role" | "agent"> & { pin?: string }) =>
      mutate(`/api/users/${id}`, "PUT", data, "Lỗi cập nhật tài khoản"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      mutate(`/api/users/${id}`, "DELETE", undefined, "Lỗi xóa tài khoản"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
