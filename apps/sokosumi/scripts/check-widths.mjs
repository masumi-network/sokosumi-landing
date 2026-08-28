// Layout check across viewport widths. Written after a wide-screen bug shipped
// twice: a full-bleed hero computed its gutter from `100%`, which resolves
// against the 1240px container rather than the viewport, so at 1920px the hero
// copy sat at 56px while every other section sat at 389px. Testing 1280 and 375
// would never have caught it.
//
//   node scripts/check-widths.mjs                       # default pages
//   node scripts/check-widths.mjs /european-ai /pricing # specific pages
//
// Must run from the repo root so playwright-core resolves.
import { chromium } from "playwright-core";

const BASE = process.env.BASE || "http://localhost:4484";
const WIDTHS = [375, 414, 768, 1024, 1440, 1920, 2560];
const pages = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/european-ai", "/agency-run-by-ai", "/ai-marketing-agency", "/pricing", "/ai-coworkers"];

const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage();
let fails = 0;

for (const url of pages) {
  console.log("\n" + url);
  for (const w of WIDTHS) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(BASE + url, { waitUntil: "networkidle" });
    const r = await p.evaluate(() => {
      document.querySelectorAll("[data-reveal]").forEach((e) => { e.style.opacity = 1; e.style.transform = "none"; });
      const c = document.querySelector("[class*=consent],[class*=cookie]"); if (c) c.remove();
      const de = document.documentElement;
      const head = document.querySelector("main h1, .ink-hero h1, .eu-hero h1, .page-head h1");
      const body = document.querySelector("main .page-section h2, main .blk h2, main section h2");
      const over = [];
      document.querySelectorAll("main *, .ink-hero *, .eu-hero *").forEach((el) => {
        if (["svg", "polygon", "g", "path"].includes(el.tagName.toLowerCase())) return;
        const bb = el.getBoundingClientRect();
        if (bb.width > 0 && (bb.right > de.clientWidth + 1 || bb.left < -1)) {
          over.push(typeof el.className === "string" ? el.className.slice(0, 24) : el.tagName);
        }
      });
      return {
        hScroll: de.scrollWidth > de.clientWidth,
        headLeft: head ? Math.round(head.getBoundingClientRect().left) : null,
        bodyLeft: body ? Math.round(body.getBoundingClientRect().left) : null,
        over: [...new Set(over)].slice(0, 3),
      };
    });
    const misaligned = r.headLeft !== null && r.bodyLeft !== null && Math.abs(r.headLeft - r.bodyLeft) > 1;
    const bad = r.hScroll || r.over.length || misaligned;
    if (bad) fails++;
    console.log(
      `  ${String(w).padStart(4)}  h1=${String(r.headLeft).padStart(4)} h2=${String(r.bodyLeft).padStart(4)}` +
        `  scroll=${r.hScroll ? "YES" : "no"}  ${bad ? "FAIL " + JSON.stringify(r.over) : "ok"}`,
    );
  }
}
await b.close();
console.log(fails ? `\nFAIL — ${fails} viewport(s) with a problem` : `\nOK — ${pages.length} pages x ${WIDTHS.length} widths, aligned and no overflow`);
process.exit(fails ? 1 : 0);
