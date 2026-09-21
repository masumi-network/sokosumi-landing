// Deliverable mocks: one small SVG per kind of file a use case hands back.
// Shared by the use-case cards, the use-case hero and the nav menu so the
// same job always shows the same artefact.

const KINDS = [
  [/dashboard/, "dashboard"],
  [/calendar|seasonal|planning|roadmap/, "plan"],
  [/deck|presentation|slides|pitch/, "deck"],
  [/content set|copy|variants|landing|social|content/, "content"],
  [/report|monitor|briefing|audit|analysis|intelligence|research/, "report"],
  [/plan/, "plan"],
];

const LABELS = { deck: "Deck", dashboard: "Dashboard", report: "Report", content: "Content set", plan: "Plan", file: "Finished file" };

function kindOf(uc) {
  const text = `${uc.title || ""} ${uc.description || ""}`.toLowerCase();
  const hit = KINDS.find(([re]) => re.test(text));
  return hit ? hit[1] : "file";
}

// All mocks are drawn on a 160x100 canvas, ink on white, accent in blue.
const INK = "rgba(15,14,13,.22)";
const INK2 = "rgba(15,14,13,.55)";
const ACC = "#2b5c78";
const ACC2 = "rgba(43,92,120,.28)";

const MOCKS = {
  deck: `
    <rect x="12" y="10" width="136" height="80" rx="4" fill="#fff" stroke="${INK}"/>
    <rect x="24" y="24" width="58" height="6" rx="2" fill="${INK2}"/>
    <rect x="24" y="36" width="42" height="4" rx="2" fill="${INK}"/>
    <rect x="96" y="24" width="40" height="52" rx="3" fill="${ACC2}"/>
    <rect x="24" y="66" width="24" height="10" rx="2" fill="${ACC}"/>
    <rect x="52" y="66" width="24" height="10" rx="2" fill="${INK}"/>`,
  report: `
    <rect x="44" y="6" width="72" height="88" rx="4" fill="#fff" stroke="${INK}"/>
    <rect x="54" y="18" width="38" height="5" rx="2" fill="${INK2}"/>
    <rect x="54" y="30" width="52" height="3" rx="1.5" fill="${INK}"/>
    <rect x="54" y="37" width="52" height="3" rx="1.5" fill="${INK}"/>
    <rect x="54" y="44" width="36" height="3" rx="1.5" fill="${INK}"/>
    <rect x="54" y="72" width="8" height="12" rx="1" fill="${ACC2}"/>
    <rect x="65" y="64" width="8" height="20" rx="1" fill="${ACC}"/>
    <rect x="76" y="68" width="8" height="16" rx="1" fill="${ACC2}"/>
    <rect x="87" y="58" width="8" height="26" rx="1" fill="${ACC}"/>
    <rect x="98" y="62" width="8" height="22" rx="1" fill="${ACC2}"/>`,
  dashboard: `
    <rect x="12" y="10" width="136" height="80" rx="4" fill="#fff" stroke="${INK}"/>
    <rect x="22" y="20" width="36" height="22" rx="3" fill="${ACC2}"/>
    <rect x="62" y="20" width="36" height="22" rx="3" fill="${INK}"/>
    <rect x="102" y="20" width="36" height="22" rx="3" fill="${INK}"/>
    <polyline points="24,76 40,68 56,71 72,60 88,63 104,54 120,58 136,48" fill="none" stroke="${ACC}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <line x1="22" y1="82" x2="138" y2="82" stroke="${INK}"/>`,
  content: `
    <rect x="18" y="26" width="58" height="66" rx="4" fill="#fff" stroke="${INK}" transform="rotate(-6 47 59)"/>
    <rect x="50" y="18" width="60" height="70" rx="4" fill="#fff" stroke="${INK}"/>
    <rect x="58" y="26" width="44" height="30" rx="3" fill="${ACC2}"/>
    <rect x="58" y="62" width="34" height="4" rx="2" fill="${INK2}"/>
    <rect x="58" y="70" width="26" height="3" rx="1.5" fill="${INK}"/>
    <rect x="84" y="26" width="58" height="66" rx="4" fill="#fff" stroke="${INK}" transform="rotate(6 113 59)"/>
    <rect x="93" y="36" width="40" height="26" rx="3" fill="${INK}" transform="rotate(6 113 59)"/>`,
  plan: `
    <rect x="16" y="10" width="128" height="80" rx="4" fill="#fff" stroke="${INK}"/>
    <rect x="16" y="10" width="128" height="14" rx="4" fill="${INK}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((c) => [0, 1, 2].map((r) => `<rect x="${24 + c * 17}" y="${32 + r * 18}" width="13" height="13" rx="2" fill="${(c + r) % 3 === 1 ? ACC : (c * r) % 4 === 2 ? ACC2 : "rgba(15,14,13,.07)"}"/>`).join("")).join("")}`,
  file: `
    <path d="M52 8h40l20 20v64a4 4 0 0 1-4 4H52a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#fff" stroke="${INK}"/>
    <path d="M92 8v20h20" fill="none" stroke="${INK}"/>
    <rect x="58" y="44" width="44" height="4" rx="2" fill="${INK2}"/>
    <rect x="58" y="54" width="44" height="3" rx="1.5" fill="${INK}"/>
    <rect x="58" y="62" width="30" height="3" rx="1.5" fill="${INK}"/>`,
};

function svg(kind, cls) {
  return `<svg class="${cls || "dlv"} is-${kind}" viewBox="0 0 160 100" width="160" height="100" aria-hidden="true" focusable="false">${MOCKS[kind] || MOCKS.file}</svg>`;
}

module.exports = { kindOf, LABELS, svg };
