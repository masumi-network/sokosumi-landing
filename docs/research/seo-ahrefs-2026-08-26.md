# Sokosumi organic-search audit — 26 August 2026

## Executive summary

Sokosumi has enough authority to rank, but almost no current organic footprint. Ahrefs reports Domain Rating 33 and 321 live referring domains, yet only one organic keyword and no estimated organic traffic. The gap is therefore relevance, indexable depth and search-intent coverage more than raw domain authority.

The strongest near-term topics are:

1. AI agents for marketing
2. AI marketing agency selection
3. best AI marketing tools
4. AI search visibility, GEO and LLMO
5. practical guides for tools marketers already use
6. Serviceplan Group's AI products, organization and cases

Branded Serviceplan queries have much lower recorded volume than the generic clusters. They remain useful for entity authority, partner discovery and answer-engine citations, but should support rather than replace the generic acquisition pages.

## Ahrefs baseline

| Measure | Result |
| --- | ---: |
| Domain Rating | 33 |
| Ahrefs rank | 2,867,946 |
| Live backlinks | 1,049 |
| Live referring domains | 321 |
| All-time referring domains | 430 |
| Organic keywords | 1 |
| Estimated organic traffic | 0 |
| Paid keywords | 4 |
| AI-response citations found | 3 |

The only organic keyword found was `instagram analyzer`, ranking at position 10 in Pakistan with reported volume 250. It pointed at the legacy `/ai-agents/instagram-page-analysis` URL. That URL already redirects in one hop to the current coworker profile.

Backlink review found real high-authority references from GitHub, Product Hunt, Handelsblatt, GWI, Cardano Foundation, House of Communication and Masumi. It also found obvious low-quality domains. No disavow action is recommended from a third-party link index alone.

One live backlink pointed to `/docs`, which returned 404. It is now redirected to the active Sokosumi API documentation.

## Keyword opportunities

### United States

| Query | Volume | KD | Traffic potential | Decision |
| --- | ---: | ---: | ---: | --- |
| ai marketing agency | 3,400 | 39 | 2,700 | Publish buyer guide and connect it to Serviceplan evidence |
| ai marketing automation | 2,800 | 60 | — | Support with workflow guides; avoid a generic thin page |
| ai search visibility | 1,400 | 59 | 900 | Build sourced GEO/AI-search authority page |
| best ai marketing tools | 1,100 | 39 | 9,500 | Publish a maintained, transparent buyer comparison |
| marketing ai tools | 1,000 | 55 | 8,100 | Same comparison cluster |
| ai agents for marketing | 1,000 | 14 | — | Make the coworker roster the category hub |
| artificial intelligence marketing agency | 350 | 53 | — | Covered by buyer guide |
| ai marketing agents | 250 | 19 | — | Covered by roster and use cases |
| agentic ai marketing | 250 | n/a | — | Cover through Serviceplan and product explainers |
| ai coworker | 200 | 12 | — | Strengthen category definitions and profiles |

Matching-term research also found `generative engine optimization agency` at volume 1,200 and KD 17, plus multiple AI-search tracking and visibility queries between 900 and 2,100 searches.

### Germany

| Query | Volume | KD | Decision |
| --- | ---: | ---: | --- |
| geo agentur | 1,700 | 0 | Target carefully with GEO/LLMO context because the phrase is ambiguous |
| ki marketing | 800 | 57 | Build authority through the broader guide cluster |
| ki marketing agentur | 400 | — | German version of the agency buyer guide |
| sokosumi | 200 | — | Protect branded result quality |
| ai marketing agentur | 150 | — | German buyer guide |
| ki agentur deutschland | 150 | — | Buyer-guide secondary term |
| ki agentur münchen | 150 | — | Relevant to the Serviceplan/Plan.Net entity cluster |
| marketing ai tools | 150 | — | German tools comparison |
| serviceplan ai | 10 | — | Low volume, high entity relevance |

