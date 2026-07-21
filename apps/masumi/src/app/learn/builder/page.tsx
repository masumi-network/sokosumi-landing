import { requireLearnUser } from "@/lib/learn-auth";
import { getBuilderProgress, getCredentialForUser } from "@/lib/learn-db";
import { BuilderPath } from "./builder-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Masumi Builder path" };

export default async function BuilderPage() {
  const user = await requireLearnUser("/learn/builder");
  const fundamentals = getCredentialForUser(user.id);
  const eligible = Boolean(fundamentals && fundamentals.status !== "revoked" && fundamentals.status !== "superseded");
  return <><header className="mb-10 max-w-3xl"><p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">Masumi Builder certificate</p><h1 className="mt-3 text-5xl font-medium tracking-tight sm:text-7xl">Build one complete Preprod flow.</h1><p className="mt-5 text-lg leading-8 text-black/60">Use maintained Docs for exact setup, persist a minimal proof, then demonstrate that you can operate the service responsibly. Learn never asks for wallet keys or private job data.</p><p className="mt-4 text-xs text-black/40">Reviewed 2026-07-20 · Accuracy: Developer Experience, Protocol Engineering, and Security/Privacy</p></header><BuilderPath eligible={eligible} initialProgress={getBuilderProgress(user.id)} /></>;
}
