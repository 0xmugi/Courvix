import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Courvix — Sports Club Management",
  description: "Run your club. Grow your team. Power your sport.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head><link rel="stylesheet" href="/manrope-font.css" /></head><body className="antialiased">{children}</body>
    </html>
  );
}


