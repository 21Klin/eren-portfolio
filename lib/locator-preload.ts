"use client";

import { useEffect, useState } from "react";
import {
  EARTH_TEXTURE_URL,
  PLANETS,
  SATURN_RING_ALPHA_URL,
  SUN_TEXTURE_URL,
} from "@/lib/locator-coords";

// Every raster asset the locator intro can possibly show, deduped — planet
// and sun textures, the Saturn ring alpha map, the globe's Earth day-map,
// and the three photo-reveal images. Warming the browser's own HTTP/image
// cache for all of these before the sequence starts is what eliminates the
// "asteroids pop in before the planets" stutter: by the time each Canvas's
// useTexture() call fires, the bytes are already local.
const PHOTO_URLS = [
  "/assets/locator-intro/full_scene_wide.png",
  "/assets/locator-intro/eren_target_crop.jpg",
  "/assets/locator-intro/eren_face_crop.jpg",
];

export const LOCATOR_PRELOAD_URLS: string[] = Array.from(
  new Set([
    SUN_TEXTURE_URL,
    SATURN_RING_ALPHA_URL,
    EARTH_TEXTURE_URL,
    ...PLANETS.map((p) => p.textureUrl),
    ...PHOTO_URLS,
  ]),
);

// A hard ceiling on how long the loading gate will wait — a slow connection
// or a single failed asset should never strand the visitor on a black
// screen forever. Past this, the sequence starts anyway; whatever hasn't
// landed yet will just fall back to the normal Suspense placeholder.
const PRELOAD_TIMEOUT_MS = 8000;

export function useLocatorPreload() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const total = LOCATOR_PRELOAD_URLS.length;

    const bump = () => {
      loaded += 1;
      if (cancelled) return;
      setProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) setReady(true);
    };

    const images = LOCATOR_PRELOAD_URLS.map((url) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump;
      img.src = url;
      return img;
    });

    const failsafe = setTimeout(() => {
      if (cancelled) return;
      setProgress(100);
      setReady(true);
    }, PRELOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  return { ready, progress };
}
