"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-11 w-10 items-center justify-center border-y border-r border-masumi-border bg-white text-lg font-mono tabular-nums text-masumi-ink shadow-xs outline-none transition-all first:rounded-l-md first:border-l last:rounded-r-md sm:h-12 sm:w-11",
        "data-[active=true]:z-10 data-[active=true]:border-masumi-ink data-[active=true]:ring-[3px] data-[active=true]:ring-masumi-ink/10",
        "aria-invalid:border-red-500",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-masumi-ink duration-1000" />
        </div>
      ) : null}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };
