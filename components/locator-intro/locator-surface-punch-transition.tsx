"use client";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// Disguises the handoff from the globe scene (camera diving toward the
// surface, see the "punch" GlobeStage in locator-globe-scene.tsx) into the
// wireframe city scene that follows — an expanding cyan breach ring, then a
// brief white flash right at the end to mask the actual Canvas swap, same
// snap-don't-crossfade approach as LocatorAtmosphereTransition.
export function LocatorSurfacePunchTransition() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className="animate-fade-in pointer-events-none absolute inset-0 bg-accent/20"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="animate-breach-ring absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-accent"
        style={{ boxShadow: "0 0 60px 10px rgba(0,240,255,0.35)" }}
      />
      <div className="animate-breach-flash absolute inset-0 bg-white" />
    </div>
  );
}
