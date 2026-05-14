"use client";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { Category } from "../types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetcher<Category[]>("/api/categories"),
  });
}
