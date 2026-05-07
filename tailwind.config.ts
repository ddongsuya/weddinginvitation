import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        muted: "var(--muted)",
      },
      fontFamily: {
        serif: ["var(--font-serif-kr)", "Noto Serif KR", "serif"],
        sans: ["var(--font-sans-kr)", "Apple SD Gothic Neo", "sans-serif"],
      },
      maxWidth: {
        invitation: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
