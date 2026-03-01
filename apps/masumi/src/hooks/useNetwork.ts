"use client";

import { useSearchParams } from "next/navigation";
import type { NetworkId } from "@/lib/network-config";

export function useNetwork(): NetworkId {
  const searchParams = useSearchParams();
  const val = searchParams.get("network");
  if (val === "preprod") return "preprod";
  return "mainnet";
}
