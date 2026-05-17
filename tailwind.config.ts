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
        // User asked for the handwriting font to apply to EVERYTHING.
        // Nanum 내아내의 손글씨 is now the primary across serif / sans
        // / hand utility classes; Gowun Batang stays as a fallback for
        // the brief window between first paint and the .ttf streaming
        // in (next/font is set to display: swap, preload: false).
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
