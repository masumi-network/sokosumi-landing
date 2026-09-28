"use client";

import { Coins } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { getEvmTokenIconPath } from "@/lib/x402/chain-icons";

export function TokenIcon({
  tokenId,
  label,
  size = 18,
  className,
}: {
  tokenId: "usdc" | "usdt" | string;
  label?: string;
  size?: number;
  className?: string;
}) {
  const src = getEvmTokenIconPath(tokenId);
  const [loadError, setLoadError] = useState(false);

  if (!src || loadError) {
    return (
      <Coins
        className={cn("shrink-0 text-masumi-muted", className)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt={label ? `${label} icon` : ""}
      width={size}
      height={size}
      unoptimized
      className={cn("shrink-0 rounded-full object-contain", className)}
      aria-hidden={!label}
      onError={() => setLoadError(true)}
    />
  );
}
