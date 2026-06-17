// Minimal zero-dependency static server: serves the placeholder for every route.
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const html = fs.readFileSync(path.join(__dirname, "index.html"));

http
  .createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  })
  .listen(port, () => {
    console.log(`Sokosumi placeholder listening on :${port}`);
  });
