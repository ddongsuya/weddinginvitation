"use client";

import { useEffect, useState } from "react";

// Module-level cache shared across every hero mount in this session.
// The very first hero to mount measures `window.innerHeight` (and the
// visualViewport.height where supported) and stores the result here.
// Every subsequent hero — including each new subpage entered via the
// menu — pulls from this cache, so all heroes occupy the exact same
// number of pixels regardless of address-bar state at navigation time.
// Without this, iOS Safari's address bar can be in different visibility
// states between routes, making each hero a slightly different height
// and visibly shifting the SubpageHero number + title overlay.
let cachedHeroHeight: number | null = null;

export function useStableHeroHeight(): string {
  const [heroHeight, setHeroHeight] = useState<string>(
    cachedHeroHeight !== null ? `${cachedHeroHeight}px` : "100svh"
  );

  useEffect(() => {
    if (cachedHeroHeight !== null) {
      // Another hero already measured the viewport this session — just
      // adopt the cached pixel value. This is the path that fires on
      // every menu-driven subpage navigation after the first one.
      setHeroHeight(`${cachedHeroHeight}px`);
      return;
    }
    if (typeof window === "undefined") return;

    const innerH = window.innerHeight;
    const visualH = window.visualViewport?.height;
    const px = visualH ? Math.min(innerH, visualH) : innerH;
    cachedHeroHeight = px;
    setHeroHeight(`${px}px`);
  }, []);

  return heroHeight;
}
