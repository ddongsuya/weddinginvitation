import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import localFont from "next/font/local";
import { NavShell } from "./components-home/NavShell";
import { resolveSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // FIX(줌 정책): maximumScale/minimumScale/userScalable 제거.
  // 텍스트 페이지에서 핀치줌(확대)을 허용 — 어르신 하객 가독성.
  // 갤러리 라이트박스의 사진 확대 방지는 해당 컴포넌트의
  // touch-action: none이 그대로 담당하므로 영향 없음.
  viewportFit: "cover",
  themeColor: "#b08968",
};

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun-batang",
  display: "swap",
});

// 나눔 내아내의 손글씨 — FIX(타이포 위계)에 따라 이제 font-hand
// (제목·이름·감성 문구) 전용. 본문/기능성 텍스트는 Gowun Batang.
// 서브셋 woff2는 사이트 고정 카피 기준으로 생성되므로 그대로 유효.
const nanumHand = localFont({
  src: "./fonts/NanumNaEuiANaeSonGeurSsi.subset.woff2",
  variable: "--font-nanum-hand",
  display: "swap",
  preload: true,
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
        url: "/photos/share-card-v2.jpg",
        width: 1200,
        height: 630,
        alt: "임정모 ♥ 최화형 결혼식 청첩장",
      },
    ],
  },
  other: {
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
