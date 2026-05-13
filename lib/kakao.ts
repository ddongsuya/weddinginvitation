import { weddingData } from "./data";
import { resolveSiteUrl } from "./site-url";

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

// Build a Google Calendar "Add Event" URL.
// Wedding day spec: 2026-08-29 12:30 KST (= 03:30 UTC), 2-hour event.
function buildCalendarUrl(): string {
  const title = `${weddingData.groom.name} ♥ ${weddingData.bride.name} 결혼식`;
  const details = `${weddingData.date.display}\n${weddingData.venue.name} ${weddingData.venue.hall}`;
  const location = `${weddingData.venue.name}, ${weddingData.venue.address}`;
  // UTC times so the event lands at 12:30 KST regardless of viewer's timezone
  const start = "20260829T033000Z";
  const end = "20260829T053000Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function shareInvitation(): Promise<void> {
  try {
    const kakao = await loadKakaoSdk();
    const siteUrl = resolveSiteUrl();
    const targetUrl = `${siteUrl}/`;
    const imageUrl = `${siteUrl}${weddingData.slides[0].src}`;
    const calendarUrl = buildCalendarUrl();

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
        {
          title: "일정 등록하기",
          link: { mobileWebUrl: calendarUrl, webUrl: calendarUrl },
        },
      ],
    });
  } catch (err) {
    // Silent fail — environment issue, no user action available
    console.warn("Kakao share unavailable:", err);
  }
}
