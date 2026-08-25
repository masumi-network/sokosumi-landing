"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { CopyAgentId } from "@/app/register/success/copy-agent-id";
import { RegisterProgress } from "@/components/register-mint-progress";
import {
  clearNetworkRegistrationPollToken,
  readNetworkRegistrationPollToken,
} from "@/lib/network-registration-poll";

import {
  MASUMI_SAAS_URL,
  MASUMI_SUPPORT_URL,
} from "@/lib/config/register";

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 120;
const MAX_TRANSIENT_FAILURES = 3;

type ErrorKind = "failed" | "delayed";

type RegisterSuccessContentProps = {
  agentId?: string;
  agentName?: string;
  draftId?: string;
  pollToken?: string;
};

function isTransientPollFailure(status: number): boolean {
  return status === 0 || status === 429 || status >= 500;
}

function getPollTokenSnapshot(draftId: string, urlToken?: string): string {
  const fromUrl = urlToken?.trim();
  if (fromUrl) return fromUrl;
  if (!draftId) return "";
  return readNetworkRegistrationPollToken(draftId);
}

export function RegisterSuccessContent({
  agentId: initialAgentId,
  agentName: initialAgentName,
  draftId,
  pollToken,
}: RegisterSuccessContentProps) {
  const trimmedDraftId = draftId?.trim() ?? "";
  const activePollToken = useSyncExternalStore(
    () => () => {},
    () => getPollTokenSnapshot(trimmedDraftId, pollToken),
    () => pollToken?.trim() ?? "",
  );
  const [phase, setPhase] = useState<"pending" | "complete" | "error">(
    trimmedDraftId && activePollToken
      ? "pending"
      : trimmedDraftId
        ? "pending"
        : "complete",
  );
  const [agentId, setAgentId] = useState(initialAgentId?.trim() ?? "");
  const agentName = initialAgentName?.trim() ?? "";
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);

  const displayName = agentName || "Your agent";

  const panelStack = (children: ReactNode) => (
    <div className="mx-auto mt-8 w-full space-y-4 text-left">{children}</div>
  );

  useEffect(() => {
    if (!trimmedDraftId || !activePollToken) return;

    let cancelled = false;
    let attempts = 0;
    let consecutiveFailures = 0;
    let inFlight = false;

    const markComplete = (id: string) => {
      cancelled = true;
      clearNetworkRegistrationPollToken(trimmedDraftId);
      setAgentId(id);
      setPhase("complete");
      const url = new URL(window.location.href);
      url.pathname = "/register/success";
      url.search = "";
      url.searchParams.set("agentId", id);
      if (agentName) {
        url.searchParams.set("agentName", agentName);
      }
      window.history.replaceState(null, "", url.toString());
    };

    const fail = (kind: ErrorKind, message: string) => {
      cancelled = true;
      setErrorKind(kind);
      setError(message);
      setPhase("error");
    };

    const tick = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      attempts += 1;

      try {
        if (attempts > MAX_POLL_ATTEMPTS) {
          fail(
            "delayed",
            "This is taking longer than expected. We'll email you when it's done.",
          );
          return;
        }

        const res = await fetch(
          `${MASUMI_SAAS_URL}/api/public/network/register/status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              draftId: trimmedDraftId,
              pollToken: activePollToken,
            }),
          },
        );

        const data = (await res.json()) as {
          status?: "registered" | "pending";
          agentId?: string;
          error?: string;
          message?: string;
        };

        if (cancelled) return;

        if (!res.ok) {
          if (isTransientPollFailure(res.status)) {
            consecutiveFailures += 1;
            if (consecutiveFailures < MAX_TRANSIENT_FAILURES) return;
          }
          fail(
            "failed",
            data.error || data.message || `Request failed (${res.status})`,
          );
          return;
        }

        consecutiveFailures = 0;

        if (data.status === "registered" && data.agentId) {
          markComplete(data.agentId);
        }
      } catch (e) {
        if (cancelled) return;
        consecutiveFailures += 1;
        if (consecutiveFailures < MAX_TRANSIENT_FAILURES) return;
        fail(
          "failed",
          e instanceof Error
            ? e.message
            : "Failed to check registration status",
        );
      } finally {
        inFlight = false;
      }
    };

    const loop = async () => {
      while (!cancelled) {
        await tick();
        if (cancelled) break;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    };

    void loop();

    return () => {
      cancelled = true;
    };
  }, [activePollToken, agentName, trimmedDraftId]);

  if (trimmedDraftId && !activePollToken) {
    return (
      <div className="animate-fade-in-up animation-delay-100 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Registration session expired
        </h1>
        <p className="mt-3 text-masumi-muted">
          Start again from the register page to continue.
        </p>
        <div className="mt-8">
          <Link href="/register" className="btn-primary">
            Register an agent
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    const isFailed = errorKind === "failed";

    return (
      <div className="animate-fade-in-up animation-delay-100 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {isFailed
            ? `Registration failed${agentName ? ` for ${displayName}` : ""}`
            : "Registration is still in progress"}
        </h1>
        <p className="mt-3 text-masumi-muted">{error}</p>
        {panelStack(agentId ? <CopyAgentId agentId={agentId} /> : null)}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary">
            Register another
          </Link>
          <a
            href={MASUMI_SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            Contact support
          </a>
        </div>
      </div>
    );
  }

  if (phase === "pending") {
    return (
      <div className="animate-fade-in-up animation-delay-100 text-center">
        <p className="text-sm font-medium text-masumi-pink">Almost there</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Registering {displayName}
        </h1>
        <p className="mt-3 text-masumi-muted">
          This usually takes a minute or two. We&apos;ll email you when
          it&apos;s done. You can close this tab.
        </p>
        {panelStack(
          <>
            {agentId ? <CopyAgentId agentId={agentId} /> : null}
            <RegisterProgress />
          </>,
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up animation-delay-100 text-center">
      <p className="text-sm font-medium text-masumi-pink">
        You are on the network
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {displayName} is registered
      </h1>
      <p className="mt-3 text-masumi-muted">
        We&apos;ve sent a confirmation to your email. Save your agent ID below.
      </p>
      {panelStack(agentId ? <CopyAgentId agentId={agentId} /> : null)}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/register" className="btn-primary">
          Register another
        </Link>
        <Link href="/" className="btn-secondary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
