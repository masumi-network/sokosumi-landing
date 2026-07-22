import "server-only";

import { getCurrentLearnUser } from "./learn-auth";
import type { LearnUser } from "./learn-db";

const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUBJECT_PATTERN = /^[^\s,\x00-\x1f\x7f]{1,512}$/;

type DashboardAllowlist = {
  subjects: Set<string>;
  userIds: Set<string>;
};

function dashboardAllowlist(): DashboardAllowlist | null {
  const configured = process.env.MASUMI_LEARN_DASHBOARD_ALLOWLIST;
  if (!configured?.trim()) return null;

  const subjects = new Set<string>();
  const userIds = new Set<string>();
  const entries = configured.split(/[\n,]/).map((entry) => entry.trim());
  if (!entries.length || entries.some((entry) => !entry)) return null;

  for (const entry of entries) {
    if (entry.startsWith("subject:")) {
      const subject = entry.slice("subject:".length);
      if (!SUBJECT_PATTERN.test(subject)) return null;
      subjects.add(subject);
      continue;
    }

    if (entry.startsWith("user:")) {
      const userId = entry.slice("user:".length);
      if (!USER_ID_PATTERN.test(userId)) return null;
      userIds.add(userId);
      continue;
    }

    return null;
  }

  return subjects.size || userIds.size ? { subjects, userIds } : null;
}

export function learnDashboardAllowlistConfigured() {
  return dashboardAllowlist() !== null;
}

export function isLearnDashboardOperator(user: LearnUser | null | undefined) {
  if (!user) return false;
  const allowlist = dashboardAllowlist();
  return Boolean(allowlist?.subjects.has(user.providerSubject) || allowlist?.userIds.has(user.id));
}

export async function getCurrentLearnDashboardOperator() {
  const user = await getCurrentLearnUser();
  return isLearnDashboardOperator(user) ? user : null;
}
