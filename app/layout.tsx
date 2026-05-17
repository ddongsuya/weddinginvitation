import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
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
        // ?v= cache-bust so Facebook/Twitter/Slack/etc. re-fetch the OG
        // preview the next time someone shares a link. Bump on thumbnail
        // updates; keep in lockstep with lib/kakao.ts.
        url: "/photos/og-thumbnail.jpg?v=2",
        width: 1080,
        height: 1080,
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
    <html lang="ko" className={gowunBatang.variable}>
      <body className="bg-background text-foreground antialiased">
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
