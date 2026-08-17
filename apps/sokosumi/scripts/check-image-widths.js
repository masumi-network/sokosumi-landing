// Vercel 400s any /_vercel/image width missing from vercel.json images.sizes,
// and a 400 is an invisible image, not a slow one. thumbSrc() emits both w and
// w*2 (retina), so BOTH must be declared — 384*2 and 828*2 were not, and that
// blanked 55 portraits in production. Run this after touching either side.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const sizes = new Set(JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8")).images.sizes);
const files = [
  ...fs.readdirSync(path.join(root, "templates")).map((f) => path.join("templates", f)),
  "index.html",
  "server.js",
];
const wanted = new Map();
for (const rel of files) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  for (const m of src.matchAll(/\bthumbSrc\([^,]+,\s*(\d+)\)/g)) {
    wanted.set(+m[1], rel);
    wanted.set(+m[1] * 2, rel + " (2x)");
  }
  for (const m of src.matchAll(/\bthumbSet\([^,]+,\s*(\d+)\)/g)) {
    wanted.set(+m[1], rel);
    wanted.set(+m[1] * 2, rel + " (2x)");
  }
  for (const m of src.matchAll(/\bthumb\([^,]+,\s*(\d+)\)/g)) wanted.set(+m[1], rel);
  for (const m of src.matchAll(/widths:\s*\[([\d,\s]+)\]/g)) {
    for (const w of m[1].split(",")) wanted.set(+w.trim(), rel);
  }
}
const missing = [...wanted].filter(([w]) => !sizes.has(w));
for (const [w, where] of missing) console.error(`MISSING width ${w} (requested by ${where})`);
console.log(missing.length ? `FAIL — ${missing.length} undeclared width(s)` : `OK — all ${wanted.size} requested widths are declared`);
process.exit(missing.length ? 1 : 0);
