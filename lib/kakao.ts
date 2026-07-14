import { weddingData } from "./data";
import { resolveSiteUrl } from "./site-url";
// (buildCalendarUrl was removed — calendar link now points at our own
// /calendar route which serves an iCalendar (.ics) file. See that route
// for the rationale; in short, Kakao's button link policy blocks
// external domains and .ics is the universal native-calendar format.)

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

// `path` is the invitation view to open when the card is tapped — "/" for
// the multi-page invite (default), "/onepage" for the single-scroll one.
// The card image is passed to Kakao directly, so the thumbnail shows
// regardless of any per-URL OG-scrape cache.
export async function shareInvitation(path: string = "/"): Promise<void> {
  try {
    const kakao = await loadKakaoSdk();
    const siteUrl = resolveSiteUrl();
    const targetUrl = `${siteUrl}${path}`;
    // The share image is a 1200×630 landscape file — KakaoTalk's chat
    // preview slot is locked to a 1.91:1 landscape aspect ratio and
    // crops any image that doesn't match (including portrait — verified
    // via Kakao's own debugger). This card is the user-provided
    // landscape couple photo, already 1200×630, used verbatim (no crop,
    // no re-encode) so it fills the slot edge-to-edge with nothing lost.
    // Filename is v4 (was v3) so Kakao's per-URL preview cache fetches
    // the new photo instead of serving the stale cached one.
    const imageUrl = `${siteUrl}/photos/share-card-v4.jpg`;
    // Same-domain endpoint that returns an .ics file. Kakao's button
    // link allowlist blocks external domains (google.com etc.), and
    // .ics is what triggers the OS-native "Add to Calendar" prompt —
    // iOS opens Apple Calendar, Android opens whatever the user set
    // as default. See app/calendar/route.ts.
    const calendarUrl = `${siteUrl}/calendar`;

    // Format the date as the spec asks: 2026.08.29 (토) 12:30 여수히든베이호텔
    const { year, month, day, hour, minute, weekday } = weddingData.date;
    const dateLine = `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} (${weekday.charAt(0)}) ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} 여수히든베이호텔`;

    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${weddingData.groom.name}♥${weddingData.bride.name}`,
        description: dateLine,
        imageUrl,
        // Match the file: 1200×630 landscape, the dimensions Kakao
        // expects for its large preview banner. ≥800 wide so big
        // preview fires; 1.91:1 ratio so no crop is applied.
        imageWidth: 1200,
        imageHeight: 630,
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
