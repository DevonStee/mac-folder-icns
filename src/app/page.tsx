import { Suspense } from "react";
import iconsData from "@/data/icons.json";
import IconCanvas from "@/components/IconCanvas";
import type { IconMeta } from "@/components/IconCard";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const githubRaw = process.env.NEXT_PUBLIC_GITHUB_RAW;

const icons: IconMeta[] = iconsData.map((icon) => ({
  slug: icon.slug,
  rawSeries: icon.rawSeries,
  series: icon.series,
  displayName: icon.displayName,
  // Production: GitHub Raw 512px PNG (sharp on Retina, lazy loaded per cell)
  // Dev: local WebP thumb (fast local serve)
  thumb: githubRaw
    ? `${githubRaw}/previews/${icon.slug}.png`
    : `${basePath}${icon.thumb}`,
}));

export default function HomePage() {
  return (
    // Suspense required by useSearchParams inside IconCanvas
    <Suspense>
      <IconCanvas icons={icons} />
    </Suspense>
  );
}
