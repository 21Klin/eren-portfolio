import * as THREE from "three";

// A simple soft radial gradient (white core -> transparent edge), reused at
// different mesh scales/opacities to build the sun's stacked corona layers
// without needing a custom shader per layer.
export function createRadialGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,244,214,0.6)");
  gradient.addColorStop(0.7, "rgba(255,200,120,0.18)");
  gradient.addColorStop(1, "rgba(255,180,80,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
