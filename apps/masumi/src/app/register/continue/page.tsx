import { redirect } from "next/navigation";

type SearchParams = Promise<{
  draftId?: string;
  pollToken?: string;
  agentIdentifier?: string;
  agentName?: string;
}>;

export default async function RegisterContinuePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { draftId, pollToken, agentIdentifier, agentName } = await searchParams;
  const params = new URLSearchParams();

  if (agentIdentifier?.trim()) {
    params.set("agentIdentifier", agentIdentifier.trim());
  }
  if (agentName?.trim()) {
    params.set("agentName", agentName.trim());
  }
  if (draftId?.trim()) {
    params.set("draftId", draftId.trim());
  }
  if (pollToken?.trim()) {
    params.set("pollToken", pollToken.trim());
  }

  const query = params.toString();
  redirect(query ? `/register/success?${query}` : "/register");
}
