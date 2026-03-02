import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

// This declares the `self.__SW_MANIFEST` injected by @serwist/next at build time.
declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const MAX_PREVIEW_ENTRIES = 600;
const CACHE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      matcher: /^\/previews\//,
      handler: new CacheFirst({
        cacheName: "icon-previews",
        plugins: [
          new ExpirationPlugin({
            maxEntries: MAX_PREVIEW_ENTRIES,
            maxAgeSeconds: CACHE_MAX_AGE_SECONDS,
          }),
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) {
                return response;
              }
              return null;
            },
          },
        ],
      }),
    },
    {
      matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
      handler: new StaleWhileRevalidate({
        cacheName: "fonts",
      }),
    },
  ],
});

serwist.addEventListeners();
