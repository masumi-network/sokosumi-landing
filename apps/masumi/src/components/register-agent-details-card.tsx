import { cn } from "@/lib/utils/cn";
import type { NetworkRegistrationAgentDetails } from "@/lib/network-registration-details";

export function RegisterAgentDetailsCard({
  details,
  className,
}: {
  details: NetworkRegistrationAgentDetails;
  className?: string;
}) {
  const description = details.description?.trim();

  return (
    <div
      className={cn(
        "rounded-2xl border border-masumi-border bg-white px-5 py-4 text-left shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-medium text-masumi-muted">Agent details</p>
      <dl className="mt-3 grid gap-3 text-sm">
        <div>
          <dt className="text-xs text-masumi-muted">Name</dt>
          <dd className="mt-0.5 font-medium text-masumi-ink">{details.name}</dd>
        </div>
        {description ? (
          <div>
            <dt className="text-xs text-masumi-muted">Description</dt>
            <dd className="mt-0.5 leading-relaxed text-masumi-ink">
              {description}
            </dd>
          </div>
        ) : null}
        {details.apiUrl.trim() ? (
          <div>
            <dt className="text-xs text-masumi-muted">API base URL</dt>
            <dd className="mt-0.5 break-all font-medium text-masumi-ink">
              {details.apiUrl}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-masumi-muted">Tags</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {details.tags.length > 0 ? (
              details.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-masumi-border bg-masumi-surface/60 px-2.5 py-0.5 text-xs font-medium text-masumi-ink"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-masumi-muted">None</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
