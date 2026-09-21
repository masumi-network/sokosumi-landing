import type { RouteKey } from "@/lib/routes";

export type Section =
  | { type: "prose"; heading: string; body: string[] }
  | {
      type: "cards";
      heading: string;
      intro?: string;
      items: readonly { title: string; text: string }[];
    }
  | {
      type: "steps";
      heading: string;
      intro?: string;
      items: readonly { title: string; text: string }[];
    }
  | {
      type: "spec";
      heading: string;
      intro?: string;
      rows: readonly { label: string; value: string }[];
    }
  | {
      type: "faq";
      heading: string;
      items: readonly { question: string; answer: string }[];
    }
  | { type: "quote"; text: string; attribution: string }
  | {
      type: "links";
      heading: string;
      intro?: string;
      items: readonly { route: RouteKey; label: string; text: string }[];
    };

export type LandingContent = {
  /** <title>; keep the distinctive words first. */
  title: string;
  description: string;
  eyebrow?: string;
  h1: string;
  lede: string;
  sections: readonly Section[];
  cta: { heading: string; text: string };
  /** Breadcrumb label, when the page sits under a hub. */
  breadcrumb?: { parent: RouteKey; parentName: string; name: string };
};

export type LandingPageContent = Record<"en" | "de", LandingContent>;
