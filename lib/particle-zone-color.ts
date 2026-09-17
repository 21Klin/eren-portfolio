import gsap from "gsap";
import * as THREE from "three";
import { ACCENT_COLOR } from "@/lib/theme";

// Shared mutable color the particle field reads every frame — driven by
// GSAP tweens from ScrollZoneController rather than React state, so a zone
// change never triggers a React re-render of the R3F tree.
export const zoneColor = new THREE.Color(ACCENT_COLOR);

const tweenTarget = { r: zoneColor.r, g: zoneColor.g, b: zoneColor.b };

export function setZoneColor(hex: string) {
  const target = new THREE.Color(hex);
  gsap.to(tweenTarget, {
    r: target.r,
    g: target.g,
    b: target.b,
    duration: 0.9,
    ease: "power2.out",
    onUpdate: () => {
      zoneColor.setRGB(tweenTarget.r, tweenTarget.g, tweenTarget.b);
    },
  });
}
