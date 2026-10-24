"use client";

import { ATMOSPHERE_GLOW_MS } from "@/lib/locator-coords";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// Disguises the handoff from the solar-system scene to the close Earth/
// globe scene (which is already mounted and rendering underneath by the
// time this appears — see LocatorIntro). Three distinct beats: dark space
// (nothing rendered here), a blue atmospheric limb-glow, then a thick
// cloud-blur pass, each snapping in on its own CSS animation rather than
// cross-fading into the next, before clearing to reveal the globe.
export function LocatorAtmosphereTransition() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className="animate-fade-in pointer-events-none absolute inset-0 bg-accent/10"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="animate-atmosphere-glow absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, rgba(0,240,255,0.05) 0%, rgba(0,180,255,0.35) 55%, rgba(0,120,220,0.65) 100%)",
        }}
      />
      <div
        className="animate-atmosphere-clouds absolute inset-0"
        style={{
          animationDelay: `${ATMOSPHERE_GLOW_MS}ms`,
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.98) 0%, rgba(235,240,245,0.9) 45%, rgba(200,215,225,0.4) 75%, rgba(200,215,225,0) 100%)",
        }}
      />
    </div>
  );
}
