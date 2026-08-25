"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChainIcon, ChainLabel } from "@/components/x402/chain-icon";
import { TokenIcon } from "@/components/x402/token-icon";
import {
  formatBaseUnitsToHuman,
  parseHumanAmountToBaseUnits,
  shortenEvmAddress,
} from "@/lib/x402/amount";
import { EVM_CHAINS, getEvmChainByCaip2Id } from "@/lib/x402/evm-chains";
import {
  getEvmTokenPresetsForChain,
  resolveDefaultAssetForChain,
  type EvmTokenPreset,
} from "@/lib/x402/token-presets";
import type { X402PaymentDraft } from "@/lib/x402/types";
import {
  getX402PaymentFieldErrors,
  type X402FieldErrors,
} from "@/lib/x402/validate";
import { cn } from "@/lib/utils/cn";

const inputClass =
  "w-full rounded-lg border border-masumi-border bg-white px-3 py-2.5 text-sm outline-none ring-masumi-ink/10 placeholder:text-masumi-muted focus:ring-2";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="text-sm font-medium text-masumi-ink">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs leading-relaxed text-masumi-muted">
          {hint}
        </span>
      ) : null}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputErrorClass(error?: string) {
  return error ? `${inputClass} border-red-400 focus:ring-red-200` : inputClass;
}

function ChoiceButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-masumi-ink bg-masumi-ink text-white"
          : "border-masumi-border bg-white text-masumi-ink hover:border-masumi-muted/60 hover:bg-masumi-surface/80",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function X402PaymentFields({
  value,
  onChange,
  cardanoNetwork,
  showErrors = false,
}: {
  value: X402PaymentDraft;
  onChange: (next: X402PaymentDraft) => void;
  cardanoNetwork: "Preprod" | "Mainnet";
  showErrors?: boolean;
}) {
  const [humanAmount, setHumanAmount] = useState(() =>
    formatBaseUnitsToHuman(value.amount, Number(value.decimals) || 6),
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useCustomToken, setUseCustomToken] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof X402PaymentDraft, boolean>>
  >({});

  useEffect(() => {
    // Keep the human-readable field in sync when presets or chain defaults update base units.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional prop-to-local sync
    setHumanAmount(
      formatBaseUnitsToHuman(value.amount, Number(value.decimals) || 6),
    );
  }, [value.amount, value.decimals]);

  const tokenPresets = getEvmTokenPresetsForChain(value.network);
  const selectedChain = getEvmChainByCaip2Id(value.network);
  const selectedPreset = tokenPresets.find(
    (preset) =>
      preset.address.toLowerCase() === value.asset.trim().toLowerCase(),
  );

  const fieldErrors = useMemo(() => getX402PaymentFieldErrors(value), [value]);
  const visibleErrors = showErrors
    ? fieldErrors
    : (Object.fromEntries(
        Object.entries(fieldErrors).filter(
          ([key]) => touched[key as keyof X402PaymentDraft],
        ),
      ) as X402FieldErrors);

  const mainnetChains = EVM_CHAINS.filter((chain) => !chain.isTestnet);
  const testnetChains = EVM_CHAINS.filter((chain) => chain.isTestnet);

  const chainMismatch =
    cardanoNetwork === "Preprod"
      ? selectedChain != null && !selectedChain.isTestnet
      : selectedChain?.isTestnet === true;

  const humanPreview = formatBaseUnitsToHuman(
    value.amount,
    Number(value.decimals) || 6,
  );
  const tokenLabel = selectedPreset?.label ?? "token";
  const showCustomTokenField =
    useCustomToken || tokenPresets.length === 0 || selectedPreset == null;

  function patch(partial: Partial<X402PaymentDraft>) {
    onChange({ ...value, ...partial });
  }

  function touch(field: keyof X402PaymentDraft) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function applyTokenPreset(preset: EvmTokenPreset) {
    setUseCustomToken(false);
    touch("asset");
    touch("decimals");
    const baseUnits =
      parseHumanAmountToBaseUnits(humanAmount, preset.decimals) ?? value.amount;
    patch({
      asset: preset.address,
      decimals: String(preset.decimals),
      amount: baseUnits,
    });
  }

  function handleChainChange(network: string) {
    touch("network");
    setUseCustomToken(false);
    const defaults = resolveDefaultAssetForChain(network);
    const nextDecimals = defaults?.decimals ?? value.decimals;
    const nextAsset = defaults?.asset ?? "";
    const nextAmount =
      parseHumanAmountToBaseUnits(humanAmount, Number(nextDecimals) || 6) ??
      value.amount;

    patch({
      network,
      asset: nextAsset,
      decimals: nextDecimals,
      amount: nextAmount,
    });
  }

  function handleHumanAmountChange(nextHuman: string) {
    touch("amount");
    setHumanAmount(nextHuman);
    const decimals = Number(value.decimals) || 6;
    const baseUnits = parseHumanAmountToBaseUnits(nextHuman, decimals);
    patch({ amount: baseUnits ?? "0" });
  }

  function handleDecimalsChange(nextDecimals: string) {
    touch("decimals");
    const cleaned = nextDecimals.replace(/\D/g, "");
    const decimals = Number(cleaned) || 0;
    patch({
      decimals: cleaned,
      amount: parseHumanAmountToBaseUnits(humanAmount, decimals) ?? "0",
    });
  }

  return (
    <div className="space-y-5 rounded-lg border border-masumi-border bg-masumi-surface/50 p-4">
      <div>
        <p className="text-sm font-medium text-masumi-ink">EVM payment (x402)</p>
        <p className="mt-1 text-xs leading-relaxed text-masumi-muted">
          Offer a fixed stablecoin price on an EVM chain. This is optional and
          works alongside dynamic pricing on escrow.
        </p>
      </div>

      {chainMismatch ? (
        <p className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
          {cardanoNetwork === "Preprod"
            ? "You picked a mainnet EVM network while registering on Preprod. For testing, use a testnet such as Base Sepolia."
            : "You picked a testnet EVM network while registering on Mainnet. For production, use a mainnet network such as Base."}
        </p>
      ) : null}

      <Field
        label="Network"
        hint="Where buyers pay with stablecoins."
        error={visibleErrors.network}
      >
        <Select
          value={value.network}
          onValueChange={handleChainChange}
        >
          <SelectTrigger
            className={cn(
              "h-auto min-h-[42px] py-2",
              visibleErrors.network ? "border-red-400 focus:ring-red-200" : undefined,
            )}
            onBlur={() => touch("network")}
          >
            <SelectValue placeholder="Choose a network">
              {selectedChain ? (
                <ChainLabel
                  caip2Id={selectedChain.caip2Id}
                  name={selectedChain.displayName}
                  iconSlug={selectedChain.icon}
                  className="min-w-0 [&_span]:line-clamp-none"
                />
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Mainnet</SelectLabel>
              {mainnetChains.map((chain) => (
                <SelectItem
                  key={chain.caip2Id}
                  value={chain.caip2Id}
                  textValue={chain.displayName}
                  className="py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <ChainIcon
                      caip2Id={chain.caip2Id}
                      name={chain.displayName}
                      iconSlug={chain.icon}
                      size={20}
                    />
                    <div className="min-w-0">
                      <span className="block text-sm">{chain.displayName}</span>
                      <span className="block font-mono text-[11px] text-masumi-muted">
                        {chain.caip2Id}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Testnet</SelectLabel>
              {testnetChains.map((chain) => (
                <SelectItem
                  key={chain.caip2Id}
                  value={chain.caip2Id}
                  textValue={chain.displayName}
                  className="py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <ChainIcon
                      caip2Id={chain.caip2Id}
                      name={chain.displayName}
                      iconSlug={chain.icon}
                      size={20}
                    />
                    <div className="min-w-0">
                      <span className="block text-sm">{chain.displayName}</span>
                      <span className="block font-mono text-[11px] text-masumi-muted">
                        {chain.caip2Id}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Stablecoin"
        hint="Pick a common token or enter a custom contract address."
        error={showCustomTokenField ? visibleErrors.asset : undefined}
      >
        {tokenPresets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tokenPresets.map((preset) => (
              <ChoiceButton
                key={preset.id}
                active={!showCustomTokenField && selectedPreset?.id === preset.id}
                onClick={() => applyTokenPreset(preset)}
                icon={
                  preset.id === "usdc" || preset.id === "usdt" ? (
                    <TokenIcon tokenId={preset.id} label={preset.label} size={18} />
                  ) : null
                }
              >
                {preset.label}
              </ChoiceButton>
            ))}
            <ChoiceButton
              active={showCustomTokenField}
              onClick={() => {
                setUseCustomToken(true);
                touch("asset");
              }}
            >
              Other
            </ChoiceButton>
          </div>
        ) : null}

        {showCustomTokenField ? (
          <input
            className={cn(inputErrorClass(visibleErrors.asset), tokenPresets.length > 0 && "mt-2")}
            value={value.asset}
            onChange={(e) => {
              touch("asset");
              patch({ asset: e.target.value.trim() });
            }}
            onBlur={() => touch("asset")}
            placeholder="0x contract address"
            spellCheck={false}
            autoComplete="off"
          />
        ) : selectedPreset ? (
          <p className="mt-2 font-mono text-xs text-masumi-muted">
            Contract {shortenEvmAddress(selectedPreset.address, 8)}
          </p>
        ) : null}
      </Field>

      <Field
        label="Price"
        hint={`Fixed amount buyers pay in ${tokenLabel}.`}
        error={visibleErrors.amount}
      >
        <div className="relative">
          <input
            className={cn(
              inputErrorClass(visibleErrors.amount),
              selectedPreset?.id === "usdc" || selectedPreset?.id === "usdt"
                ? "pr-24"
                : "pr-16",
            )}
            value={humanAmount}
            onChange={(e) => handleHumanAmountChange(e.target.value)}
            onBlur={() => touch("amount")}
            inputMode="decimal"
            placeholder="2.00"
            spellCheck={false}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5 text-sm font-medium text-masumi-muted">
            {selectedPreset?.id === "usdc" || selectedPreset?.id === "usdt" ? (
              <TokenIcon tokenId={selectedPreset.id} label={tokenLabel} size={16} />
            ) : null}
            {tokenLabel}
          </span>
        </div>
      </Field>

      <Field
        label="Receive payments at"
        hint="Your wallet address on this network."
        error={visibleErrors.payTo}
      >
        <input
          className={inputErrorClass(visibleErrors.payTo)}
          value={value.payTo}
          onChange={(e) => {
            touch("payTo");
            patch({ payTo: e.target.value.trim() });
          }}
          onBlur={() => touch("payTo")}
          placeholder="EVM wallet address"
          spellCheck={false}
          autoComplete="off"
        />
      </Field>

      <details className="group rounded-lg border border-masumi-border/80 bg-white/70">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-masumi-muted marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Optional settings</span>
          <span className="hidden group-open:inline">Hide optional settings</span>
        </summary>
        <div className="space-y-4 border-t border-masumi-border/80 px-3 pb-3 pt-3">
          <Field
            label="Resource URL"
            hint="Public URL for this payment option, if you have one."
            error={visibleErrors.resource}
          >
            <input
              className={inputErrorClass(visibleErrors.resource)}
              value={value.resource}
              onChange={(e) => {
                touch("resource");
                patch({ resource: e.target.value });
              }}
              onBlur={() => touch("resource")}
              placeholder="https://"
              spellCheck={false}
            />
          </Field>

          <div>
            <button
              type="button"
              className="text-xs font-medium text-masumi-muted underline underline-offset-2 hover:text-masumi-ink"
              onClick={() => setShowAdvanced((open) => !open)}
            >
              {showAdvanced ? "Hide technical fields" : "Show technical fields"}
            </button>
            {showAdvanced ? (
              <div className="mt-3 space-y-4">
                <Field
                  label="Token decimals"
                  hint="Usually 6 for USDC and USDT."
                  error={visibleErrors.decimals}
                >
                  <input
                    className={inputErrorClass(visibleErrors.decimals)}
                    value={value.decimals}
                    onChange={(e) => handleDecimalsChange(e.target.value)}
                    onBlur={() => touch("decimals")}
                    inputMode="numeric"
                    placeholder="6"
                    spellCheck={false}
                  />
                </Field>
                <Field
                  label="Amount in base units"
                  hint="Exact integer stored in registry metadata."
                  error={visibleErrors.amount}
                >
                  <input
                    className={inputErrorClass(visibleErrors.amount)}
                    value={value.amount}
                    onChange={(e) => {
                      touch("amount");
                      const next = e.target.value.replace(/\D/g, "");
                      patch({ amount: next });
                      setHumanAmount(
                        formatBaseUnitsToHuman(
                          next,
                          Number(value.decimals) || 6,
                        ),
                      );
                    }}
                    onBlur={() => touch("amount")}
                    inputMode="numeric"
                    placeholder="2000000"
                    spellCheck={false}
                  />
                  <p className="mt-1.5 font-mono text-xs text-masumi-muted">
                    Displayed as {humanPreview} {tokenLabel}
                  </p>
                </Field>
              </div>
            ) : null}
          </div>
        </div>
      </details>

      {value.payTo.trim() && value.asset.trim() && value.amount !== "0" ? (
        <div className="rounded-lg border border-masumi-border bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-masumi-muted">
            Summary
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm leading-relaxed text-masumi-ink">
            <ChainIcon
              caip2Id={value.network}
              name={selectedChain?.displayName}
              iconSlug={selectedChain?.icon}
              size={18}
            />
            <strong>{selectedChain?.displayName ?? value.network}</strong>
            <span className="text-masumi-muted">·</span>
            {selectedPreset?.id === "usdc" || selectedPreset?.id === "usdt" ? (
              <TokenIcon tokenId={selectedPreset.id} label={tokenLabel} size={16} />
            ) : null}
            <strong>
              {humanPreview} {tokenLabel}
            </strong>
            <span className="text-masumi-muted">to</span>
            <span className="font-mono text-xs">
              {shortenEvmAddress(value.payTo, 8)}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
