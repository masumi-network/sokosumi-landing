import assert from "node:assert/strict";
import { test } from "node:test";
import * as cheerio from "cheerio";
import { extractLogos, pickLogo } from "./logos";

function logoOf(html: string, url: string, names: string[]) {
  return pickLogo(extractLogos(cheerio.load(html), url, names));
}

const ICONS = `
  <link rel="icon" type="image/svg+xml" href="/assets/icon.svg">
  <link rel="apple-touch-icon" href="/assets/apple-icon.png">
  <meta property="og:image" content="/assets/og-image.png">`;

test("the header's lockup beats the favicon, which stays as the mark", () => {
  // cmo.xyz: the link home is "#top", and the footer holds the white file.
  const logo = logoOf(
    `<head>${ICONS}</head><body>
      <header><a class="brand" href="#top" aria-label="CMO.XYZ home">
        <img src="/assets/logo/cmo-xyz-lockup-stacked-text-black.svg" alt="" width="1032" height="393">
      </a></header>
      <footer><a class="brand brand--footer" href="#top" aria-label="CMO.XYZ home">
        <img src="/assets/logo/cmo-xyz-lockup-stacked-text-white.svg" alt="" width="1044" height="393">
      </a></footer></body>`,
    "https://www.cmo.xyz/",
    ["CMO.XYZ", "cmo"],
  );
  assert.deepEqual(logo, {
    src: "https://www.cmo.xyz/assets/logo/cmo-xyz-lockup-stacked-text-black.svg",
    srcDark: "https://www.cmo.xyz/assets/logo/cmo-xyz-lockup-stacked-text-white.svg",
    mark: "https://www.cmo.xyz/assets/icon.svg",
    alt: "CMO.XYZ home",
  });
});

test("a header image without sizes in the link home is the logo", () => {
  // nmkr.io: Webflow's brand link carries a query string.
  const logo = logoOf(
    `<head><link rel="apple-touch-icon" href="https://cdn.example/nmkr-webclip.png"></head>
     <body><div role="banner"><a href="/?r=0" class="brand w-nav-brand">
       <img src="https://cdn.example/66a3_Logo.svg" alt="nmkr"></a></div>
       <a href="#" class="lightbox"><img src="https://cdn.example/slide.png" alt="nmkr"></a></body>`,
    "https://www.nmkr.io/",
    ["nmkr"],
  );
  assert.equal(logo?.src, "https://cdn.example/66a3_Logo.svg");
  assert.equal(logo?.mark, "https://cdn.example/nmkr-webclip.png");
});

test("an inline SVG wordmark is kept in black and in white", () => {
  const logo = logoOf(
    `<body><header><a href="/homepage" aria-label="Navigate to home">
       <svg height="22" viewBox="0 0 400 100" fill="currentColor" class="logo" onclick="steal()">
         <script>steal()</script><path d="M0 0h400v100H0z"/></svg></a></header></body>`,
    "https://linear.app/",
    ["Linear"],
  );
  const svg = decodeURIComponent(logo?.src.split(",")[1] ?? "");
  assert.match(svg, /^<svg[^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /fill="#000000"/);
  assert.doesNotMatch(svg, /script|onclick|currentColor/);
  assert.match(decodeURIComponent(logo?.srcDark ?? ""), /fill="#ffffff"/);
});

test("an SVG that draws a symbol from a sprite carries the symbol", () => {
  const logo = logoOf(
    `<body><svg style="display:none"><symbol id="logo-full" viewBox="0 0 120 30">
        <path fill="#95bf47" d="M0 0h120v30H0z"/></symbol></svg>
      <header><a href="/"><svg class="h-9"><use href="#logo-full"></use></svg></a></header></body>`,
    "https://shop.example/",
    ["Shop"],
  );
  const svg = decodeURIComponent(logo?.src ?? "");
  assert.match(svg, /viewBox="0 0 120 30"/);
  assert.match(svg, /fill="#95bf47"/);
  assert.equal(logo?.srcDark, undefined);
});

test("other companies' logos are never the site's logo", () => {
  const logo = logoOf(
    `<head><link rel="icon" href="/favicon.png"></head><body>
      <header><a href="/pricing">Pricing</a></header>
      <section class="customer-logos"><img src="/img/acme-logo.svg" alt="Acme logo"></section>
      <section><img src="/images/logos/serviceplan-logo.png" alt="Serviceplan"></section></body>`,
    "https://site.example/",
    ["Site"],
  );
  assert.deepEqual(logo, { src: "https://site.example/favicon.png" });
});

test("a page that names its dark-mode file gets it as srcDark", () => {
  const logo = logoOf(
    `<body><nav><a href="/"><picture>
       <source srcset="/logo-night.svg" media="(prefers-color-scheme: dark)">
       <img src="/logo.svg" alt="Acme" width="120" height="24"></picture></a></nav></body>`,
    "https://acme.example/",
    ["Acme"],
  );
  assert.equal(logo?.src, "https://acme.example/logo.svg");
  assert.equal(logo?.srcDark, "https://acme.example/logo-night.svg");
});

test("without a logo on the page the best icon stands in, the share card last", () => {
  const logo = logoOf(`<head>${ICONS}</head><body><header></header></body>`, "https://a.example/", []);
  assert.deepEqual(logo, { src: "https://a.example/assets/icon.svg" });
  assert.equal(
    logoOf(`<head><meta property="og:image" content="/card.png"></head>`, "https://a.example/", [])
      ?.src,
    "https://a.example/card.png",
  );
});
