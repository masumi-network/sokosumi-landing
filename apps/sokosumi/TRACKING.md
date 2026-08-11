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
GTM from the URL (`/pricing`) — also no code. The only interaction this site
instruments is the signup CTA:

| Event           | Fires when…                          | How |
|-----------------|--------------------------------------|-----|
| `sign_up_click` `{location, plan?}` | a "Sign Up" CTA is clicked | `data-analytics="sign_up_click"` on the button (hero, nav, mobile nav, pricing plans, CTA band) |
| `consent_status` `{consent_analytics, consent_marketing}` | cookie choice made | `assets/consent.js` |

`sign_up_click` is the marketing-side *intent*; the actual account creation
fires `sign_up` in the app. Together they are the top of the funnel:

```
sign_up_click (here)  →  sign_up (app)  →  onboarding_complete  →  agent_hired  →  purchase
```

To add an interaction event, put `data-analytics="event_name"` on the element
(plus optional `data-analytics-*` params), then add a Custom Event trigger +
GA4 Event tag in GTM. No code change beyond the attribute.

## The GTM container

The container (GTM-N7GC8SFT) is configured in the GTM UI. See the app repo's
`apps/web/TRACKING.md` for its contents (GA4 config with consent + cross-domain,
per-event GA4 tags, User-ID, Google Ads linker). Test with Tag Assistant before
publishing and confirm no tag fires before consent is granted.
