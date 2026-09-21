#!/usr/bin/env node
// Agent-readiness checks for the running site (default http://127.0.0.1:4400).
// Verifies: real 404s with recovery links, markdown content negotiation with
// Vary: Accept, /llms.txt, homepage JSON-LD completeness, and /about depth.
// Exits non-zero on the first failure. Run after `PORT=4400 node server.js`.

const BASE = process.env.CHECK_BASE || "http://127.0.0.1:4400";

async function get(path, headers) {
  const res = await fetch(BASE + path, { headers, redirect: "manual" });
  return { status: res.status, headers: res.headers, body: await res.text() };
}

const fails = [];
function check(name, ok, detail) {
  console.log((ok ? "ok   " : "FAIL ") + name + (ok || !detail ? "" : "  -> " + detail));
  if (!ok) fails.push(name);
}

(async () => {
  // 1) 404: real status + recovery links, in HTML and in markdown
  let r = await get("/definitely-not-a-real-page");
  check("404 status", r.status === 404, String(r.status));
  check("404 links sitemap", r.body.includes("/sitemap.xml"));
  check("404 links llms.txt", r.body.includes("/llms.txt"));
  r = await get("/definitely-not-a-real-page", { Accept: "text/markdown" });
  check("404 markdown negotiated", r.status === 404 && (r.headers.get("content-type") || "").includes("text/markdown"), r.headers.get("content-type"));

  // 2) markdown negotiation on a real page + Vary: Accept both ways
  r = await get("/pricing", { Accept: "text/markdown" });
  check("markdown content-type", (r.headers.get("content-type") || "").includes("text/markdown"), r.headers.get("content-type"));
  check("markdown Vary includes Accept", (r.headers.get("vary") || "").toLowerCase().includes("accept"), r.headers.get("vary"));
  check("markdown has heading", /^# /m.test(r.body));
  r = await get("/pricing", { Accept: "text/html" });
  check("html Vary includes Accept", (r.headers.get("vary") || "").toLowerCase().includes("accept"), r.headers.get("vary"));

  // 3) llms.txt
  r = await get("/llms.txt");
  check("llms.txt 200", r.status === 200, String(r.status));
  check("llms.txt is markdown", (r.headers.get("content-type") || "").includes("text/markdown"), r.headers.get("content-type"));
  check("llms.txt when-to-use", r.body.includes("When to use Sokosumi"));
  check("llms.txt developer resources", r.body.includes("api.sokosumi.com") && r.body.includes("mcp.sokosumi.com"));

  // 4) homepage JSON-LD: Organization with name, description, contactPoint, address
  r = await get("/");
  const lds = [...r.body.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map((m) => {
    try { return JSON.parse(m[1]); } catch { return null; }
  });
  const org = lds.find((d) => d && d["@type"] === "Organization");
  check("JSON-LD Organization", !!org);
  check("Organization name+description", !!(org && org.name && org.description));
  check("Organization contactPoint", !!(org && org.contactPoint && org.contactPoint.length));
  check("Organization address", !!(org && org.address));

  // 5) /about exists with substance, both locales
  for (const p of ["/about", "/de/about"]) {
    r = await get(p);
    const text = r.body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    check(`${p} 200 with 500+ chars`, r.status === 200 && text.length > 500, `${r.status}, ${text.length} chars`);
  }

  console.log(fails.length ? `\n${fails.length} FAILURES` : "\nOK — all agent-readiness checks passed");
  process.exit(fails.length ? 1 : 0);
})();
