#!/bin/sh
# Installs the Sokosumi CLI (@masumi_network/sokosumi) with npm.
#
#   curl -fsSL https://www.sokosumi.com/cli/install.sh | sh
#
# Needs Node.js 26 and npm. It does not install Node.js for you, it never
# calls sudo, and it sends nothing anywhere except the npm install itself.
# Running it again reinstalls the same package, so it is safe to repeat.
#
# Options (environment variables, or flags after `sh -s --`):
#   SOKOSUMI_VERSION=2.0.0   install this version or npm tag (default: latest)
#   SOKOSUMI_DRY_RUN=1       print what would happen, install nothing
#   --dry-run                same as SOKOSUMI_DRY_RUN=1
#
# Source: https://github.com/masumi-network/sokosumi-landing/blob/main/apps/sokosumi/assets/cli/install.sh

set -eu

PACKAGE="@masumi_network/sokosumi"
NODE_MAJOR=26

say() { printf '%s\n' "$*"; }
fail() {
  printf 'sokosumi install: %s\n' "$*" >&2
  exit 1
}

need_node() {
  say "The Sokosumi CLI needs Node.js $NODE_MAJOR and npm." >&2
  say "Get Node.js $NODE_MAJOR from https://nodejs.org, or with a version manager:" >&2
  say "  fnm install $NODE_MAJOR    (https://github.com/Schniz/fnm)" >&2
  say "  nvm install $NODE_MAJOR    (https://github.com/nvm-sh/nvm)" >&2
  say "Then run this installer again." >&2
  exit 1
}

main() {
  version="${SOKOSUMI_VERSION:-latest}"
  dry_run="${SOKOSUMI_DRY_RUN:-}"
  for arg in "$@"; do
    case "$arg" in
      --dry-run) dry_run=1 ;;
      *) fail "unknown option: $arg" ;;
    esac
  done

  # A version or a dist-tag, nothing that could smuggle in a second argument.
  case "$version" in
    "" | -* | *[!A-Za-z0-9.+-]*) fail "SOKOSUMI_VERSION must be a version like 2.0.0 or a tag like latest, got: $version" ;;
  esac
  spec="$PACKAGE@$version"

  command -v node >/dev/null 2>&1 || need_node
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  case "$major" in
    "" | *[!0-9]*) fail "could not read the Node.js version from \`node\`." ;;
  esac
  if [ "$major" -lt "$NODE_MAJOR" ]; then
    say "Found Node.js $major." >&2
    need_node
  fi
  command -v npm >/dev/null 2>&1 || {
    say "Found Node.js $major, but not npm." >&2
    need_node
  }

  # npm installs global packages under its prefix. When that belongs to root
  # (a system Node), say so and stop: running sudo is the user's call.
  prefix="$(npm prefix -g)" || fail "npm could not report its global prefix. Run \`npm prefix -g\` to see why."
  # npm creates whatever is missing below the nearest folder that exists, so
  # that folder is the one that has to be writable.
  target="$prefix/lib/node_modules"
  while [ ! -e "$target" ]; do
    target="${target%/*}"
    [ -n "$target" ] || target=/
  done
  if [ ! -w "$target" ]; then
    say "npm installs global packages into $prefix, and your user cannot write to $target." >&2
    say "Pick one, then run this installer again:" >&2
    say "  - install Node.js with a version manager (fnm or nvm), which keeps npm in your home folder" >&2
    say "  - point npm at a folder you own: npm config set prefix \"\$HOME/.npm-global\"" >&2
    say "    and add \$HOME/.npm-global/bin to your PATH" >&2
    say "Or install as root yourself: sudo npm install -g $spec" >&2
    exit 1
  fi

  if [ -n "$dry_run" ]; then
    say "Dry run. Node.js $major, npm prefix $prefix."
    say "Would run: npm install -g --no-fund --no-audit $spec"
    say "Would then check: sokosumi --version"
    return 0
  fi

  say "Installing $spec with npm (Node.js $major)..."
  npm install -g --no-fund --no-audit "$spec" || fail "npm install failed. The npm output above says why."

  bin="$prefix/bin/sokosumi"
  installed="$("$bin" --version)" || fail "\`$bin --version\` failed after the install."
  say ""
  say "Sokosumi CLI $installed is installed in $prefix/bin."

  # The shell runs the first sokosumi on PATH, which may be another install.
  found="$(command -v sokosumi || true)"
  if [ -z "$found" ]; then
    say "\`sokosumi\` is not on your PATH yet. Add $prefix/bin to your PATH and open a new terminal." >&2
    exit 1
  fi
  if [ "$found" != "$bin" ]; then
    say "Note: your shell finds another sokosumi first, at $found." >&2
    say "Put $prefix/bin earlier in your PATH, or remove the older install." >&2
  fi
  say "Next, sign in:"
  say "  sokosumi auth login"
}

main "$@"
