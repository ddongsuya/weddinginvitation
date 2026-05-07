import type { Metadata } from "next";
import { Gowun_Batang } from "next/font/google";
import "./globals.css";

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun-batang",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "임정모 ♥ 최화형 결혼합니다",
  description:
    "2026년 8월 29일 토요일 낮 12시 30분, 히든베이 호텔에서 결혼식이 있습니다.",
  openGraph: {
    title: "임정모 ♥ 최화형 결혼합니다",
    description: "2026년 8월 29일 토요일 낮 12시 30분",
    type: "website",
    url: "/home",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
