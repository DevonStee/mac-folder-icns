# Fold Icons

A browsable gallery of 559 macOS `.icns` folder icons — infinite panning canvas, search, series filter, dark mode, one-click download.

**Stack:** Next.js 15 · Tailwind v4 · Framer Motion · TypeScript · Static export → GitHub Pages

---

## Local development

### Prerequisites

- Node.js 20+
- macOS (only required if you need to re-generate icons from `.icns` sources)
- `cwebp` — only required for icon generation: `brew install webp`

### Run the dev server

The PNG previews and `icons.json` are already committed, so you can start the dev server immediately without the source `.icns` files.

```bash
npm install
npm run dev       # http://localhost:3000
```

### Re-generate icons (macOS only)

Run this whenever you add or change `.icns` files in `icns_products/`:

```bash
# Place .icns files in icns_products/ (gitignored, local only)
npm run generate  # ~2 min for 559 icons
npm run dev
```

`npm run generate` produces:
- `public/previews/*.png` — 512 px PNG previews
- `public/previews/*-thumb.webp` — 128 px WebP thumbnails
- `public/icns/*.icns` — originals copied for direct download
- `src/data/icons.json` — icon metadata (committed to git)

### Local production build

```bash
npm run build     # outputs to ./out
npx serve out     # or any static file server
```

---

## Deploy to GitHub Pages

### One-time setup

1. Go to your repo → **Settings → Pages**
2. Set **Source** to **GitHub Actions**

That's it. No environment variables to configure — the workflow reads the correct `basePath` automatically via `actions/configure-pages`.

### Automatic deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which:

1. Installs dependencies (`npm ci`)
2. Detects the repo's GitHub Pages base path (e.g. `/fold-icons` for a project page, empty for a custom domain)
3. Runs `npm run build` with `NEXT_PUBLIC_BASE_PATH` set automatically
4. Uploads `./out` and deploys to GitHub Pages

Your site will be live at:
- **Project page:** `https://<username>.github.io/<repo-name>/`
- **Custom domain:** `https://yourdomain.com/`

### Manual trigger

You can also trigger a deploy manually from **Actions → Deploy to GitHub Pages → Run workflow**.

---

## Project structure

```
icns_products/          # Source .icns files — gitignored, local only
public/
  previews/             # PNG + WebP thumbnails — committed
  icns/                 # Original .icns for download — committed
src/
  data/icons.json       # Icon metadata — committed, single source of truth
  app/page.tsx          # Server component entry point
  components/
    IconCanvas.tsx      # Infinite panning canvas + UI overlay
    IconCard.tsx        # Single icon tile
    FilterChips.tsx     # Series constants + chip label helpers
scripts/
  generate.mjs          # icns → PNG/WebP + icons.json (macOS only)
.github/workflows/
  deploy.yml            # GitHub Pages CI/CD
```
