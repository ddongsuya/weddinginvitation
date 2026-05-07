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
  }) => unknown;
  LatLng: new (lat: number, lng: number) => unknown;
}

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
  return (
    <iframe
      src={src}
      title={markerLabel ?? "지도"}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export function NaverMap({
  lat,
  lng,
  zoom = 17,
  markerLabel,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    const SCRIPT_ID = "naver-maps-sdk";

    window.navermap_authFailure = () => {
      setAuthFailed(true);
    };

    const init = () => {
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
        });
      } catch {
        setAuthFailed(true);
      }
    };

    if (window.naver?.maps) {
      init();
      return;
    }

    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (existing) {
      const id = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(id);
          init();
        }
      }, 100);
      return () => clearInterval(id);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = init;
    script.onerror = () => setAuthFailed(true);
    document.head.appendChild(script);
  }, [clientId, lat, lng, zoom, markerLabel]);

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
