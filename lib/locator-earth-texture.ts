import * as THREE from "three";

const WIDTH = 2048;
const HEIGHT = 1024;

// Deterministic seeded RNG (fixed seed per caller) so this texture doesn't
// change between builds/renders.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// A handful of scattered hex "tracking reticles" — NOT a tiled lattice. A
// full-coverage hex grid at this texture's resolution reads as a dense
// opaque mesh that smothers the real photographic base underneath it; a
// sparse scatter of individual hex outlines keeps the "engineered tracking
// overlay" read without ever competing with the photo for attention.
function drawHexReticles(ctx: CanvasRenderingContext2D) {
  const rand = seededRandom(7);
  const count = 22;
  ctx.strokeStyle = "rgba(0, 240, 255, 0.14)";
  ctx.lineWidth = 1;

  for (let i = 0; i < count; i++) {
    const cx = rand() * WIDTH;
    const cy = 90 + rand() * (HEIGHT - 180); // keep clear of the poles
    const size = 10 + rand() * 10;
    ctx.beginPath();
    for (let v = 0; v < 6; v++) {
      const angle = (Math.PI / 3) * v + Math.PI / 6;
      const px = cx + size * Math.cos(angle);
      const py = cy + size * Math.sin(angle);
      if (v === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

// Short circuit-board style traces (a segment plus a "via" dot at each end),
// scattered pseudo-randomly across a much smaller footprint than before —
// sparse accents, not a texture-filling pattern.
function drawCircuitTraces(ctx: CanvasRenderingContext2D) {
  const rand = seededRandom(42);
  const traceCount = 70;
  ctx.strokeStyle = "rgba(0, 240, 255, 0.22)";
  ctx.fillStyle = "rgba(160, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;

  for (let i = 0; i < traceCount; i++) {
    const x = rand() * WIDTH;
    const y = rand() * HEIGHT;
    const segments = 1 + Math.floor(rand() * 3);
    let cx = x;
    let cy = y;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < segments; s++) {
      const horizontal = rand() > 0.5;
      const len = 14 + rand() * 34;
      cx += horizontal ? (rand() > 0.5 ? len : -len) : 0;
      cy += !horizontal ? (rand() > 0.5 ? len : -len) : 0;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLatLongGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(0, 240, 255, 0.14)";
  ctx.lineWidth = 1.5;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * HEIGHT;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
}

// Pure decorative overlay — sparse hex reticles + a few circuit traces +
// a thin lat/long grid on a transparent background. Meant to sit on a shell
// just outside the real photographic globe (see LocatorGlobeScene),
// additively blended at low opacity, so the real Earth photo stays the
// dominant layer and this only adds a light "tech HUD" read on top of it.
export function createTechOverlayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawHexReticles(ctx);
  drawCircuitTraces(ctx);
  drawLatLongGrid(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
