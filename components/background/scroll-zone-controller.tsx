"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_ZONES } from "@/lib/scroll-zones";
import { setZoneColor } from "@/lib/particle-zone-color";

gsap.registerPlugin(ScrollTrigger);

// Renders nothing — just registers one ScrollTrigger per section so the
// particle background's color/tone shifts as each zone enters view.
export function ScrollZoneController() {
  useEffect(() => {
    const triggers = SCROLL_ZONES.map((zone) => {
      const el = document.getElementById(zone.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onEnter: () => setZoneColor(zone.color),
        onEnterBack: () => setZoneColor(zone.color),
      });
    });

    return () => {
      triggers.forEach((trigger) => trigger?.kill());
    };
  }, []);

  return null;
}
