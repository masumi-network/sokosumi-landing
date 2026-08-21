# Analytics & consent

How the Sokosumi marketing site measures its funnel, and how consent gates it.
The app (`app.sokosumi.com`) shares the same GTM container and GA4 property —
its half is documented in the Sokosumi web app repo (`apps/web/TRACKING.md`).

## The four layers

```
USER
  │
  ▼
🍪  Cookie banner            "May I use analytics / marketing cookies?"
  │   (self-built, no CMP)      assets/consent.js
  ▼
🏷️  Google Tag Manager       one container, GTM-N7GC8SFT
  │   (the dispatcher)         spans sokosumi.com AND app.sokosumi.com
  ▼
📊  GA4                       one property, G-G4BW0XC76M
  │   (store + analyse)        + Google Ads AW-16455471438
  ▼
Reports · funnels · user paths · conversions
```

**One container, one property, both domains.** This site and the app load the
*same* GTM container and feed the *same* GA4 property, so a visit that starts on
a landing page and ends as an active, paying user is a single journey in one
place. GA4 cross-domain measurement links `sokosumi.com` ↔ `app.sokosumi.com`.

## Where it lives (this repo)

The site is server-rendered by a zero-dependency Node server; there is no
framework. Two surfaces share the same analytics:

- **`templates/shell.js`** — every sub-page. `ANALYTICS_HEAD` (the Consent Mode
  default + the GTM loader) goes at the very top of `<head>`; the GTM
  `<noscript>` right after `<body>`; `consent.js` + `track.js` before `</body>`.
- **`index.html`** — the landing page has its own `<head>`, so the same snippet
  is inlined there. **Keep the two copies in sync.**
- **`assets/consent.js`** — the cookie banner + Consent Mode bridge.
- **`assets/track.js`** — turns `data-analytics` attributes into dataLayer events.

## Consent (Google Consent Mode v2, "Basic")

Nothing analytics- or ads-related leaves the browser until the visitor opts in.

- The inline `<head>` snippet sets every ad/analytics signal to `denied`
  **before** GTM loads, then re-applies any stored choice immediately.
- `assets/consent.js` draws the banner and, on a choice, writes the cookie and
  flips Consent Mode.
- The choice lives in one cookie, **`sokosumi_consent`**, scoped to
  `.sokosumi.com`, so consenting on either domain covers both. Shape:

  ```json
  { "necessary": true, "analytics": true, "marketing": false, "ts": 0, "v": 1 }
  ```

- Categories → Consent Mode signals:
  | Category   | Signals set to granted                                          |
  |------------|-----------------------------------------------------------------|
  | necessary  | always on (`functionality_storage`, `security_storage`)         |
  | analytics  | `analytics_storage`                                            |
  | marketing  | `ad_storage`, `ad_user_data`, `ad_personalization`            |

- The footer "Cookie settings" link (`data-cc-open`) reopens the preferences
  panel so consent can be changed anytime.

## Events

GA4 records `page_view` on every route by itself. `view_pricing` is derived in
GTM from the URL (`/pricing`) — also no code.

| Event | Fires when… | How |
|-------|-------------|-----|
| `sign_up_click` `{location}` | a "Sign Up" / "Get started" / "Try …" CTA is clicked | `data-analytics="sign_up_click"` (hero, nav, mobile nav, CTA band, use-case hero/mid, pricing plan, product/surface hero, coworker profile, task detail, CMS blocks, sales/support success) |
| `talk_to_sales_click` `{location}` | a "Talk to Sales" CTA is clicked | `data-analytics="talk_to_sales_click"` (hero, nav, mobile nav, use-case hero, pricing plan, CTA bands and CMS blocks that point at sales) |
| `generate_lead` `{form_name}` | a lead form is **accepted by the server** | `data-analytics-on="load"` on the success state — `sales_inquiry`, `support_request`, `agent_listing` |
| `consent_status` `{consent_analytics, consent_marketing}` | cookie choice made | `assets/consent.js` |

