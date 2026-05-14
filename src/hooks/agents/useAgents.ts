"use client";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../fetcher";
import type { Agent } from "../types";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => fetcher<Agent[]>("/api/agents"),
  });
}
