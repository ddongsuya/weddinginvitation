import type { Metadata } from "next";

// The page itself is a client component and can't export metadata, so the
// /onepage OG lives here. Crucially og:url points at /onepage (not the
// root the app-wide default uses) so link-preview scrapers — KakaoTalk in
// particular — treat the one-page link as self-canonical and attach the
// thumbnail to THIS url instead of bouncing to the multi-page root.
export const metadata: Metadata = {
  title: "임정모♥최화형 ver.2",
  alternates: { canonical: "/onepage" },
  openGraph: {
    title: "임정모♥최화형 ver.2",
    description: "2026.08.29 (토) 12:30 여수히든베이호텔",
    type: "website",
    url: "/onepage",
    images: [
      {
        url: "/photos/share-card-v4.jpg",
        width: 1200,
        height: 630,
        alt: "임정모 ♥ 최화형 결혼식 청첩장",
      },
    ],
  },
};

export default function OnePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
