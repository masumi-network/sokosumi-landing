import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export const COURSE_VERSION = "fundamentals-v1";
export const BUILDER_COURSE_VERSION = "builder-v1";

let learnDb: Database.Database | null = null;

export type LearnUser = {
  id: string;
  providerSubject: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type LearnProgress = {
  completedLessons: string[];
  passedQuizzes: string[];
  quizScores: Record<string, number>;
  quizAttempts: Array<{ unitSlug: string; score: number; passed: boolean; attemptedAt: string }>;
  assessmentAttempts: Array<{ id: string; score: number; passed: boolean; attemptedAt: string }>;
  assessmentScore?: number;
  completedAt?: string;
};

export type LearnCredentialStatus = "ready_to_mint" | "minting" | "minted" | "mint_failed" | "revoked" | "superseded";

export type LearnCredential = {
  id: string;
  credentialType: "fundamentals" | "builder";
  courseVersion: string;
  score: number;
  status: LearnCredentialStatus;
  issuedAt: string;
  revokedAt: string | null;
  txHash: string | null;
  assetId: string | null;
  metadataHash: string;
  mintError: string | null;
  supersededBy: string | null;
  network: string | null;
  explorerUrl: string | null;
  updatedAt: string;
};

export type BuilderSubmission = {
  id: string;
  transactionHash: string;
  agentIdentifier: string;
  status: "pending_review" | "verifying" | "verified" | "rejected" | "verification_error";
  verifierReference: string | null;
  reviewNote: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type BuilderProgress = {
  completedSteps: string[];
  submission: BuilderSubmission | null;
  assessmentAttempts: Array<{ id: string; score: number; passed: boolean; attemptedAt: string }>;
  assessmentScore?: number;
  credential: LearnCredential | null;
};

function ensureColumn(db: Database.Database, table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export function getLearnDb() {
  if (learnDb) return learnDb;
  const dbPath = process.env.MASUMI_LEARN_DB_PATH || path.join(process.cwd(), "data", "masumi-learn.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS learn_users (
      id TEXT PRIMARY KEY,
      provider_subject TEXT NOT NULL UNIQUE,
      display_name TEXT,
      email TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS learn_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      absolute_expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_learn_sessions_user ON learn_sessions(user_id);
    CREATE TABLE IF NOT EXISTS learn_oauth_states (
      state TEXT PRIMARY KEY,
      code_verifier TEXT NOT NULL,
      return_to TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS learn_unit_progress (
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      course_version TEXT NOT NULL,
      unit_slug TEXT NOT NULL,
      lesson_completed_at TEXT,
      quiz_best_score INTEGER,
      quiz_passed_at TEXT,
      quiz_attempts INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, course_version, unit_slug)
    );
    CREATE TABLE IF NOT EXISTS learn_assessment_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      course_version TEXT NOT NULL,
      score INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_learn_assessments_user ON learn_assessment_attempts(user_id, course_version);
    CREATE TABLE IF NOT EXISTS learn_quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      course_version TEXT NOT NULL,
      unit_slug TEXT NOT NULL,
      score INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_learn_quiz_attempts_user ON learn_quiz_attempts(user_id, course_version, created_at);
    CREATE TABLE IF NOT EXISTS learn_question_stats (
      course_version TEXT NOT NULL,
      context TEXT NOT NULL,
      question_id TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (course_version, context, question_id)
    );
    CREATE TABLE IF NOT EXISTS learn_credentials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      course_version TEXT NOT NULL,
      score INTEGER NOT NULL,
      status TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      revoked_at TEXT,
      tx_hash TEXT,
      asset_id TEXT,
      metadata_hash TEXT NOT NULL,
      mint_error TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, course_version)
    );
    CREATE TABLE IF NOT EXISTS learn_audit_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT NOT NULL,
      entity_id TEXT,
      detail_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS learn_rate_limits (
      key TEXT PRIMARY KEY,
      window_started_at INTEGER NOT NULL,
      count INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS learn_builder_steps (
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      course_version TEXT NOT NULL,
      step_key TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      PRIMARY KEY (user_id, course_version, step_key)
    );
    CREATE TABLE IF NOT EXISTS learn_builder_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      course_version TEXT NOT NULL,
      transaction_hash TEXT NOT NULL,
      agent_identifier TEXT NOT NULL,
      status TEXT NOT NULL,
      verifier_reference TEXT,
      review_note TEXT,
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, course_version, transaction_hash)
    );
    CREATE INDEX IF NOT EXISTS idx_learn_builder_submissions_status ON learn_builder_submissions(status, submitted_at);
    CREATE TABLE IF NOT EXISTS learn_builder_assessment_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES learn_users(id) ON DELETE CASCADE,
      course_version TEXT NOT NULL,
      score INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  ensureColumn(db, "learn_credentials", "credential_type", "TEXT NOT NULL DEFAULT 'fundamentals'");
  ensureColumn(db, "learn_credentials", "superseded_by", "TEXT");
  ensureColumn(db, "learn_credentials", "network", "TEXT");
  ensureColumn(db, "learn_credentials", "explorer_url", "TEXT");
  ensureColumn(db, "learn_sessions", "absolute_expires_at", "TEXT");
  const legacySessions = db.prepare("SELECT token_hash, created_at FROM learn_sessions WHERE absolute_expires_at IS NULL").all() as Array<{ token_hash: string; created_at: string }>;
  const migrateSession = db.prepare("UPDATE learn_sessions SET absolute_expires_at=? WHERE token_hash=?");
  for (const session of legacySessions) migrateSession.run(new Date(Date.parse(session.created_at) + 30 * 24 * 60 * 60_000).toISOString(), session.token_hash);
  learnDb = db;
  return db;
}

export function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const db = getLearnDb();
  const now = Math.floor(Date.now() / 1000);
  return db.transaction(() => {
    const row = db.prepare("SELECT window_started_at, count FROM learn_rate_limits WHERE key = ?").get(key) as { window_started_at: number; count: number } | undefined;
    if (!row || now - row.window_started_at >= windowSeconds) {
      db.prepare("INSERT INTO learn_rate_limits (key, window_started_at, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_started_at=excluded.window_started_at, count=1").run(key, now);
      return true;
    }
    if (row.count >= limit) return false;
    db.prepare("UPDATE learn_rate_limits SET count=count+1 WHERE key=?").run(key);
    return true;
  })();
}

export function upsertLearnUser(profile: { subject: string; displayName?: string | null; email?: string | null; avatarUrl?: string | null }) {
  const db = getLearnDb();
  const existing = db.prepare("SELECT id FROM learn_users WHERE provider_subject = ?").get(profile.subject) as { id: string } | undefined;
  const now = new Date().toISOString();
  const id = existing?.id ?? crypto.randomUUID();
  db.prepare(`INSERT INTO learn_users (id, provider_subject, display_name, email, avatar_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(provider_subject) DO UPDATE SET display_name=excluded.display_name, email=excluded.email, avatar_url=excluded.avatar_url, updated_at=excluded.updated_at`)
    .run(id, profile.subject, profile.displayName ?? null, profile.email ?? null, profile.avatarUrl ?? null, now, now);
  return getLearnUser(id)!;
}

export function getLearnUser(id: string): LearnUser | null {
  const row = getLearnDb().prepare("SELECT id, provider_subject, display_name, email, avatar_url FROM learn_users WHERE id = ?").get(id) as Record<string, string | null> | undefined;
  return row ? { id: row.id!, providerSubject: row.provider_subject!, displayName: row.display_name, email: row.email, avatarUrl: row.avatar_url } : null;
}

export function createSession(userId: string, tokenHash: string, expiresAt: string, absoluteExpiresAt: string) {
  getLearnDb().prepare("INSERT INTO learn_sessions (token_hash, user_id, expires_at, absolute_expires_at, created_at) VALUES (?, ?, ?, ?, ?)").run(tokenHash, userId, expiresAt, absoluteExpiresAt, new Date().toISOString());
}

export function getSessionUser(tokenHash: string) {
  const db = getLearnDb();
  const now = new Date().toISOString();
  db.prepare("DELETE FROM learn_sessions WHERE expires_at <= ? OR absolute_expires_at <= ?").run(now, now);
  const row = db.prepare("SELECT user_id FROM learn_sessions WHERE token_hash = ? AND expires_at > ? AND absolute_expires_at > ?").get(tokenHash, now, now) as { user_id: string } | undefined;
  return row ? getLearnUser(row.user_id) : null;
}

