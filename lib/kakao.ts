import { weddingData } from "./data";

interface KakaoShareApi {
  Share: {
    sendDefault: (opts: unknown) => void;
  };
  isInitialized: () => boolean;
  init: (key: string) => void;
}

declare global {
  interface Window {
    Kakao?: KakaoShareApi;
  }
}

const SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

export function loadKakaoSdk(): Promise<KakaoShareApi> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("not in browser"));
      return;
    }
    const key = process.env.NEXT_PUBLIC_KAKAO_KEY;
    if (!key) {
      reject(new Error("NEXT_PUBLIC_KAKAO_KEY not set"));
      return;
    }

    const initIfNeeded = (kakao: KakaoShareApi) => {
      if (!kakao.isInitialized()) kakao.init(key);
      resolve(kakao);
    };

    if (window.Kakao) {
      initIfNeeded(window.Kakao);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.Kakao) initIfNeeded(window.Kakao);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => {
      if (window.Kakao) initIfNeeded(window.Kakao);
      else reject(new Error("Kakao SDK not available after load"));
    };
    script.onerror = () => reject(new Error("Failed to load Kakao SDK"));
    document.head.appendChild(script);
  });
}

export async function shareInvitation(): Promise<void> {
  try {
    const kakao = await loadKakaoSdk();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const targetUrl = `${siteUrl}/`;
    const imageUrl = `${siteUrl}${weddingData.photos.main}`;

    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${weddingData.groom.name} ♥ ${weddingData.bride.name} 결혼합니다`,
        description: weddingData.date.display,
        imageUrl,
        link: { mobileWebUrl: targetUrl, webUrl: targetUrl },
      },
      buttons: [
        {
          title: "청첩장 보기",
          link: { mobileWebUrl: targetUrl, webUrl: targetUrl },
        },
      ],
    });
  } catch (err) {
    console.error("Kakao share failed:", err);
    alert("카카오톡 공유를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
}
