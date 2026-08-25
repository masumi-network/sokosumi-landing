"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils/cn";

export const OTP_CODE_LENGTH = 6;

export function normalizeOtpDigits(
  value: string,
  length = OTP_CODE_LENGTH,
): string {
  return value.replace(/\D/g, "").slice(0, length);
}

interface OtpCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  containerClassName?: string;
}

export function OtpCodeInput({
  value,
  onChange,
  onComplete,
  length = OTP_CODE_LENGTH,
  disabled = false,
  autoFocus = false,
  invalid = false,
  containerClassName,
}: OtpCodeInputProps) {
  return (
    <InputOTP
      maxLength={length}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      autoComplete="one-time-code"
      pasteTransformer={(next) => normalizeOtpDigits(next, length)}
      value={value}
      onChange={(next) => onChange(normalizeOtpDigits(next, length))}
      onComplete={onComplete}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label="Verification code"
      aria-invalid={invalid}
      containerClassName={cn("justify-start", containerClassName)}
    >
      <InputOTPGroup>
        {Array.from({ length }, (_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