export function refreshSession(tokenHash: string, expiresAt: string) {
  const now = new Date().toISOString();
  const result = getLearnDb().prepare("UPDATE learn_sessions SET expires_at = MIN(?, absolute_expires_at) WHERE token_hash = ? AND expires_at > ? AND absolute_expires_at > ?")
    .run(expiresAt, tokenHash, now, now);
  return result.changes === 1;
}

export function deleteSession(tokenHash: string) { getLearnDb().prepare("DELETE FROM learn_sessions WHERE token_hash = ?").run(tokenHash); }

export function saveOAuthState(state: string, verifier: string, returnTo: string) {
  const expires = new Date(Date.now() + 10 * 60_000).toISOString();
  const db = getLearnDb();
  db.prepare("DELETE FROM learn_oauth_states WHERE expires_at <= ?").run(new Date().toISOString());
  db.prepare("INSERT INTO learn_oauth_states (state, code_verifier, return_to, expires_at) VALUES (?, ?, ?, ?)").run(state, verifier, returnTo, expires);
}

export function consumeOAuthState(state: string) {
  const db = getLearnDb();
  const row = db.prepare("SELECT code_verifier, return_to, expires_at FROM learn_oauth_states WHERE state = ?").get(state) as { code_verifier: string; return_to: string; expires_at: string } | undefined;
  db.prepare("DELETE FROM learn_oauth_states WHERE state = ?").run(state);
  return row && row.expires_at > new Date().toISOString() ? row : null;
}

