import type { Metadata } from "next";
import { Gowun_Batang } from "next/font/google";
import { NavShell } from "./components-home/NavShell";
import "./globals.css";

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun-batang",
  display: "swap",
});

function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return /^https?:\/\//.test(explicit) ? explicit : `https://${explicit}`;
  }
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return "http://localhost:3000";
}

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
        url: "/photos/main.png",
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
