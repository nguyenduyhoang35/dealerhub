"use client";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { Role, Permission } from "../types";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => fetcher<Role[]>("/api/roles"),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => fetcher<Permission[]>("/api/permissions"),
  });
}
