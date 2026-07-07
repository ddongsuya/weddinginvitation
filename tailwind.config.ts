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
        // FIX(타이포 위계): 손글씨 전면 사용 → 용도 분리.
        //  - serif / sans (본문·주소·계좌번호·전화번호·캡션): Gowun Batang.
        //    숫자와 긴 한글 정보를 정확히 읽고 옮겨 적을 수 있어야 하는 영역.
        //  - hand (제목·이름·감성 문구): 나눔 내아내의 손글씨 유지.
        // 기존 컴포넌트의 font-hand 사용처(히어로 타이틀, 메뉴 라벨,
        // 이름, 섹션 제목)는 그대로 손글씨로 렌더링됨 — 코드 수정 불필요.
        serif: [
          "var(--font-gowun-batang)",
          "Noto Serif KR",
          "serif",
        ],
        sans: [
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