export function audit(userId: string | null, eventType: string, entityId?: string, detail: Record<string, unknown> = {}) {
  getLearnDb().prepare("INSERT INTO learn_audit_events (id, user_id, event_type, entity_id, detail_json, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(crypto.randomUUID(), userId, eventType, entityId ?? null, JSON.stringify(detail), new Date().toISOString());
}

export function markLessonComplete(userId: string, unitSlug: string) {
  const now = new Date().toISOString();
  const result = getLearnDb().prepare(`INSERT INTO learn_unit_progress (user_id, course_version, unit_slug, lesson_completed_at, updated_at)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, course_version, unit_slug) DO UPDATE SET lesson_completed_at=excluded.lesson_completed_at, updated_at=excluded.updated_at
    WHERE learn_unit_progress.lesson_completed_at IS NULL`)
    .run(userId, COURSE_VERSION, unitSlug, now, now);
  if (result.changes) audit(userId, "lesson_completed", unitSlug);
}

export function recordQuizAttempt(userId: string, unitSlug: string, score: number, passed: boolean) {
  const now = new Date().toISOString();
  const attemptId = crypto.randomUUID();
  getLearnDb().transaction(() => {
    getLearnDb().prepare(`INSERT INTO learn_unit_progress (user_id, course_version, unit_slug, lesson_completed_at, quiz_best_score, quiz_passed_at, quiz_attempts, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?) ON CONFLICT(user_id, course_version, unit_slug) DO UPDATE SET
        quiz_best_score=MAX(COALESCE(quiz_best_score, 0), excluded.quiz_best_score),
        quiz_passed_at=CASE WHEN excluded.quiz_passed_at IS NOT NULL THEN COALESCE(quiz_passed_at, excluded.quiz_passed_at) ELSE quiz_passed_at END,
        quiz_attempts=quiz_attempts+1, lesson_completed_at=COALESCE(lesson_completed_at, excluded.lesson_completed_at), updated_at=excluded.updated_at`)
      .run(userId, COURSE_VERSION, unitSlug, now, score, passed ? now : null, now);
    getLearnDb().prepare("INSERT INTO learn_quiz_attempts (id, user_id, course_version, unit_slug, score, passed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(attemptId, userId, COURSE_VERSION, unitSlug, score, passed ? 1 : 0, now);
    audit(userId, "quiz_attempted", attemptId, { unitSlug, score, passed });
  })();
}

export function getProgress(userId: string): LearnProgress {
  const rows = getLearnDb().prepare("SELECT unit_slug, lesson_completed_at, quiz_best_score, quiz_passed_at FROM learn_unit_progress WHERE user_id = ? AND course_version = ?").all(userId, COURSE_VERSION) as { unit_slug: string; lesson_completed_at: string | null; quiz_best_score: number | null; quiz_passed_at: string | null }[];
  const assessment = getLearnDb().prepare("SELECT score, created_at FROM learn_assessment_attempts WHERE user_id = ? AND course_version = ? AND passed = 1 ORDER BY score DESC, created_at ASC LIMIT 1").get(userId, COURSE_VERSION) as { score: number; created_at: string } | undefined;
  const quizAttempts = getLearnDb().prepare("SELECT unit_slug, score, passed, created_at FROM learn_quiz_attempts WHERE user_id = ? AND course_version = ? ORDER BY created_at DESC LIMIT 50").all(userId, COURSE_VERSION) as Array<{ unit_slug: string; score: number; passed: number; created_at: string }>;
  const assessmentAttempts = getLearnDb().prepare("SELECT id, score, passed, created_at FROM learn_assessment_attempts WHERE user_id = ? AND course_version = ? ORDER BY created_at DESC LIMIT 20").all(userId, COURSE_VERSION) as Array<{ id: string; score: number; passed: number; created_at: string }>;
  return {
    completedLessons: rows.filter((r) => r.lesson_completed_at).map((r) => r.unit_slug),
    passedQuizzes: rows.filter((r) => r.quiz_passed_at).map((r) => r.unit_slug),
    quizScores: Object.fromEntries(rows.filter((r) => r.quiz_best_score != null).map((r) => [r.unit_slug, r.quiz_best_score!])),
    quizAttempts: quizAttempts.map((item) => ({ unitSlug: item.unit_slug, score: item.score, passed: Boolean(item.passed), attemptedAt: item.created_at })),
    assessmentAttempts: assessmentAttempts.map((item) => ({ id: item.id, score: item.score, passed: Boolean(item.passed), attemptedAt: item.created_at })),
    assessmentScore: assessment?.score,
    completedAt: assessment?.created_at,
  };
}

export function recordAssessment(userId: string, score: number, passed: boolean) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  getLearnDb().prepare("INSERT INTO learn_assessment_attempts (id, user_id, course_version, score, passed, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(id, userId, COURSE_VERSION, score, passed ? 1 : 0, now);
  audit(userId, "assessment_attempted", id, { score, passed });
  return { id, now };
}

export function recordQuestionOutcomes(context: string, outcomes: Array<{ questionId: string; correct: boolean }>, courseVersion = COURSE_VERSION) {
  const now = new Date().toISOString();
  const statement = getLearnDb().prepare(`INSERT INTO learn_question_stats (course_version, context, question_id, attempts, correct_count, updated_at)
    VALUES (?, ?, ?, 1, ?, ?) ON CONFLICT(course_version, context, question_id) DO UPDATE SET
      attempts=attempts+1, correct_count=correct_count+excluded.correct_count, updated_at=excluded.updated_at`);
  getLearnDb().transaction(() => {
    for (const outcome of outcomes) statement.run(courseVersion, context, outcome.questionId, outcome.correct ? 1 : 0, now);
  })();
}

export function getLearnAggregateReport(minQuestionAttempts = 5) {
  const db = getLearnDb();
  const learners = Number(db.prepare("SELECT COUNT(*) FROM learn_users WHERE provider_subject NOT LIKE 'deleted:%'").pluck().get());
  const activeLearners = Number(db.prepare("SELECT COUNT(DISTINCT user_id) FROM learn_unit_progress WHERE course_version=?").pluck().get(COURSE_VERSION));
  const completedLearners = Number(db.prepare("SELECT COUNT(DISTINCT user_id) FROM learn_assessment_attempts WHERE course_version=? AND passed=1").pluck().get(COURSE_VERSION));
  const quiz = db.prepare("SELECT COUNT(*) attempts, COALESCE(SUM(passed), 0) passes FROM learn_quiz_attempts WHERE course_version=?").get(COURSE_VERSION) as { attempts: number; passes: number };
  const assessment = db.prepare("SELECT COUNT(*) attempts, COALESCE(SUM(passed), 0) passes FROM learn_assessment_attempts WHERE course_version=?").get(COURSE_VERSION) as { attempts: number; passes: number };
  const builderActiveLearners = Number(db.prepare("SELECT COUNT(DISTINCT user_id) FROM learn_builder_steps WHERE course_version=?").pluck().get(BUILDER_COURSE_VERSION));
  const verifiedBuilderProofs = Number(db.prepare("SELECT COUNT(DISTINCT user_id) FROM learn_builder_submissions WHERE course_version=? AND status='verified'").pluck().get(BUILDER_COURSE_VERSION));
  const builderAssessment = db.prepare("SELECT COUNT(*) attempts, COALESCE(SUM(passed), 0) passes FROM learn_builder_assessment_attempts WHERE course_version=?").get(BUILDER_COURSE_VERSION) as { attempts: number; passes: number };
  const validFundamentalsCredentials = Number(db.prepare("SELECT COUNT(*) FROM learn_credentials WHERE credential_type='fundamentals' AND status NOT IN ('revoked', 'superseded')").pluck().get());
  const validBuilderCredentials = Number(db.prepare("SELECT COUNT(*) FROM learn_credentials WHERE credential_type='builder' AND status NOT IN ('revoked', 'superseded')").pluck().get());
  const proofTimingRows = db.prepare(`SELECT u.created_at accountCreatedAt, MIN(s.updated_at) verifiedAt
    FROM learn_users u JOIN learn_builder_submissions s ON s.user_id=u.id
    WHERE s.course_version=? AND s.status='verified' AND u.provider_subject NOT LIKE 'deleted:%'
    GROUP BY u.id`).all(BUILDER_COURSE_VERSION) as Array<{ accountCreatedAt: string; verifiedAt: string }>;
  const proofMinutes = proofTimingRows.map((row) => Math.max(0, Math.round((Date.parse(row.verifiedAt) - Date.parse(row.accountCreatedAt)) / 60_000))).sort((a, b) => a - b);
  const medianProofMinutes = proofMinutes.length % 2
    ? proofMinutes[Math.floor(proofMinutes.length / 2)]
    : proofMinutes.length ? Math.round((proofMinutes[proofMinutes.length / 2 - 1] + proofMinutes[proofMinutes.length / 2]) / 2) : null;
  const units = db.prepare(`SELECT unit_slug unitSlug, COUNT(DISTINCT CASE WHEN lesson_completed_at IS NOT NULL THEN user_id END) lessonCompletions,
    COUNT(DISTINCT CASE WHEN quiz_passed_at IS NOT NULL THEN user_id END) quizPassers, COALESCE(SUM(quiz_attempts), 0) quizAttempts
    FROM learn_unit_progress WHERE course_version=? GROUP BY unit_slug ORDER BY unit_slug`).all(COURSE_VERSION);
  const questions = db.prepare(`SELECT course_version courseVersion, context, question_id questionId, attempts, correct_count correctCount,
    attempts-correct_count incorrectCount, ROUND((attempts-correct_count)*100.0/attempts, 1) failureRate
    FROM learn_question_stats WHERE course_version IN (?, ?) AND attempts>=? ORDER BY course_version, failureRate DESC, attempts DESC, question_id`).all(COURSE_VERSION, BUILDER_COURSE_VERSION, minQuestionAttempts);
  const credentials = db.prepare("SELECT credential_type credentialType, status, COUNT(*) count FROM learn_credentials GROUP BY credential_type, status ORDER BY credential_type, status").all();
  return {
    generatedAt: new Date().toISOString(),
    courseVersion: COURSE_VERSION,
    privacy: { aggregateOnly: true, minimumQuestionAttempts: minQuestionAttempts, minimumTimingCohort: minQuestionAttempts },
    funnel: {
      learners,
      activeLearners,
      completedLearners,
      completionRate: activeLearners ? Math.round(completedLearners / activeLearners * 1000) / 10 : 0,
      quizAttempts: quiz.attempts,
      quizPasses: quiz.passes,
      assessmentAttempts: assessment.attempts,
      assessmentPasses: assessment.passes,
      builderActiveLearners,
      verifiedBuilderProofs,
      builderAssessmentAttempts: builderAssessment.attempts,
      builderAssessmentPasses: builderAssessment.passes,
      validFundamentalsCredentials,
      validBuilderCredentials,
      fundamentalsToBuilderConversionRate: validFundamentalsCredentials ? Math.round(validBuilderCredentials / validFundamentalsCredentials * 1000) / 10 : 0,
      timeToFirstVerifiedPreprodProof: {
        definition: "account_created_to_first_verified_proof_minutes",
        cohortSize: proofMinutes.length,
        medianMinutes: proofMinutes.length >= minQuestionAttempts ? medianProofMinutes : null,
        suppressed: proofMinutes.length < minQuestionAttempts,
      },
    },
    units,
    questions,
    credentials,
  };
}

export function getCredentialForUser(userId: string, courseVersion = COURSE_VERSION): LearnCredential | null {
  const row = getLearnDb().prepare("SELECT * FROM learn_credentials WHERE user_id = ? AND course_version = ?").get(userId, courseVersion) as Record<string, string | number | null> | undefined;
  return row ? mapCredential(row) : null;
}

export function getCredentialsForUser(userId: string): LearnCredential[] {
  const rows = getLearnDb().prepare("SELECT * FROM learn_credentials WHERE user_id = ? ORDER BY issued_at DESC").all(userId) as Array<Record<string, string | number | null>>;
  return rows.map(mapCredential);
}

export function getCredentialForUserById(userId: string, credentialId: string): LearnCredential | null {
  const row = getLearnDb().prepare("SELECT * FROM learn_credentials WHERE user_id = ? AND id = ?").get(userId, credentialId) as Record<string, string | number | null> | undefined;
  return row ? mapCredential(row) : null;
}

export function getCredential(id: string): LearnCredential | null {
  const row = getLearnDb().prepare("SELECT * FROM learn_credentials WHERE id = ?").get(id) as Record<string, string | number | null> | undefined;
  return row ? mapCredential(row) : null;
}

function mapCredential(row: Record<string, string | number | null>): LearnCredential {
  return { id: String(row.id), credentialType: String(row.credential_type || "fundamentals") as LearnCredential["credentialType"], courseVersion: String(row.course_version), score: Number(row.score), status: String(row.status) as LearnCredentialStatus, issuedAt: String(row.issued_at), revokedAt: row.revoked_at as string | null, txHash: row.tx_hash as string | null, assetId: row.asset_id as string | null, metadataHash: String(row.metadata_hash), mintError: row.mint_error as string | null, supersededBy: row.superseded_by as string | null, network: row.network as string | null, explorerUrl: row.explorer_url as string | null, updatedAt: String(row.updated_at) };
}

export function createCredential(input: { userId: string; score: number; metadataHash: string; credentialId?: string; courseVersion?: string; credentialType?: LearnCredential["credentialType"] }) {
  const courseVersion = input.courseVersion ?? COURSE_VERSION;
  const credentialType = input.credentialType ?? "fundamentals";
  const existing = getCredentialForUser(input.userId, courseVersion);
  if (existing) return existing;
  const id = input.credentialId ?? crypto.randomUUID();
  const now = new Date().toISOString();
  getLearnDb().transaction(() => {
    const inserted = getLearnDb().prepare("INSERT INTO learn_credentials (id, user_id, credential_type, course_version, score, status, issued_at, metadata_hash, updated_at) VALUES (?, ?, ?, ?, ?, 'ready_to_mint', ?, ?, ?) ON CONFLICT(user_id, course_version) DO NOTHING")
      .run(id, input.userId, credentialType, courseVersion, input.score, now, input.metadataHash, now);
    if (inserted.changes) {
      getLearnDb().prepare("UPDATE learn_credentials SET status='superseded', superseded_by=?, updated_at=? WHERE user_id=? AND credential_type=? AND course_version<>? AND status NOT IN ('revoked', 'superseded')")
        .run(id, now, input.userId, credentialType, courseVersion);
      audit(input.userId, "credential_issued", id, { credentialType, courseVersion, score: input.score });
    }
  })();
  return getCredentialForUser(input.userId, courseVersion)!;
}

export function updateCredentialMint(id: string, status: LearnCredentialStatus, values: { txHash?: string; assetId?: string; error?: string; network?: string; explorerUrl?: string } = {}) {
  getLearnDb().prepare("UPDATE learn_credentials SET status=?, tx_hash=COALESCE(?, tx_hash), asset_id=COALESCE(?, asset_id), mint_error=?, network=COALESCE(?, network), explorer_url=COALESCE(?, explorer_url), updated_at=? WHERE id=?")
    .run(status, values.txHash ?? null, values.assetId ?? null, values.error ?? null, values.network ?? null, values.explorerUrl ?? null, new Date().toISOString(), id);
  audit(null, `credential_${status}`, id, values);
  return getCredential(id);
}

export function revokeCredential(id: string, reason: string, invalidateOwnerSessions = false, cascadeDependentCredentials = true) {
  const db = getLearnDb();
  return db.transaction(() => {
    const row = db.prepare("SELECT user_id, credential_type FROM learn_credentials WHERE id=?").get(id) as { user_id: string; credential_type: LearnCredential["credentialType"] } | undefined;
    if (!row) return null;
    const now = new Date().toISOString();
    db.prepare("UPDATE learn_credentials SET status='revoked', revoked_at=COALESCE(revoked_at, ?), updated_at=? WHERE id=?").run(now, now, id);
    const cascadedCredentials: string[] = [];
    if (cascadeDependentCredentials && row.credential_type === "fundamentals") {
      const dependents = db.prepare("SELECT id FROM learn_credentials WHERE user_id=? AND credential_type='builder' AND status NOT IN ('revoked', 'superseded')").all(row.user_id) as Array<{ id: string }>;
      for (const dependent of dependents) {
        db.prepare("UPDATE learn_credentials SET status='revoked', revoked_at=COALESCE(revoked_at, ?), updated_at=? WHERE id=?").run(now, now, dependent.id);
        audit(row.user_id, "credential_revoked", dependent.id, { reason: "fundamentals_prerequisite_revoked", sourceCredentialId: id });
        cascadedCredentials.push(dependent.id);
      }
    }
    if (invalidateOwnerSessions) db.prepare("DELETE FROM learn_sessions WHERE user_id=?").run(row.user_id);
    audit(row.user_id, "credential_revoked", id, { reason, sessionsInvalidated: invalidateOwnerSessions, cascadedCredentials: cascadedCredentials.length });
    return { credential: getCredential(id)!, cascadedCredentials };
  })();
}

export function invalidateCredentialOwnerSessions(id: string, reason: string) {
  const db = getLearnDb();
  return db.transaction(() => {
    const row = db.prepare("SELECT user_id FROM learn_credentials WHERE id=?").get(id) as { user_id: string } | undefined;
    if (!row) return null;
    const result = db.prepare("DELETE FROM learn_sessions WHERE user_id=?").run(row.user_id);
    audit(row.user_id, "sessions_invalidated", id, { reason, count: result.changes });
    return { invalidated: result.changes };
  })();
}

export function exportLearnAccount(userId: string) {
  return { exportedAt: new Date().toISOString(), user: getLearnUser(userId), courseVersion: COURSE_VERSION, progress: getProgress(userId), credential: getCredentialForUser(userId), credentials: getCredentialsForUser(userId), builder: getBuilderProgress(userId) };
}

function mapBuilderSubmission(row: Record<string, string | null>): BuilderSubmission {
  return { id: row.id!, transactionHash: row.transaction_hash!, agentIdentifier: row.agent_identifier!, status: row.status as BuilderSubmission["status"], verifierReference: row.verifier_reference, reviewNote: row.review_note, submittedAt: row.submitted_at!, updatedAt: row.updated_at! };
}

export function getBuilderProgress(userId: string): BuilderProgress {
  const completedSteps = getLearnDb().prepare("SELECT step_key FROM learn_builder_steps WHERE user_id=? AND course_version=? ORDER BY completed_at").all(userId, BUILDER_COURSE_VERSION) as Array<{ step_key: string }>;
  const submissionRow = getLearnDb().prepare("SELECT * FROM learn_builder_submissions WHERE user_id=? AND course_version=? ORDER BY CASE WHEN status='verified' THEN 0 ELSE 1 END, submitted_at DESC LIMIT 1").get(userId, BUILDER_COURSE_VERSION) as Record<string, string | null> | undefined;
  const attempts = getLearnDb().prepare("SELECT id, score, passed, created_at FROM learn_builder_assessment_attempts WHERE user_id=? AND course_version=? ORDER BY created_at DESC LIMIT 20").all(userId, BUILDER_COURSE_VERSION) as Array<{ id: string; score: number; passed: number; created_at: string }>;
  const passed = attempts.filter((attempt) => attempt.passed).sort((a, b) => b.score - a.score)[0];
  return { completedSteps: completedSteps.map(({ step_key }) => step_key), submission: submissionRow ? mapBuilderSubmission(submissionRow) : null, assessmentAttempts: attempts.map((attempt) => ({ id: attempt.id, score: attempt.score, passed: Boolean(attempt.passed), attemptedAt: attempt.created_at })), assessmentScore: passed?.score, credential: getCredentialForUser(userId, BUILDER_COURSE_VERSION) };
}

export function markBuilderStep(userId: string, stepKey: string) {
  const now = new Date().toISOString();
  const result = getLearnDb().prepare("INSERT INTO learn_builder_steps (user_id, course_version, step_key, completed_at) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING").run(userId, BUILDER_COURSE_VERSION, stepKey, now);
  if (result.changes) audit(userId, "builder_step_completed", stepKey);
  return getBuilderProgress(userId);
}

export function createBuilderSubmission(userId: string, transactionHash: string, agentIdentifier: string) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  getLearnDb().prepare(`INSERT INTO learn_builder_submissions (id, user_id, course_version, transaction_hash, agent_identifier, status, submitted_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'pending_review', ?, ?) ON CONFLICT(user_id, course_version, transaction_hash) DO NOTHING`)
    .run(id, userId, BUILDER_COURSE_VERSION, transactionHash, agentIdentifier, now, now);
  const row = getLearnDb().prepare("SELECT * FROM learn_builder_submissions WHERE user_id=? AND course_version=? AND transaction_hash=?").get(userId, BUILDER_COURSE_VERSION, transactionHash) as Record<string, string | null>;
  const submission = mapBuilderSubmission(row);
  audit(userId, "builder_proof_submitted", submission.id);
  return submission;
}

export function getBuilderSubmission(id: string): (BuilderSubmission & { userId: string }) | null {
  const row = getLearnDb().prepare("SELECT * FROM learn_builder_submissions WHERE id=?").get(id) as (Record<string, string | null> & { user_id: string }) | undefined;
  return row ? { ...mapBuilderSubmission(row), userId: row.user_id } : null;
}

export function listBuilderSubmissions(status = "pending_review") {
  const rows = getLearnDb().prepare("SELECT * FROM learn_builder_submissions WHERE status=? ORDER BY submitted_at LIMIT 100").all(status) as Array<Record<string, string | null>>;
  return rows.map(mapBuilderSubmission);
}

export function updateBuilderSubmission(id: string, status: BuilderSubmission["status"], values: { reference?: string; note?: string } = {}) {
  const now = new Date().toISOString();
  getLearnDb().prepare("UPDATE learn_builder_submissions SET status=?, verifier_reference=COALESCE(?, verifier_reference), review_note=COALESCE(?, review_note), updated_at=? WHERE id=?")
    .run(status, values.reference ?? null, values.note ?? null, now, id);
  const submission = getBuilderSubmission(id);
  audit(submission?.userId ?? null, `builder_proof_${status}`, id, values);
  return submission;
}

export function recordBuilderAssessment(userId: string, score: number, passed: boolean) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  getLearnDb().prepare("INSERT INTO learn_builder_assessment_attempts (id, user_id, course_version, score, passed, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, userId, BUILDER_COURSE_VERSION, score, passed ? 1 : 0, now);
  audit(userId, "builder_assessment_attempted", id, { score, passed });
  return { id, now };
}

export function deleteLearnAccount(userId: string) {
  const db = getLearnDb();
  const now = new Date().toISOString();
  db.transaction(() => {
    const credentials = getCredentialsForUser(userId);
    db.prepare("UPDATE learn_credentials SET status='revoked', revoked_at=COALESCE(revoked_at, ?), updated_at=? WHERE user_id=?").run(now, now, userId);
    for (const credential of credentials) {
      if (credential.status !== "revoked") audit(userId, "credential_revoked", credential.id, { reason: "account_deleted" });
    }
    db.prepare("DELETE FROM learn_sessions WHERE user_id=?").run(userId);
    db.prepare("DELETE FROM learn_unit_progress WHERE user_id=?").run(userId);
    db.prepare("DELETE FROM learn_assessment_attempts WHERE user_id=?").run(userId);
    db.prepare("DELETE FROM learn_quiz_attempts WHERE user_id=?").run(userId);
    db.prepare("DELETE FROM learn_builder_steps WHERE user_id=?").run(userId);
    db.prepare("DELETE FROM learn_builder_submissions WHERE user_id=?").run(userId);
    db.prepare("DELETE FROM learn_builder_assessment_attempts WHERE user_id=?").run(userId);
    db.prepare("UPDATE learn_users SET provider_subject=?, display_name=NULL, email=NULL, avatar_url=NULL, updated_at=? WHERE id=?").run(`deleted:${userId}`, now, userId);
    audit(userId, "account_deleted");
  })();
}