`generate_lead` fires on the server-rendered `?sent=1` state, not on the submit
click, so it counts submissions the server actually accepted. A click handler
would also count the ones that failed validation.

`sign_up_click` is the marketing-side *intent*; the actual account creation
fires `sign_up` in the app. Together they are the top of the funnel:

```
sign_up_click (here)  →  sign_up (app)  →  onboarding_complete  →  agent_hired  →  purchase
```

## Adding an event

Put `data-analytics="event_name"` on the element (plus optional
`data-analytics-*` attributes, which become event parameters), then add a
Custom Event trigger + GA4 Event tag in GTM. No code change beyond the
attribute.

Add `data-analytics-on="load"` to fire on page load instead of on click — for
outcomes rather than interactions. It fires once per element per page.

## Where it does NOT run

GTM only loads on `www.sokosumi.com` and `sokosumi.com` (`TRACK_HOSTS` in the
loader). Preview deployments and local dev used to feed the same GA4 property
as production — over one 7-day window the preview host sent 366 pageviews
against production's 156, plus `localhost` and `127.0.0.1` — which makes every
report wrong until someone remembers to filter. Consent Mode defaults still run
everywhere; only the container is withheld.

## Vercel Web Analytics

Every page also loads `/_vercel/insights/script.js` for Vercel Web Analytics.
As of 2026-08-21 that URL 404s on production, which means **Web Analytics is
not enabled on the Vercel project** (`masumi/sokosumi-landing`) — the script
tag is present but nothing collects. Enable it in the Vercel dashboard
(Project -> Analytics) or remove the tag; until then the 404 is the only
effect.

## The GTM container

The container (GTM-N7GC8SFT) is configured in the GTM UI. See the app repo's
`apps/web/TRACKING.md` for its contents (GA4 config with consent + cross-domain,
per-event GA4 tags, User-ID, Google Ads linker). Test with Tag Assistant before
publishing and confirm no tag fires before consent is granted.

## Consent gating — what fires when

Audited and corrected 2026-08-17 by reading the published container and by
watching the network in a clean headless browser. Container version 29.

Every tag that can fire on a page load is now withheld until the visitor
chooses:

| Tag | Requires |
|-----|----------|
| `GA4 - config` | `analytics_storage` |
| `Conversion Linker`, `GADS - config`, `GADS - remarketing` | `ad_storage` |
| `Linkedin - config`, `META - config` | `ad_storage` |

Conversion tags that fire on a user action already sit behind trigger groups
requiring `ce - consent_status`, and were left alone.

Measured on production, three runs each:

| Visitor | GA4 | Ads |
|---------|-----|-----|
| lands, never chooses | 0 | 0 |
| lands, still deciding | 0 | 0 |
| clicks Accept | fires on that page | fires on that page |
| next page | fires | fires |

### Why `consent_decision` exists

Consent Mode blocks a gated tag at `gtm.init` and GTM never retries it —
`wait_for_update` is 500ms and nobody reads a banner that fast. So the page a
visitor consents ON was never recorded: measured still zero 30 seconds after
clicking Accept, while the next navigation recorded fine. Every session lost its
landing pageview, and a visitor who landed, accepted and left was counted as
nothing at all.

The fix is a second trigger on the page-load tags. It cannot be
`ce - consent_status`, because the `<head>` snippet pushes `consent_status` on
every load that finds a stored cookie — triggering on that would fire the tags
twice for every returning visitor. `consent_decision` is pushed only from
`apply()` in `assets/consent.js`, which is only reachable from the three banner
buttons, so it means "the visitor just chose", exactly once.

Rejecting fires the event too; Consent Mode then keeps the tags from sending
anything, which is the point.

### Trade-off accepted

Gating the Google Ads tags gives up Google's cookieless conversion modelling for
unconsented visitors, so reported Ads conversions are lower than before
version 29. That is what putting ads behind the banner means, not a regression.
