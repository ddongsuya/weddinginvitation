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
      },
      maxWidth: {
        invitation: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
