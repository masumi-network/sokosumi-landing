// Tests for assets/cli/install.sh, the one-line CLI installer served at
// /cli/install.sh. Each case runs the script under a PATH of stub binaries
// (node, npm, sokosumi), so nothing here touches the real npm or network.
//
//   node --test apps/sokosumi/scripts/install-sh.test.js

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SCRIPT = path.join(__dirname, "..", "assets", "cli", "install.sh");

// Absolute path of a tool on the real PATH, or null.
function which(bin) {
  const r = spawnSync("/bin/sh", ["-c", `command -v ${bin}`], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}
const has = (bin) => Boolean(which(bin));

// A sandbox: a bin dir of stubs on PATH, an npm prefix, and a log of every
// npm call. `node` reports `nodeVersion`; `npm install -g` writes a fake
// `sokosumi` into the prefix's bin unless `installFails` is set.
const dirs = [];
after(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

// `prefixMissing`: the npm prefix does not exist yet (a fresh
// `npm config set prefix ~/.npm-global`). `shadowed`: an older sokosumi
// sits earlier on PATH than the prefix's bin. `prefixFails`: npm cannot
// even report its prefix.
function sandbox({ nodeVersion = "26.1.0", withNode = true, withNpm = true, prefixWritable = true, installFails = false, prefixMissing = false, shadowed = false, prefixFails = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "soko-install-"));
  dirs.push(dir);
  const bin = path.join(dir, "bin");
  const prefix = path.join(dir, "prefix");
  const log = path.join(dir, "npm.log");
  fs.mkdirSync(bin);
  if (!prefixMissing) {
    fs.mkdirSync(path.join(prefix, "bin"), { recursive: true });
    fs.mkdirSync(path.join(prefix, "lib", "node_modules"), { recursive: true });
  }
  const stub = (name, body) => fs.writeFileSync(path.join(bin, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });

  if (withNode) stub("node", `case "$*" in *process.versions.node*) echo ${nodeVersion.split(".")[0]} ;; *) echo v${nodeVersion} ;; esac`);
  if (withNpm) {
    stub(
      "npm",
      `echo "$*" >> "${log}"
case "$1" in
  prefix) ${prefixFails ? "echo 'npm error config' >&2; exit 1" : `echo "${prefix}"`} ;;
  --version) echo 11.0.0 ;;
  install)
    ${installFails ? "echo 'npm error 404' >&2; exit 1" : `/bin/mkdir -p "${prefix}/bin"; printf '#!/bin/sh\\necho 2.0.0\\n' > "${prefix}/bin/sokosumi"; /bin/chmod +x "${prefix}/bin/sokosumi"`} ;;
esac`,
    );
  }
  if (shadowed) stub("sokosumi", "echo 1.1.0");
  if (!prefixWritable) fs.chmodSync(path.join(prefix, "lib", "node_modules"), 0o555);
  // Only the stubs: the real node or npm (in /usr/bin on many Linux hosts)
  // must never be found. The script uses nothing but shell builtins otherwise.
  const PATH = [bin, path.join(prefix, "bin")].join(":");
  return { dir, prefix, log, PATH };
}

function run(box, { args = [], env = {}, shell = "sh" } = {}) {
  const r = spawnSync(which(shell), [SCRIPT, ...args], {
    env: { PATH: box.PATH, HOME: box.dir, ...env },
    encoding: "utf8",
  });
  const npmCalls = fs.existsSync(box.log) ? fs.readFileSync(box.log, "utf8").trim().split("\n") : [];
  return { code: r.status, out: r.stdout + r.stderr, npmCalls };
}

test("parses under sh, dash and bash", () => {
  for (const shell of ["sh", "dash", "bash"].filter(has)) {
    const r = spawnSync(which(shell), ["-n", SCRIPT], { encoding: "utf8" });
    assert.equal(r.status, 0, `${shell} -n: ${r.stderr}`);
  }
});

test("shellcheck is clean (skipped when shellcheck is not installed)", { skip: !has("shellcheck") && "shellcheck not installed" }, () => {
  const r = spawnSync("shellcheck", ["--shell=sh", SCRIPT], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout);
});

test("installs latest, checks the binary, and prints the next step", () => {
  const box = sandbox();
  const r = run(box);
  assert.equal(r.code, 0, r.out);
  assert.ok(r.npmCalls.some((c) => /^install -g .*@masumi_network\/sokosumi@latest$/.test(c)), r.npmCalls.join("\n"));
  assert.match(r.out, /2\.0\.0/);
  assert.match(r.out, /sokosumi auth login/);
});

test("SOKOSUMI_VERSION pins the version", () => {
  const box = sandbox();
  const r = run(box, { env: { SOKOSUMI_VERSION: "2.0.0" } });
  assert.equal(r.code, 0, r.out);
  assert.ok(r.npmCalls.some((c) => c.endsWith("@masumi_network/sokosumi@2.0.0")), r.npmCalls.join("\n"));
});

test("rejects a version that is not a plain version or tag", () => {
  const box = sandbox();
  const r = run(box, { env: { SOKOSUMI_VERSION: "1.0.0; rm -rf ~" } });
  assert.notEqual(r.code, 0);
  assert.ok(!r.npmCalls.some((c) => c.startsWith("install")), "npm install must not run");
});

test("dry run prints the install command and installs nothing", () => {
  for (const opts of [{ args: ["--dry-run"] }, { env: { SOKOSUMI_DRY_RUN: "1" } }]) {
    const box = sandbox();
    const r = run(box, opts);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /npm install -g .*@masumi_network\/sokosumi@latest/);
    assert.ok(!r.npmCalls.some((c) => c.startsWith("install")), "npm install must not run");
  }
});

