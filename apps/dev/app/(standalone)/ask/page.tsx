import { redirect } from 'next/navigation';

type SearchValue = string | string[] | undefined;

// The Ask Nori chat moved to the portal root. Keep /ask working for old links.
export default async function AskRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchValue>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) query.set(key, first);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  redirect(`/${suffix}`);
}
