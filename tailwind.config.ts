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
        serif: ["var(--font-gowun-batang)", "Noto Serif KR", "serif"],
        sans: ["var(--font-gowun-batang)", "Noto Serif KR", "serif"],
        // Handwritten — names, big dates, hero titles, decorative
        // headlines. Falls back to Gowun Batang until the .ttf streams
        // in (preload: false in app/layout.tsx).
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
