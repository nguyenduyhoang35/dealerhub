"use client";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { DashboardStats, AdminStats } from "../types";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => fetcher<DashboardStats>("/api/stats"),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetcher<AdminStats>("/api/stats"),
  });
}
