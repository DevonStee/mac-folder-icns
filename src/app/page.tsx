import { Suspense } from "react";
import iconsData from "@/data/icons.json";
import IconCanvas from "@/components/IconCanvas";
import type { IconMeta } from "@/components/IconCard";

const icons: IconMeta[] = iconsData.map((icon) => ({
  slug: icon.slug,
  rawSeries: icon.rawSeries,
  series: icon.series,
  displayName: icon.displayName,
}));

export default function HomePage() {
  return (
    // Suspense required by useSearchParams inside IconCanvas
    <Suspense>
      <IconCanvas icons={icons} />
    </Suspense>
  );
}
