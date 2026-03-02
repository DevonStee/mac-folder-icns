export const NAMED_SERIES = [
  "tube", "art", "eva", "rams", "kurgan", "hk", "claude", "gaudi",
  "zaha", "pure", "morandi", "baishi", "fusion", "philosophy", "mac",
  "hyper", "ysl", "vangogh", "film", "virgil", "vango", "rainbow",
  "nyc", "newson", "mosaic", "monet", "light", "hardware", "fukasawa", "3d",
];

export const ALL_CHIPS = ["All", ...NAMED_SERIES, "color", "archive"];

export const CHIP_LABELS: Record<string, string> = {
  color: "Color",
  archive: "Archive",
  hk: "HK",
  ysl: "YSL",
  nyc: "NYC",
  "3d": "3D",
};

export function chipLabel(s: string): string {
  return CHIP_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
}
