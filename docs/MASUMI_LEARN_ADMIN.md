# Masumi Learn admin analytics

The Masumi Learn analytics dashboard at `/learn/admin` is private to explicitly approved internal operators. It displays aggregate course and funnel metrics only. It must not expose learner rows, names, email addresses, OAuth subjects, raw answers, individual timelines, or privileged credentials.

## Access model

Operators sign in through the existing Sokosumi-linked Learn session. Authorization is performed on the server against `MASUMI_LEARN_DASHBOARD_ALLOWLIST`; client code and request headers cannot grant access.

The allowlist accepts comma- or newline-separated, prefix-qualified identities:

- `subject:<stable Sokosumi subject>` for the subject returned by Sokosumi OAuth.
- `user:<internal Learn UUID>` for the corresponding internal `learn_users.id` value.

Use stable subjects for normal operator access. Internal Learn UUID entries are intended for controlled recovery or migration cases. Never allowlist an email address, display name, username, domain, or partial subject. Matching is exact. An unset or blank allowlist denies everyone, and a malformed entry makes the complete allowlist fail closed.

The dashboard session is separate from the server-to-server `MASUMI_LEARN_REPORT_TOKEN`. That token remains a Railway secret and is never sent to the page, browser JavaScript, dashboard API, logs, or audit records. Do not put either secret in a `NEXT_PUBLIC_` variable.

## Add or remove an operator

The deployment owner and the Learn privacy/security owner must approve access changes. Record the approval in the relevant internal change record without copying OAuth subjects into public issues or chat.

1. Obtain the operator's stable Sokosumi subject from an approved server-side source, or obtain their internal Learn UUID from the protected Learn database.
2. Read the current `MASUMI_LEARN_DASHBOARD_ALLOWLIST` Railway secret for the production Masumi service.
3. Add or remove one complete prefix-qualified entry. Preserve every other approved entry and ensure there are no empty or malformed entries.
4. Update the Railway secret without printing its value in terminal history, logs, screenshots, or tickets.
5. Redeploy the Masumi service. Access changes are read from the server environment and are not complete until the new deployment is active.
6. Run the access smoke test below with an approved operator and, when removing access, the removed operator.
7. Record who approved, applied, and verified the change, plus the deployment identifier and timestamp. Do not record the allowlist value itself.

For urgent removal, update the secret and redeploy immediately, then invalidate the operator's Learn sessions through the established incident process if account compromise is suspected.

## Access auditing

Each successful dashboard report request writes an `admin_dashboard_access` event to `learn_audit_events`. Its `user_id` is the internal Learn UUID of the operator. Event detail is limited to the dashboard surface and normalized date/course-version filters; it must not contain an OAuth subject, email, token, report payload, learner data, or allowlist contents.

The Learn privacy/security owner owns monthly review of these events and investigation of unexpected access. The deployment owner retains the access-change record and ensures former operators are removed promptly. Retention and incident handling follow the same controls as other Learn security audit data.

## Privacy and cohort suppression

Dashboard data remains aggregate-only. `MASUMI_LEARN_REPORT_MIN_COHORT` controls suppression of question-level and timing metrics. Operators must not lower it to identify or infer the activity of a small group. A suppressed value must remain hidden rather than being reconstructed from adjacent totals or multiple filter queries.

Course views and quickstart/publishing handoffs are copied into `learn_analytics_daily` only after the visitor has accepted analytics. The browser sends an allowlisted event name without a Learn session cookie; the server stores only day, course version, event name, count, and update time. It never stores an IP address, session ID, user ID, URL, referrer, or event parameters in this table. Declined or undecided visitors continue to follow the existing Google Consent Mode behavior and do not contribute to these first-party totals.

Version filters are populated from versions actually present in the Learn database, plus the current application versions. Historical versions remain selectable even after a new release; unknown versions are rejected rather than silently returning misleading zeros.

Access to this internal dashboard does not authorize collection or display of learner-level analytics.

## Production smoke test

Run this after deployment and after every allowlist change:

1. In a signed-out browser, request `/learn/admin` and `/api/learn/dashboard/report`; verify both expose no dashboard data.
2. Sign in with a valid but non-allowlisted test account and repeat the requests; verify the denial is indistinguishable from the signed-out response and does not reveal allowlist membership.
3. Sign in with an approved operator account. Verify `/learn/admin` loads and the report request succeeds using the Learn session cookie only.
4. Exercise valid date and course-version filters, an empty range, and an insufficient-cohort range. Confirm suppressed values remain hidden.
5. Check desktop and mobile layouts, keyboard-only filter operation, visible focus, loading, stale-data, empty, and error/retry states.
6. Inspect browser network requests, page source, response headers, and loaded JavaScript. Confirm no Authorization bearer value, report token, allowlist value, OAuth subject, learner name, or learner email is present.
7. Confirm exactly one matching `admin_dashboard_access` audit event exists for a deliberate report request, uses the operator's internal Learn UUID, and contains only the expected filter metadata.
8. Record the production deployment identifier, test time, approved verifier, and pass/fail result in the private operational record. Never paste session cookies, secrets, OAuth subjects, report contents, or learner data into the record.
