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
  title: "임정모 ♥ 최화형 결혼합니다",
  description:
    "2026년 8월 29일 토요일 낮 12시 30분, 히든베이 호텔에서 결혼식이 있습니다.",
  openGraph: {
    title: "임정모 ♥ 최화형 결혼합니다",
    description: "2026년 8월 29일 토요일 낮 12시 30분",
    type: "website",
    url: "/",
    images: [
      {
        url: "/photos/main01.jpg",
        width: 1080,
        height: 1920,
        alt: "임정모 ♥ 최화형 결혼식 청첩장",
      },
    ],
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
