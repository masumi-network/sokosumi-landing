"use strict";

// Deterministic image compressor for /tools/image-compressor. The uploaded
// file never leaves this process for anywhere but back to the browser that
// sent it — no URL fetch, no storage — so unlike the other tools here there
// is no SSRF surface to guard: the input is the visitor's own bytes.

const sharp = require("sharp");

const MAX_INPUT_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_INPUT = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const ALLOWED_OUTPUT = new Set(["jpeg", "png", "webp", "avif"]);

function clampQuality(value) {
  // query.get("quality") comes back null when the param is absent — Number()
  // coerces that to 0, which is finite, so it would otherwise clamp to the
  // 10 floor instead of falling through to the intended default.
  if (value === null || value === undefined || value === "") return 75;
  const n = Number(value);
  if (!Number.isFinite(n)) return 75;
  return Math.min(95, Math.max(10, Math.round(n)));
}

async function compress(buffer, options) {
  const opts = options || {};
  const quality = clampQuality(opts.quality);
  const image = sharp(buffer, { limitInputPixels: 268402689 }); // ~16384x16384
  const meta = await image.metadata();

  let outFormat = opts.format;
  if (!ALLOWED_OUTPUT.has(outFormat)) {
    outFormat = meta.format === "png" && meta.hasAlpha ? "png" : "jpeg";
  }

  let pipeline = image.rotate(); // apply EXIF orientation, then strip it
  if (outFormat === "jpeg") pipeline = pipeline.flatten({ background: "#fff" }).jpeg({ quality, mozjpeg: true });
  else if (outFormat === "png") pipeline = pipeline.png({ quality, compressionLevel: 9, palette: true });
  else if (outFormat === "webp") pipeline = pipeline.webp({ quality });
  else if (outFormat === "avif") pipeline = pipeline.avif({ quality });

  const output = await pipeline.toBuffer();

  return {
    buffer: output,
    mime: `image/${outFormat}`,
    inputBytes: buffer.length,
    outputBytes: output.length,
    inputFormat: meta.format || null,
    outputFormat: outFormat,
    width: meta.width || null,
    height: meta.height || null,
  };
}

module.exports = { compress, MAX_INPUT_BYTES, ALLOWED_INPUT, ALLOWED_OUTPUT };
