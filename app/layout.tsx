import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import localFont from "next/font/local";
import { NavShell } from "./components-home/NavShell";
import { resolveSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#b08968",
};

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun-batang",
  display: "swap",
});

// 나눔 내아내의 손글씨 — applied as `font-hand` to display-only text
// (names, hero titles, countdown numbers, the big date). Body text and
// labels stay on Gowun Batang so small-text legibility isn't sacrificed.
// preload: false because the .ttf is large (~5 MB) — letting it stream
// in after first paint keeps LCP fast; Gowun Batang shows as fallback
// until the swap.
const nanumHand = localFont({
  src: "./fonts/NanumNaEuiANaeSonGeurSsi.ttf",
  variable: "--font-nanum-hand",
  display: "swap",
  preload: false,
  weight: "400",
  style: "normal",
});

const SITE_URL = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "임정모♥최화형",
  description: "2026.08.29 (토) 12:30 여수히든베이호텔",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "결혼 청첩장",
  },
  applicationName: "임정모 ♥ 최화형 결혼 청첩장",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    title: "임정모♥최화형",
    description: "2026.08.29 (토) 12:30 여수히든베이호텔",
    type: "website",
    url: "/",
    images: [
      {
        // 1200×630 landscape — see scripts/build-og-thumbnail.mjs.
        // Matches Kakao/FB/Twitter card aspect so no cropping happens
        // in any link-preview slot. Keep filename in lockstep with
        // lib/kakao.ts (the build script writes here too).
        url: "/photos/share-card-v2.jpg",
        width: 1200,
        height: 630,
        alt: "임정모 ♥ 최화형 결혼식 청첩장",
      },
    ],
  },
  other: {
    // Android Chrome — opens fullscreen when added to home screen
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${gowunBatang.variable} ${nanumHand.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
