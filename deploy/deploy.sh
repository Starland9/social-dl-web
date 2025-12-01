#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "[deploy] Ensuring logs directory exists..."
mkdir -p logs

echo "[deploy] Installing dependencies (pnpm install --frozen-lockfile)..."
if ! command -v pnpm >/dev/null 2>&1; then
	echo "[deploy] pnpm not installed: please install pnpm (https://pnpm.io/installation)" >&2
	exit 1
fi
pnpm install --frozen-lockfile

echo "[deploy] Building Next.js (pnpm build)..."
NODE_ENV=production pnpm build

echo "[deploy] Starting / Reloading with PM2 (update env)..."
if ! command -v pm2 >/dev/null 2>&1; then
	echo "[deploy] Using npx to run pm2. If you have pm2 installed system-wide, this will use that." && true
fi
npx --yes pm2 startOrReload "$PROJECT_ROOT/deploy/ecosystem.config.js" --env production --update-env

echo "[deploy] Current PM2 status (social-dl-web):"
npx --yes pm2 status social-dl-web || true

echo "[deploy] Saving PM2 process list"
npx --yes pm2 save || true

echo "[deploy] Done. App should be available on port 3002."
