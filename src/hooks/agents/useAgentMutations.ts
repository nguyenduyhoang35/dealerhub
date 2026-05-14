"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "../fetcher";
import type { Agent } from "../types";

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Agent, "id">) =>
      mutate("/api/agents", "POST", data, "Lỗi tạo đại lý"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Agent) =>
      mutate(`/api/agents/${id}`, "PUT", data, "Lỗi cập nhật đại lý"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      mutate(`/api/agents/${id}`, "DELETE", undefined, "Lỗi xóa đại lý"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
