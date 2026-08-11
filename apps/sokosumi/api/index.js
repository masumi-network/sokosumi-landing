// Vercel serverless entrypoint for the Sokosumi landing site.
//
// The whole site is one zero-dependency Node request handler (see
// ../server.js). That file defines the handler at module scope and exports it;
// importing it does NOT start a listener, so Vercel can invoke handler(req,res)
// per request. Railway and `node server.js` still run it as a long-running
// server — same code, two hosts.
//
// The catch-all rewrite in vercel.json sends every path here, so this one
// function serves pages, assets, the JSON APIs, redirects, sitemap and the
// form POST endpoints exactly as the standalone server does.
module.exports = require("../server.js");
