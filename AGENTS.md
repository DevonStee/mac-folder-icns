# AGENTS.md

## Cursor Cloud specific instructions

### Services

| Service | Command | URL | Notes |
|---------|---------|-----|-------|
| Next.js dev server | `npm run dev` | http://localhost:3000 | Only service needed; uses Turbopack |

### Lint / Build / Test

See `CLAUDE.md` and `README.md` for standard commands. Key notes:

- **Lint**: `npm run lint` — requires ESLint 8.x + `eslint-config-next@15.x` + `.eslintrc.json` (these are added as devDependencies; if missing, run `npm install`).
- **Build**: `npm run build` — static export to `./out`. Serwist (service worker) is disabled via `NEXT_DISABLE_SERWIST=1` in the script.
- **Dev**: `npm run dev` — Turbopack at http://localhost:3000.

### Gotchas

- `npm run generate` requires macOS (`sips` + `cwebp`). It is **not runnable** on Linux cloud agents. All generated assets (PNG previews, WebP thumbnails, `icons.json`, `.icns` files in `public/icns/`) are pre-committed to git, so the dev server works without running generate.
- The project uses `output: "export"` (fully static). There is no server-side runtime; `npm start` will not work after `npm run build` — use `npx serve out` instead for a local production preview.
- ESLint config uses the legacy `.eslintrc.json` format (ESLint 8). Do not upgrade to ESLint 9 flat config without also upgrading `eslint-config-next`.
