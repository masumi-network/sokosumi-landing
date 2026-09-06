"use strict";

// QR code generation for /tools/qr-code-generator, backed by the `qrcode`
// package. The input text is only ever encoded into a pattern — never
// fetched, parsed, or stored — so unlike the URL-scanning tools here there is
// no SSRF surface: even when the text is itself a URL, nothing requests it.

const QRCode = require("qrcode");

const MAX_TEXT_LENGTH = 1500;
const MIN_SIZE = 64;
const MAX_SIZE = 1024;
const EC_LEVELS = new Set(["L", "M", "Q", "H"]);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function clampSize(value) {
  // query.get("size") comes back null when the param is absent and "" when
  // it's present-but-empty — both coerce to 0 via Number(), which is finite,
  // so they'd otherwise clamp to MIN_SIZE instead of falling through to the
  // intended default.
  if (value === null || value === undefined || value === "") return 320;
  const n = Number(value);
  if (!Number.isFinite(n)) return 320;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)));
}

function normalizeColor(value, fallback) {
  const v = String(value || "").trim();
  return HEX_COLOR.test(v) ? v : fallback;
}

async function generate(text, options) {
  const opts = options || {};
  const data = String(text || "").trim();

  if (!data) {
    const error = new Error("Enter the text or URL to encode.");
    error.status = 400;
    throw error;
  }
  if (data.length > MAX_TEXT_LENGTH) {
    const error = new Error(`That's ${data.length} characters — keep it under ${MAX_TEXT_LENGTH} for a code that will still scan reliably.`);
    error.status = 400;
    throw error;
  }

  const format = opts.format === "svg" ? "svg" : "png";
  const size = clampSize(opts.size);
  const ecLevel = EC_LEVELS.has(String(opts.ecLevel || "").toUpperCase()) ? String(opts.ecLevel).toUpperCase() : "M";
  const dark = normalizeColor(opts.fg, "#0f0e0d");
  const light = normalizeColor(opts.bg, "#ffffff");

  const qrOptions = {
    errorCorrectionLevel: ecLevel,
    width: size,
    margin: 2,
    color: { dark, light },
  };

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(data, { ...qrOptions, type: "svg" });
      return { body: svg, mime: "image/svg+xml" };
    }
    const buffer = await QRCode.toBuffer(data, { ...qrOptions, type: "png" });
    return { body: buffer, mime: "image/png" };
  } catch (err) {
    const error = new Error("That text is too long to fit a scannable QR code at this error-correction level. Shorten it, or lower the error-correction level.");
    error.status = 422;
    throw error;
  }
}

module.exports = { generate, MAX_TEXT_LENGTH, MIN_SIZE, MAX_SIZE };