Matching terms added `ki im Marketing` at volume 1,000, `ki im Marketing Beispiele` at 150 with traffic potential 700, and long-tail demand around KI marketing consulting, solutions and agents.

## Technical crawl

The full production crawl covered 478 HTML documents and 480 requests before this implementation pass:

| Severity | Count |
| --- | ---: |
| High | 0 |
| Medium | 567 |
| Low | 156 |

The high medium-count was mostly repeated page-level instances rather than 567 distinct defects:

- 484 broken-external-link instances came from the same LinkedIn company URL. The URL was removed because no verifiable Sokosumi company page could be found.
- 60 duplicate-title instances were led by canonical pricing query variants and untranslated German metadata. Query variants are intentionally canonical; localized titles were fixed in templates.
- 45 titles were wider than the crawler's display threshold. Repeated template suffixes were shortened while keeping the query phrase.
- 12 duplicate descriptions and four duplicate-content warnings were pricing query variants. Their canonicals are intentional.
- Ten incomplete hreflang warnings were non-canonical pricing query variants. Canonical locale pages retain complete clusters.
- Seven noindex/canonical warnings were intentionally non-indexable German shells for English-only legal documents.
- 82 oversized-image candidates were Vercel-optimized responsive screenshots whose intrinsic width metadata exceeds 2,000 pixels. The delivered candidates are resized; changing accurate intrinsic dimensions would be counterproductive.
- Two redirects were intentional legacy migrations.

The sitemap health pass covered all 433 production sitemap URLs at the time, with all returning 200 and no sitemap-health issues. The expanded local sitemap contains the new guide and Serviceplan pages.

Search Console and Google Analytics data were unavailable because this environment has no Google authentication. The audit therefore does not claim click, impression or conversion findings from those systems.

## Changes made from the audit

- Published 14 bilingual tool workflow guides plus a bilingual 16-tool AI marketing comparison.
- Published and expanded a 14-page bilingual Serviceplan/AI authority section with primary-source citations.
- Added buyer-intent pages for AI marketing agencies, AI marketing cases, Mediaplus AI products, Generate.AI/MAKELINE and AI search/GEO.
- Rewrote five Plan.Net coworker summaries so the roster explains each coworker's actual job without truncating mid-sentence.
- Added restored 1,024-pixel portraits for Jamal and Maya through CMS image overrides.
- Expanded the Instagram analyzer destination with a precise title, description and limitations while preserving the ranked legacy redirect.
- Restored the broken `/docs` backlink target with a permanent redirect to the active API documentation.
- Removed an unverifiable LinkedIn organization URL from visible links and Organization structured data.
- Shortened repeated title templates and localized German index-page, product-surface and vendor metadata.

## Measurement loop

After deployment:

1. Re-crawl the production site and compare issue counts.
2. Submit or refresh the sitemap in Search Console when access is available.
3. Track the new page groups separately: tools, guides, Serviceplan/AI and coworker profiles.
4. Review Ahrefs monthly for new ranking keywords, page-level movement and earned referring domains.
5. Refresh prices and product capabilities in the tools guide at least quarterly.
6. Add original case evidence, screenshots and measured outcomes where Serviceplan or customers can approve them.

## Method and limitations

Ahrefs API v3 was queried for site metrics, organic keywords, top pages, competitors, backlink statistics, referring domains, broken backlinks, AI responses, keyword overviews and matching terms. Approximately 9,845 API units were used. Ahrefs' API uses per-request unit pricing, enforces a 60-request-per-minute limit and does not refund units for completed requests. See the [Ahrefs API introduction](https://docs.ahrefs.com/en/api/docs/introduction) and [OpenAPI specification](https://docs.ahrefs.com/openapi.json).

Keyword volume, difficulty, traffic potential and backlink classifications are third-party estimates, not guarantees. Ranking decisions should be revisited with Search Console query and conversion data once access is available.
