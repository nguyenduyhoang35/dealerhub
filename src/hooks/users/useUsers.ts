"use client";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { User } from "../types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetcher<User[]>("/api/users"),
  });
}
