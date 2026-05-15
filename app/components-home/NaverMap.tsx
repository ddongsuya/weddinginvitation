"use client";

import { useEffect, useRef, useState } from "react";

interface NaverMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markerLabel?: string;
  className?: string;
}

interface NaverMaps {
  Map: new (
    el: HTMLElement,
    opts: {
      center: unknown;
      zoom: number;
      minZoom?: number;
      zoomControl?: boolean;
    }
  ) => unknown;
  Marker: new (opts: {
    position: unknown;
    map: unknown;
    title?: string;
    icon?: {
      content?: string;
      url?: string;
      size?: { width: number; height: number };
      anchor?: { x: number; y: number };
    };
  }) => unknown;
  LatLng: new (lat: number, lng: number) => unknown;
}

// Inline SVG marker — bypasses ad-blockers that match marker-default.png
const MARKER_SVG = `
  <div style="position:relative;width:44px;height:54px;transform:translate(-22px,-54px);filter:drop-shadow(0 4px 8px rgba(0,0,0,0.25));">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 54" width="44" height="54">
      <path d="M22 0C9.85 0 0 9.85 0 22c0 16.5 22 32 22 32s22-15.5 22-32C44 9.85 34.15 0 22 0z" fill="#b08968"/>
      <circle cx="22" cy="22" r="9" fill="#fff"/>
      <circle cx="22" cy="22" r="4.5" fill="#b08968"/>
    </svg>
  </div>
`;

declare global {
  interface Window {
    naver?: { maps?: NaverMaps };
    navermap_authFailure?: () => void;
  }
}

function OsmFrame({
  lat,
  lng,
  className,
  markerLabel,
}: {
  lat: number;
  lng: number;
  className: string;
  markerLabel?: string;
}) {
  const bbox = `${lng - 0.0018},${lat - 0.0012},${lng + 0.0018},${lat + 0.0012}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  // OSM iframe shows an attribution bar at top + bottom. Crop both away
  // by negative-margin and hidden overflow on the wrapper.
  return (
    <div className={`${className} relative overflow-hidden`}>
      <iframe
        src={src}
        title={markerLabel ?? "지도"}
        className="absolute inset-x-0 -top-[40px] block w-full"
        style={{ height: "calc(100% + 80px)" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

// Session-scoped flag so we don't re-attempt Naver after a known auth
// failure. Set once when navermap_authFailure fires, then every subsequent
// NaverMap mount in this tab skips the SDK entirely (no script load, no
// console spam, no auth_fail.png blocked-by-client error). Cleared when
// the tab is closed.
const AUTH_FAIL_KEY = "naver_maps_auth_failed";

function readAuthFailFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(AUTH_FAIL_KEY) === "1";
  } catch {
    return false;
  }
}

function writeAuthFailFlag() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(AUTH_FAIL_KEY, "1");
  } catch {
    /* private mode / quota — best effort */
  }
}

export function NaverMap({
  lat,
  lng,
  zoom = 17,
  markerLabel,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Lazy initial — if this tab already saw an auth failure, start in the
  // OSM-fallback state on first render so we never inject the Naver
  // script again.
  const [authFailed, setAuthFailed] = useState(readAuthFailFlag);
  const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    if (authFailed) return; // Already known bad — skip SDK entirely.
    const SCRIPT_ID = "naver-maps-sdk";
    let cancelled = false;
    let pollId: number | undefined;

    const handleAuthFailure = () => {
      writeAuthFailFlag();
      setAuthFailed(true);
    };
    window.navermap_authFailure = handleAuthFailure;

    const init = () => {
      if (cancelled) return;
      const naverMaps = window.naver?.maps;
      if (!naverMaps || !mapRef.current) return;
      try {
        const map = new naverMaps.Map(mapRef.current, {
          center: new naverMaps.LatLng(lat, lng),
          zoom,
          zoomControl: true,
        });
        new naverMaps.Marker({
          position: new naverMaps.LatLng(lat, lng),
          map,
          title: markerLabel,
          icon: {
            content: MARKER_SVG,
          },
        });
      } catch {
        writeAuthFailFlag();
        setAuthFailed(true);
      }
    };

    if (window.naver?.maps) {
      init();
    } else {
      const existing = document.getElementById(
        SCRIPT_ID
      ) as HTMLScriptElement | null;
      if (existing) {
        pollId = window.setInterval(() => {
          if (window.naver?.maps) {
            clearInterval(pollId);
            pollId = undefined;
            init();
          }
        }, 100);
      } else {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
        script.async = true;
        script.onload = init;
        script.onerror = () => {
          writeAuthFailFlag();
          setAuthFailed(true);
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (pollId != null) clearInterval(pollId);
      // Only clear the handler if it's still ours — avoid clobbering a
      // subsequent NaverMap instance that already replaced it.
      if (window.navermap_authFailure === handleAuthFailure) {
        delete window.navermap_authFailure;
      }
    };
  }, [clientId, lat, lng, zoom, markerLabel, authFailed]);

  const wrapperClass = className ?? "block h-[360px] w-full sm:h-[420px]";

  if (!clientId || authFailed) {
    return (
      <OsmFrame
        lat={lat}
        lng={lng}
        className={wrapperClass}
        markerLabel={markerLabel}
      />
    );
  }

  return (
    <div
      ref={mapRef}
      className={wrapperClass}
      role="img"
      aria-label={markerLabel ?? "지도"}
    />
  );
}
