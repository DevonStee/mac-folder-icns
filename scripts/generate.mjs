/**
 * generate.mjs
 *
 * Converts all .icns files in icns_products/ to:
 *   1. 512×512 PNG previews  (for full-size download / detail view)
 *   2. 128×128 WebP thumbnails  (for the grid — much smaller payload)
 *
 * Writes src/data/icons.json with metadata including thumb paths.
 *
 * Prerequisites: macOS (uses `sips`), `cwebp` (brew install webp).
 * Usage: node scripts/generate.mjs
 */

import { execSync } from "child_process";
import { readdirSync, mkdirSync, existsSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICNS_DIR = join(ROOT, "icns_products");
const PREVIEWS_DIR = join(ROOT, "public", "previews");
const ICNS_PUBLIC_DIR = join(ROOT, "public", "icns");
const DATA_FILE = join(ROOT, "src", "data", "icons.json");

const THUMB_SIZE = 256;
const WEBP_QUALITY = 80;

// Series with 6+ icons get their own filter chip. Others go into meta-groups.
const NAMED_SERIES = new Set([
  "tube", "art", "eva", "rams", "kurgan", "hk", "claude", "gaudi",
  "zaha", "pure", "morandi", "baishi", "fusion", "philosophy", "mac",
  "hyper", "ysl", "vangogh", "film", "virgil", "vango", "rainbow",
  "nyc", "newson", "mosaic", "monet", "light", "hardware", "fukasawa", "3d",
]);

// Version-numbered prefixes → "archive" meta-group
const VERSION_RE = /^v\d+$/;
// Hex color (6 hex chars) → "color" meta-group
const HEX_RE = /^[0-9a-f]{6}$/i;

function parseName(filename) {
  const base = filename.replace(/^fold-icon-/, "").replace(/\.icns$/, "");
  const slug = filename.replace(/\.icns$/, "");

  if (HEX_RE.test(base)) {
    return { slug, rawSeries: "color", series: "color", displayName: `#${base.toUpperCase()}` };
  }

  const parts = base.split("-");
  const rawSeries = parts[0];

  let series;
  if (VERSION_RE.test(rawSeries)) {
    series = "archive";
  } else if (NAMED_SERIES.has(rawSeries)) {
    series = rawSeries;
  } else {
    series = rawSeries;
  }

  const rest = parts.slice(1).join(" ");
  const displayName = rest
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || rawSeries;

  return { slug, rawSeries, series, displayName };
}

function main() {
  if (!existsSync(ICNS_DIR)) {
    console.error(`❌  icns_products/ not found at ${ICNS_DIR}`);
    console.error("    Place your .icns files there and re-run.");
    process.exit(1);
  }

  // Verify cwebp is available
  try {
    execSync("which cwebp", { stdio: "pipe" });
  } catch {
    console.error("❌  cwebp not found. Install with: brew install webp");
    process.exit(1);
  }

  mkdirSync(PREVIEWS_DIR, { recursive: true });
  mkdirSync(ICNS_PUBLIC_DIR, { recursive: true });
  mkdirSync(dirname(DATA_FILE), { recursive: true });

  const files = readdirSync(ICNS_DIR).filter((f) => f.endsWith(".icns"));
  console.log(`🎯  Found ${files.length} .icns files`);

  const icons = [];
  let pngConverted = 0;
  let thumbConverted = 0;
  let skipped = 0;

  for (const file of files) {
    const src = join(ICNS_DIR, file);
    const { slug, rawSeries, series, displayName } = parseName(file);
    const pngPath = join(PREVIEWS_DIR, `${slug}.png`);
    const thumbPath = join(PREVIEWS_DIR, `${slug}-thumb.webp`);
    const icnsPublicPath = join(ICNS_PUBLIC_DIR, file);

    // Copy .icns → public/icns/ for direct download
    if (!existsSync(icnsPublicPath)) {
      copyFileSync(src, icnsPublicPath);
    }

    // Step 1: 512×512 PNG (original behavior)
    if (!existsSync(pngPath)) {
      try {
        execSync(
          `sips -s format png -z 512 512 "${src}" --out "${pngPath}"`,
          { stdio: "pipe" }
        );
        pngConverted++;
      } catch (err) {
        console.warn(`⚠️   Failed to convert ${file}: ${err.message}`);
        continue;
      }
    } else {
      skipped++;
    }

    // Step 2: 128×128 WebP thumbnail
    if (!existsSync(thumbPath)) {
      try {
        // sips to resize to temp PNG, then cwebp to compress
        const tmpResized = `/tmp/icns_thumb_${slug}.png`;
        execSync(
          `sips -s format png -z ${THUMB_SIZE} ${THUMB_SIZE} "${pngPath}" --out "${tmpResized}"`,
          { stdio: "pipe" }
        );
        execSync(
          `cwebp -q ${WEBP_QUALITY} -resize ${THUMB_SIZE} ${THUMB_SIZE} "${tmpResized}" -o "${thumbPath}"`,
          { stdio: "pipe" }
        );
        // Clean up temp file
        try { execSync(`rm "${tmpResized}"`, { stdio: "pipe" }); } catch {}
        thumbConverted++;
      } catch (err) {
        console.warn(`⚠️   Failed to create thumb for ${file}: ${err.message}`);
      }
    }

    icons.push({
      slug,
      rawSeries,
      series,
      displayName,
      preview: `/previews/${slug}.png`,
      thumb: `/previews/${slug}-thumb.webp`,
      icns: `/icns/${file}`,
    });
  }

  // Sort alphabetically by slug
  icons.sort((a, b) => a.slug.localeCompare(b.slug));

  writeFileSync(DATA_FILE, JSON.stringify(icons, null, 2));

  console.log(`📦  .icns copied to public/icns/`);
  console.log(`✅  PNG converted: ${pngConverted}  Skipped: ${skipped}`);
  console.log(`🖼️   Thumbs created: ${thumbConverted}`);
  console.log(`📄  Written: src/data/icons.json (${icons.length} entries)`);
  console.log(`\n🚀  Run: npm run dev`);
}

main();
