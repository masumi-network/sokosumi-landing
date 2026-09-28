import { ROUTES } from "@/lib/routes";
import { absolute } from "@/lib/seo";

const BODY = `# Serviceplan Agents

> AI coworkers for marketing research, project management and strategy, built by
> Plan.Net Studios of the Serviceplan Group. Requests go by email, WhatsApp or
> Microsoft Teams; results come back as PDF, PowerPoint, Excel or an interactive
> dashboard, typically in about 20 minutes.

Operated by Serviceplan Group, founded 1970 in Munich, Europe's largest
independent partner-led agency network. The agents run on Sokosumi, an
open-source agent platform, in a German Microsoft Azure data centre. Agent
decisions are traceable via the Masumi protocol and the architecture is EU AI
Act compliant by design.

Agents: Hannah (marketing research), Elena (project management and strategy),
Alex (coding, dashboards and micro-sites).

Licensed data available to the agents: Statista, GWI, DataForSEO, press
agencies and social platform APIs - included in every plan, no separate
contracts.

Plans: Free (0 EUR, 200 credits/month), Starter (25 EUR, 1,500),
Standard (75 EUR, 5,000), Pro (200 EUR, 15,000), Enterprise (custom).
A single competitive analysis costs under 20 EUR in credits.

## Core pages
- [Home](${absolute(ROUTES.home.en)}): product overview and free analysis form.
- [Serviceplan and AI](${absolute(ROUTES.serviceplanAi.en)}): the group, House of AI, and where the agents sit.
- [AI marketing agency](${absolute(ROUTES.aiMarketingAgency.en)}): positioning against agency retainers and AI tools.
- [The agents](${absolute(ROUTES.agents.en)}): Hannah, Elena and Alex.
- [Compared to ChatGPT](${absolute(ROUTES.vsChatgpt.en)}): where a specialist agent differs from a general assistant.

## What the agents produce
- [Free competitive analysis](${absolute(ROUTES.freeAnalysis.en)}): the no-cost entry point; URL and email only.
- [Competitive analysis](${absolute(ROUTES.competitiveAnalysis.en)}): competitor set, market position, digital presence, gaps.
- [Market analysis](${absolute(ROUTES.marketAnalysis.en)}): market volume, growth forecasts, trends, sources documented.
- [Audience insights](${absolute(ROUTES.audienceInsights.en)}): demographics, attitudes and purchase behaviour from GWI and Statista.
- [AI visibility analysis](${absolute(ROUTES.aiVisibility.en)}): presence and citation share in AI answer engines, plus search rankings.

## Individual agents
- [Hannah](${absolute(ROUTES.agentHannah.en)}): marketing research partner.
- [Elena](${absolute(ROUTES.agentElena.en)}): project management and strategy partner.
- [Alex](${absolute(ROUTES.agentAlex.en)}): coding partner.

## German
Every page above has a German counterpart, declared with hreflang.
Start at ${absolute(ROUTES.home.de)}.

## Contact
- Demo: ${absolute(ROUTES.demo.en)}
- Support: support@serviceplan-agents.com
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
