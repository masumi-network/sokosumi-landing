"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { ButtonLoadingLabel } from "@/components/ui/button-loading-label";
import { Spinner } from "@/components/ui/spinner";
import { OtpCodeInput } from "@/components/otp-code-input";

type RegisterVerifyDialogProps = {
  open: boolean;
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onComplete: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onClose: () => void;
  verifying: boolean;
  sendingCode: boolean;
  error: string | null;
};

export function RegisterVerifyDialog({
  open,
  email,
  otp,
  onOtpChange,
  onComplete,
  onVerify,
  onResend,
  onClose,
  verifying,
  sendingCode,
  error,
}: RegisterVerifyDialogProps) {
  const busy = verifying || sendingCode;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="animate-dialog-overlay-in absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label="Close verification dialog"
        disabled={busy}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-verify-title"
        className="animate-dialog-content-in relative w-full max-w-md rounded-2xl border border-masumi-border bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="absolute right-4 top-4 rounded-full p-1 text-masumi-muted hover:bg-masumi-surface hover:text-masumi-ink disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="dialog-stagger-in space-y-6 text-center">
          <div className="space-y-2 px-2">
            <h3
              id="register-verify-title"
              className="text-lg font-semibold tracking-tight text-masumi-ink"
            >
              Check your email
            </h3>
            <p className="text-sm text-masumi-muted">
              Enter the 6-digit code we sent to{" "}
              <span className="font-medium text-masumi-ink">{email}</span>
            </p>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex justify-center">
            <OtpCodeInput
              value={otp}
              onChange={onOtpChange}
              onComplete={onComplete}
              disabled={busy}
              autoFocus
              invalid={Boolean(error)}
              containerClassName="justify-center"
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onVerify}
              disabled={busy || otp.trim().length < 6}
              className="btn-primary w-full max-w-xs disabled:opacity-60"
            >
              {verifying ? (
                <ButtonLoadingLabel label="Verifying" />
              ) : (
                "Verify email"
              )}
            </button>
            <button
              type="button"
              className="text-sm font-medium text-masumi-ink underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy}
              onClick={onResend}
            >
              {sendingCode ? (
                <span className="inline-flex items-center">
                  <Spinner size={14} className="mr-1.5" />
                  Sending
                </span>
              ) : (
                "Resend code"
              )}
            </button>
            {process.env.NODE_ENV === "development" ? (
              <p className="text-xs text-masumi-muted">
                Dev: code is in the API server logs
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
