"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { NetworkId } from "@/lib/network-config";

const OPTIONS: { value: NetworkId; label: string }[] = [
  { value: "mainnet", label: "Mainnet" },
  { value: "preprod", label: "Preprod" },
];

export default function NetworkToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current: NetworkId = searchParams.get("network") === "preprod" ? "preprod" : "mainnet";

  const setNetwork = useCallback(
    (network: NetworkId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (network === "mainnet") {
        params.delete("network");
      } else {
        params.set("network", network);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex gap-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setNetwork(opt.value)}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
            current === opt.value
              ? "border-black/[0.12] text-black bg-black/[0.04]"
              : "border-transparent text-[#999] hover:text-black"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
