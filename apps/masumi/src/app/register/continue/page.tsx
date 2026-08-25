import { redirect } from "next/navigation";

type SearchParams = Promise<{
  draftId?: string;
  pollToken?: string;
  agentId?: string;
  agentName?: string;
}>;

export default async function RegisterContinuePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { draftId, pollToken, agentId, agentName } = await searchParams;
  const params = new URLSearchParams();

  if (agentId?.trim()) {
    params.set("agentId", agentId.trim());
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
