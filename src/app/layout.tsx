import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fold Icons",
  description: "A collection of macOS folder icons",
  // PWA manifest is auto-linked via app/manifest.ts
  appleWebApp: {
    capable: true,
    title: "Fold Icons",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FEFCF7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("theme");
    const theme = stored === "dark" || stored === "light" ? stored : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    // ignore
  }
})();
`;

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Apple PWA icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className="antialiased"
        style={{ background: "var(--page-bg)", color: "var(--title-color)" }}
      >
        {children}
      </body>
    </html>
  );
}
