import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Disable SW in dev to avoid caching confusion during development
  disable:
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_DISABLE_SERWIST === "1",
});

// Set NEXT_PUBLIC_BASE_PATH=/your-repo-name when deploying to a GitHub
// project page (username.github.io/repo-name). Leave empty for custom domains.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default process.env.NEXT_DISABLE_SERWIST === "1"
  ? nextConfig
  : withSerwist(nextConfig);
