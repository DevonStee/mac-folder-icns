/**
 * Post-build cleanup: remove large files from out/ that are now served
 * via GitHub Raw URLs instead. Only keep WebP thumbnails locally.
 *
 * Removes from out/:
 *   - out/icns/          (462 MB — .icns files, downloaded from GitHub)
 *   - out/previews/*.png (96 MB  — full previews, loaded from GitHub)
 *
 * Keeps:
 *   - out/previews/*-thumb.webp  (2.6 MB — grid thumbnails, served locally)
 */

import { rm, readdir, unlink } from "fs/promises";
import { join } from "path";

const outDir = new URL("../out", import.meta.url).pathname;

// Remove the entire icns folder
await rm(join(outDir, "icns"), { recursive: true, force: true });
console.log("✓ Removed out/icns/");

// Remove PNG files from previews (keep -thumb.webp)
const previewsDir = join(outDir, "previews");
const files = await readdir(previewsDir);
let removed = 0;
for (const file of files) {
  if (file.endsWith(".png")) {
    await unlink(join(previewsDir, file));
    removed++;
  }
}
console.log(`✓ Removed ${removed} PNG files from out/previews/`);
