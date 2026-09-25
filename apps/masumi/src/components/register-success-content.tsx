"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { CopyAgentId } from "@/app/register/success/copy-agent-id";
import { RegisterAgentDetailsCard } from "@/components/register-agent-details-card";
import { RegisterProgress } from "@/components/register-mint-progress";
import {
  readNetworkRegistrationAgentDetails,
  storeNetworkRegistrationAgentDetailsForAgent,
  type NetworkRegistrationAgentDetails,
} from "@/lib/network-registration-details";
import {
  clearNetworkRegistrationPollToken,
  readNetworkRegistrationPollToken,
} from "@/lib/network-registration-poll";

import {
  registrationApiUrl,
  MASUMI_SUPPORT_URL,
} from "@/lib/config/register";

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 120;
const MAX_TRANSIENT_FAILURES = 3;

type ErrorKind = "failed" | "delayed";

type RegisterSuccessContentProps = {
  agentIdentifier?: string;
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
  agentIdentifier: initialAgentIdentifier,
  agentName: initialAgentName,
  draftId,
  pollToken,
}: RegisterSuccessContentProps) {
  const trimmedDraftId = draftId?.trim() ?? "";
  const [hasHydrated, setHasHydrated] = useState(false);
  useLayoutEffect(() => {
    setHasHydrated(true);
  }, []);

  const activePollToken = useSyncExternalStore(
    () => () => {},
    () => getPollTokenSnapshot(trimmedDraftId, pollToken),
    () => pollToken?.trim() ?? "",
  );
  const initialNetworkId = initialAgentIdentifier?.trim() ?? "";
  const [phase, setPhase] = useState<"pending" | "complete" | "error">(() => {
    if (trimmedDraftId) return "pending";
    if (initialNetworkId) return "complete";
    return "error";
  });
  const [agentIdentifier, setAgentIdentifier] = useState(initialNetworkId);
  const agentName = initialAgentName?.trim() ?? "";
  const [agentDetails, setAgentDetails] =
    useState<NetworkRegistrationAgentDetails | null>(null);
  const [error, setError] = useState<string | null>(() => {
    if (!trimmedDraftId && !initialNetworkId) {
      return "No registration details were provided.";
    }
    return null;
  });
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(() => {
    if (!trimmedDraftId && !initialNetworkId) return "failed";
    return null;
  });

  const displayName = agentName || "Your agent";

  const panelStack = (children: ReactNode) => (
    <div className="mx-auto mt-8 w-full space-y-4 text-left">{children}</div>
  );

  useEffect(() => {
    const stored = readNetworkRegistrationAgentDetails({
      draftId: trimmedDraftId || undefined,
      agentIdentifier: initialNetworkId || agentIdentifier || undefined,
    });
    if (stored) {
      setAgentDetails(stored);
      return;
    }
    if (agentName) {
      setAgentDetails({
        name: agentName,
        description: null,
        apiUrl: "",
        tags: [],
      });
    }
  }, [agentIdentifier, agentName, initialNetworkId, trimmedDraftId]);

  const registrationSummaryCards = (networkId?: string) => (
    <>
      {agentDetails ? (
        <RegisterAgentDetailsCard details={agentDetails} />
      ) : null}
      {networkId ? <CopyAgentId agentId={networkId} /> : null}
    </>
  );

  useEffect(() => {
    if (!trimmedDraftId || !activePollToken) return;

    let cancelled = false;
    const controller = new AbortController();
    const deadline = Date.now() + 10 * 60_000;
    let delay: ReturnType<typeof setTimeout> | undefined;
    let wake: (() => void) | undefined;
    let attempts = 0;
    let consecutiveFailures = 0;
    let inFlight = false;

    const markComplete = (networkAgentId: string) => {
      cancelled = true;
      clearNetworkRegistrationPollToken(trimmedDraftId);
      const detailsForPersist =
        readNetworkRegistrationAgentDetails({
          draftId: trimmedDraftId,
        }) ??
        readNetworkRegistrationAgentDetails({
          agentIdentifier: networkAgentId,
        });
      if (detailsForPersist) {
        storeNetworkRegistrationAgentDetailsForAgent(
          networkAgentId,
          detailsForPersist,
        );
      }
      setAgentIdentifier(networkAgentId);
      setPhase("complete");
      const url = new URL(window.location.href);
      url.pathname = "/register/success";
      url.search = "";
      url.searchParams.set("agentIdentifier", networkAgentId);
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
        if (attempts > MAX_POLL_ATTEMPTS || Date.now() >= deadline) {
          fail(
            "delayed",
            "This is taking longer than expected. We'll email you when it's done.",
          );
          return;
        }

        const res = await fetch(registrationApiUrl("/status"), {
          method: "POST",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15_000),
          ]),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftId: trimmedDraftId,
            pollToken: activePollToken,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          status?: "registered" | "pending";
          agentIdentifier?: string;
          successPath?: string;
          agent?: NetworkRegistrationAgentDetails;
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

        if (data.agent) {
          setAgentDetails(data.agent);
          if (data.agentIdentifier?.trim()) {
            storeNetworkRegistrationAgentDetailsForAgent(
              data.agentIdentifier.trim(),
              data.agent,
            );
          }
        }

        if (data.status === "registered") {
          const fromBody = data.agentIdentifier?.trim();
          const fromSuccessPath = (() => {
            if (!data.successPath?.trim()) return "";
            try {
              return (
                new URL(data.successPath).searchParams
                  .get("agentIdentifier")
                  ?.trim() ?? ""
              );
            } catch {
              return "";
            }
          })();
          const networkId = fromBody || fromSuccessPath;
          if (networkId) {
            markComplete(networkId);
          }
        } else if (data.status !== "pending") {
          fail(
            "failed",
            "The server returned an unknown registration status. Contact support before starting again.",
          );
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
        await new Promise<void>((resolve) => {
          wake = resolve;
          delay = setTimeout(resolve, POLL_INTERVAL_MS);
        });
      }
    };

    void loop();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(delay);
      wake?.();
    };
  }, [activePollToken, agentName, trimmedDraftId]);

  if (phase === "error") {
    const isFailed = errorKind === "failed";

    return (
      <div className="animate-fade-in-up animation-delay-100 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {isFailed
            ? `Could not confirm registration${agentName ? ` for ${displayName}` : ""}`
            : "Registration is still in progress"}
        </h1>
        <p className="mt-3 text-masumi-muted">{error}</p>
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

  const awaitingPollToken =
    phase !== "complete" && Boolean(trimmedDraftId) && !activePollToken;

  if (phase === "pending" || (awaitingPollToken && !hasHydrated)) {
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
            {registrationSummaryCards()}
            <RegisterProgress step="processing" />
          </>,
        )}
      </div>
    );
  }

  if (awaitingPollToken && hasHydrated) {
    return (
      <div className="animate-fade-in-up animation-delay-100 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Registration session expired
        </h1>
        <p className="mt-3 text-masumi-muted">
          Status tracking is unavailable. Check your email or contact support
          before starting another registration.
        </p>
        <div className="mt-8">
          <Link href="/register" className="btn-primary">
            Register an agent
          </Link>
        </div>
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
      {panelStack(registrationSummaryCards(agentIdentifier))}
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
