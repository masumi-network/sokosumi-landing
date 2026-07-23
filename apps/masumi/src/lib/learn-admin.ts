import "server-only";

import { getCurrentLearnUser } from "./learn-auth";
import { BUILDER_COURSE_VERSION, COURSE_VERSION, getLearnDb, type LearnUser } from "./learn-db";

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

type ParticipantRow = {
  id: string;
  displayName: string | null;
  email: string | null;
  joinedAt: string;
  lastActiveAt: string;
  lessonsCompleted: number;
  quizzesPassed: number;
  quizAttempts: number;
  quizPasses: number;
  bestQuizScore: number | null;
  assessmentAttempts: number;
  assessmentPasses: number;
  bestAssessmentScore: number | null;
  builderStepsCompleted: number;
  verifiedBuilderProofs: number;
  fundamentalsCredentialStatus: string | null;
  builderCredentialStatus: string | null;
};

export function getLearnParticipantReport(limit: number, offset: number) {
  const db = getLearnDb();
  const participants = db.prepare(`
    WITH activity_events AS (
      SELECT user_id, updated_at AS activity_at FROM learn_unit_progress
      UNION ALL SELECT user_id, created_at FROM learn_quiz_attempts
      UNION ALL SELECT user_id, created_at FROM learn_assessment_attempts
      UNION ALL SELECT user_id, completed_at FROM learn_builder_steps
      UNION ALL SELECT user_id, updated_at FROM learn_builder_submissions
      UNION ALL SELECT user_id, created_at FROM learn_builder_assessment_attempts
      UNION ALL SELECT user_id, updated_at FROM learn_credentials
    ), activity AS (
      SELECT user_id, MAX(activity_at) AS last_active_at FROM activity_events GROUP BY user_id
    ), progress AS (
      SELECT user_id,
        SUM(CASE WHEN lesson_completed_at IS NOT NULL THEN 1 ELSE 0 END) AS lessons_completed,
        SUM(CASE WHEN quiz_passed_at IS NOT NULL THEN 1 ELSE 0 END) AS quizzes_passed
      FROM learn_unit_progress WHERE course_version = ? GROUP BY user_id
    ), quizzes AS (
      SELECT user_id, COUNT(*) AS quiz_attempts, SUM(passed) AS quiz_passes, MAX(score) AS best_quiz_score
      FROM learn_quiz_attempts WHERE course_version = ? GROUP BY user_id
    ), assessments AS (
      SELECT user_id, COUNT(*) AS assessment_attempts, SUM(passed) AS assessment_passes, MAX(score) AS best_assessment_score
      FROM learn_assessment_attempts WHERE course_version = ? GROUP BY user_id
    ), builder_steps AS (
      SELECT user_id, COUNT(*) AS builder_steps_completed
      FROM learn_builder_steps WHERE course_version = ? GROUP BY user_id
    ), builder_proofs AS (
      SELECT user_id, SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) AS verified_builder_proofs
      FROM learn_builder_submissions WHERE course_version = ? GROUP BY user_id
    )
    SELECT u.id AS id, u.display_name AS displayName, u.email AS email, u.created_at AS joinedAt,
      COALESCE(activity.last_active_at, u.created_at) AS lastActiveAt,
      COALESCE(progress.lessons_completed, 0) AS lessonsCompleted,
      COALESCE(progress.quizzes_passed, 0) AS quizzesPassed,
      COALESCE(quizzes.quiz_attempts, 0) AS quizAttempts,
      COALESCE(quizzes.quiz_passes, 0) AS quizPasses,
      quizzes.best_quiz_score AS bestQuizScore,
      COALESCE(assessments.assessment_attempts, 0) AS assessmentAttempts,
      COALESCE(assessments.assessment_passes, 0) AS assessmentPasses,
      assessments.best_assessment_score AS bestAssessmentScore,
      COALESCE(builder_steps.builder_steps_completed, 0) AS builderStepsCompleted,
      COALESCE(builder_proofs.verified_builder_proofs, 0) AS verifiedBuilderProofs,
      (SELECT status FROM learn_credentials WHERE user_id = u.id AND credential_type = 'fundamentals' AND course_version = ? ORDER BY updated_at DESC LIMIT 1) AS fundamentalsCredentialStatus,
      (SELECT status FROM learn_credentials WHERE user_id = u.id AND credential_type = 'builder' AND course_version = ? ORDER BY updated_at DESC LIMIT 1) AS builderCredentialStatus
    FROM learn_users u
    LEFT JOIN activity ON activity.user_id = u.id
    LEFT JOIN progress ON progress.user_id = u.id
    LEFT JOIN quizzes ON quizzes.user_id = u.id
    LEFT JOIN assessments ON assessments.user_id = u.id
    LEFT JOIN builder_steps ON builder_steps.user_id = u.id
    LEFT JOIN builder_proofs ON builder_proofs.user_id = u.id
    ORDER BY COALESCE(activity.last_active_at, u.created_at) DESC, u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(
    COURSE_VERSION,
    COURSE_VERSION,
    COURSE_VERSION,
    BUILDER_COURSE_VERSION,
    BUILDER_COURSE_VERSION,
    COURSE_VERSION,
    BUILDER_COURSE_VERSION,
    limit,
    offset,
  ) as ParticipantRow[];

  const total = db.prepare("SELECT COUNT(*) FROM learn_users").pluck().get() as number;
  return {
    generatedAt: new Date().toISOString(),
    courseVersion: COURSE_VERSION,
    builderCourseVersion: BUILDER_COURSE_VERSION,
    total,
    limit,
    offset,
    participants,
  };
}
