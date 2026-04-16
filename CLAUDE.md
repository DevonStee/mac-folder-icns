# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# One-time setup: convert .icns → PNG previews + generate icons.json (macOS only, ~2 min)
npm run generate

# Development
npm run dev       # Turbopack dev server at http://localhost:3000

# Production
npm run build
npm start
```

> `npm run generate` must be re-run whenever icons are added/changed in `icns_products/`.
> The `icns_products/` folder is `.gitignore`d — keep it local only.

## Architecture

**Stack**: Next.js 15 App Router · Tailwind v4 · TypeScript

### Data pipeline
`icns_products/*.icns` → `scripts/generate.mjs` (uses macOS `sips`) → `public/previews/*.png` + `src/data/icons.json`

`icons.json` is the single source of truth for all icon metadata (slug, series, displayName, preview path). It is committed to git; the source `.icns` files are not.

### Key files
| File | Role |
|------|------|
| `scripts/generate.mjs` | Converts .icns → 512px PNG + 256px WebP thumb, parses filenames, writes icons.json |
| `src/data/icons.json` | Static icon metadata, imported directly by page.tsx |
| `src/app/page.tsx` | Server component — imports icons.json, passes to `<IconCanvas>` inside `<Suspense>` |
| `src/components/IconCanvas.tsx` | `"use client"` — infinite panning canvas, owns filter logic, composes TopBar + DownloadDialog |
| `src/components/IconCard.tsx` | Renders one icon tile with a plain `<img>` (WebP thumb) |
| `src/components/TopBar.tsx` | Search input, filter chips row, theme toggle |
| `src/components/DownloadDialog.tsx` | Icon detail modal with .icns download link |
| `src/components/FilterChips.tsx` | Series constants + chip label helpers; `NAMED_SERIES` must match generate.mjs |
| `src/hooks/useCanvasPan.ts` | Framer-motion `x`/`y` motion values, drag handlers, snap-to-origin |
| `src/hooks/useVirtualCells.ts` | Computes only viewport-visible cells from pan position (infinite tiling via modulo) |
| `src/hooks/useUrlParams.ts` | `?q=` / `?s=` state via `router.replace` + `useTransition` |
| `src/hooks/useTheme.ts` | Dark-mode toggle + localStorage persistence |

### Filename parsing logic
All icons follow `fold-icon-{rawSeries}-{Variant}.icns`. Parsing rules (in both `generate.mjs` and `FilterChips.tsx`):
- 6-char hex (e.g. `fold-icon-c0d9d1`) → series = `"color"`
- `v\d+` prefix (e.g. `v34`, `v59`) → series = `"archive"`
- 30 named series with 6+ icons each → individual filter chips
- Everything else → rawSeries kept as-is, no filter chip

### Filter chip / series matching
`IconCanvas.tsx` filters using `matchesSeries()`:
- `"color"` chip → matches `HEX_RE` on rawSeries
- `"archive"` chip → matches `VERSION_RE` on rawSeries
- Named chip → exact `rawSeries` match

### URL state
Search query → `?q=`, active series → `?s=`. Updated via `router.replace` + `useTransition` for non-blocking input.

## Phase 2 (downloads — not yet built)
Downloads of the original `.icns` files require external storage (Vercel Blob or S3) because the source folder is 462MB and cannot be deployed to Vercel. The `IconCard` component has a download button placeholder for when URLs are available.
