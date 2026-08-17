// Deterministic abstract artwork for the use-case surfaces: soft radial
// colour fields, one thin ring, and sometimes a dotted disc — all drawn from
// the brand purple's neighbourhood. Seeded by the page slug, so a page always
// renders the same composition and no two pages share one. Pure inline SVG:
// no requests, no fonts, no faces, no photography. field() answers "" on any
// failure, and every caller treats "" as "render a plain surface instead".

const BASE_HUE = 264; // #6400ff

// FNV-1a into a mulberry32-style stream: tiny, deterministic, good enough
// spread for picking hues and positions.
function rng(seed) {
  let h = 2166136261 >>> 0;
  const s = String(seed || "sokosumi");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// opts: { w, h, bias } — bias "edges" pushes the shapes into the outer
// quarters, for surfaces with centred text on top of the field.
function field(seed, opts) {
  try {
    const o = opts || {};
    const w = Math.max(1, Math.round(o.w || 720));
    const h = Math.max(1, Math.round(o.h || 420));
    const rand = rng(seed);
    // Gradient/pattern ids are global to the document; prefix with the seed
    // and the width so the same slug at two sizes on one page cannot collide.
    const uid =
      "art-" +
      (String(seed).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24) || "x") +
      "-" +
      w;

    // Two hues out of the brand's neighbourhood: the purple itself, nudged,
    // and a companion a step toward indigo or magenta — never far enough to
    // read as a different brand.
    const hueA = BASE_HUE + Math.round((rand() - 0.5) * 18);
    const hueB = hueA + (rand() < 0.5 ? -30 : 26);
    const edges = o.bias === "edges";
    const px = () => (edges ? (rand() < 0.5 ? rand() * 0.26 * w : w - rand() * 0.26 * w) : rand() * w);

    let defs = "";
    let body = "";

    // Two or three soft colour fields.
    const blobs = 2 + (rand() < 0.6 ? 1 : 0);
    for (let i = 0; i < blobs; i++) {
      const id = `${uid}-g${i}`;
      const hue = i % 2 ? hueB : hueA;
      const sat = 88 + Math.round(rand() * 12);
      const light = 52 + Math.round(rand() * 14);
      const peak = ((edges ? 0.12 : 0.15) + rand() * 0.08).toFixed(3);
      defs += `<radialGradient id="${id}"><stop offset="0" stop-color="hsl(${hue} ${sat}% ${light}%)" stop-opacity="${peak}"/><stop offset="1" stop-color="hsl(${hue} ${sat}% ${light}%)" stop-opacity="0"/></radialGradient>`;
      const r = (h * (0.55 + rand() * 0.5)).toFixed(1);
      body += `<circle cx="${px().toFixed(1)}" cy="${(h * (0.1 + rand() * 0.8)).toFixed(1)}" r="${r}" fill="url(#${id})"/>`;
    }

    // The one drawn line in the field.
    body += `<circle cx="${px().toFixed(1)}" cy="${(h * (0.15 + rand() * 0.7)).toFixed(1)}" r="${(
      h *
      (0.22 + rand() * 0.26)
    ).toFixed(1)}" fill="none" stroke="hsl(${hueA} 90% 55%)" stroke-opacity="${(0.14 + rand() * 0.1).toFixed(
      3,
    )}" stroke-width="1"/>`;

    // Sometimes, a dotted disc — the site's dot-grid motif at a whisper.
    if (rand() < 0.6) {
      const did = `${uid}-d`;
      defs += `<pattern id="${did}" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="hsl(${hueB} 90% 55%)" fill-opacity="0.18"/></pattern>`;
      body += `<circle cx="${px().toFixed(1)}" cy="${(h * (0.15 + rand() * 0.7)).toFixed(1)}" r="${(
        h *
        (0.16 + rand() * 0.2)
      ).toFixed(1)}" fill="url(#${did})"/>`;
    }

    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;
  } catch {
    return "";
  }
}

module.exports = { field };