test("without Node.js it explains where to get it and exits non-zero", () => {
  const box = sandbox({ withNode: false, withNpm: false });
  const r = run(box);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /Node\.js 26/);
  assert.match(r.out, /nodejs\.org/);
});

test("on Node.js 24 it asks for 26 and exits non-zero", () => {
  const box = sandbox({ nodeVersion: "24.12.0" });
  const r = run(box);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /Node\.js 26/);
  assert.match(r.out, /24/);
  assert.ok(!r.npmCalls.some((c) => c.startsWith("install")));
});

test("without npm it exits non-zero", () => {
  const box = sandbox({ withNpm: false });
  const r = run(box);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /npm/);
});

test("a global prefix that needs root is explained, never sudo'd", { skip: process.getuid && process.getuid() === 0 && "root can write anywhere" }, () => {
  const box = sandbox({ prefixWritable: false });
  const r = run(box);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /sudo npm install -g @masumi_network\/sokosumi@latest/);
  assert.ok(!r.npmCalls.some((c) => c.startsWith("install")), "npm install must not run");
});

test("an npm failure exits non-zero", () => {
  const box = sandbox({ installFails: true });
  const r = run(box);
  assert.notEqual(r.code, 0);
  assert.doesNotMatch(r.out, /sokosumi auth login/);
});

test("running it twice is fine", () => {
  const box = sandbox();
  assert.equal(run(box).code, 0);
  const r = run(box);
  assert.equal(r.code, 0, r.out);
});

test("also runs under bash, as with `curl … | bash`", { skip: !has("bash") && "bash not installed" }, () => {
  const box = sandbox();
  const r = run(box, { shell: "bash" });
  assert.equal(r.code, 0, r.out);
});

test("a prefix that does not exist yet is fine when its parent is yours", () => {
  const box = sandbox({ prefixMissing: true });
  const r = run(box);
  assert.equal(r.code, 0, r.out);
  assert.ok(r.npmCalls.some((c) => c.startsWith("install")), "npm install must run");
});

test("reports the version it installed, and warns about an older sokosumi earlier on PATH", () => {
  const box = sandbox({ shadowed: true });
  const r = run(box);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /Sokosumi CLI 2\.0\.0 is installed/);
  assert.match(r.out, /older|another/i);
});

test("an npm that cannot report its prefix fails with a message", () => {
  const box = sandbox({ prefixFails: true });
  const r = run(box);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /prefix/);
});
