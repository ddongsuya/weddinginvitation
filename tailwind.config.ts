import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        muted: "var(--muted)",
      },
      fontFamily: {
        // 사용자 요청: 손글씨(나눔 내아내의 손글씨)를 본문 포함 전면 적용.
        // serif / sans / hand 모두 손글씨를 우선으로 하고, Gowun Batang은
        // 폰트 스트리밍 전 첫 페인트용 폴백으로만 둔다
        // (next/font display: swap).
        serif: [
          "var(--font-nanum-hand)",
          "var(--font-gowun-batang)",
          "Noto Serif KR",
          "serif",
        ],
        sans: [
          "var(--font-nanum-hand)",
          "var(--font-gowun-batang)",
          "Noto Serif KR",
          "serif",
        ],
        hand: [
          "var(--font-nanum-hand)",
          "var(--font-gowun-batang)",
          "Gowun Batang",
          "serif",
        ],
      },
      maxWidth: {
        invitation: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
