"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ACCENT_COLOR } from "@/lib/theme";
import { zoneColor } from "@/lib/particle-zone-color";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";

const PARTICLE_COUNT_DESKTOP = 900;
const PARTICLE_COUNT_MOBILE = 320;
const SPREAD = 12;
const DRIFT_AMPLITUDE = 0.15;
const REPEL_RADIUS = 1.4;
const REPEL_STRENGTH = 0.6;
const FRAME_CAP_FPS = 60;
const FRAME_CAP_FPS_STATIC = 15; // reduced motion / mobile: color still tweens, positions don't

// This canvas runs behind the entire site for as long as someone's on the
// page, so cap it to a fixed rate instead of redrawing at the display's
// native refresh rate (which can be 120-240Hz on modern laptops) — pure
// battery/GPU cost for a decorative background. Requires frameloop="demand"
// on <Canvas>, since that's what stops it from auto-rendering every tick.
function useFrameCap(fps: number) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const interval = setInterval(invalidate, 1000 / fps);
    return () => clearInterval(interval);
  }, [invalidate, fps]);
}

function useParticleBase(count: number, spread: number) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      // Randomizing the field's layout once per [count, spread] pair (not
      // reactively every render) is the intended behavior — the React
      // Compiler purity rule can't see that useMemo already makes this a
      // one-time seed, not per-render nondeterminism.
      // eslint-disable-next-line react-hooks/purity -- one-time seed, memoized below
      positions[i * 3] = (Math.random() - 0.5) * spread;
      // eslint-disable-next-line react-hooks/purity -- one-time seed, memoized below
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      // eslint-disable-next-line react-hooks/purity -- one-time seed, memoized below
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      // eslint-disable-next-line react-hooks/purity -- one-time seed, memoized below
      phases[i * 2] = Math.random() * Math.PI * 2;
      // eslint-disable-next-line react-hooks/purity -- one-time seed, memoized below
      phases[i * 2 + 1] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, [count, spread]);
}

// The canvas is pointer-events-none (so it never blocks clicks), which means
// it receives no native pointer events for r3f's own pointer tracking —
// track the cursor globally instead.
function useCursorNDC() {
  const ndc = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      ndc.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      ndc.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return ndc;
}

function ParticlePoints() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const particleCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  const reducedMotion = usePrefersReducedMotion();
  const { positions: basePositions, phases } = useParticleBase(
    particleCount,
    SPREAD,
  );
  const livePositions = useMemo(
    () => new Float32Array(basePositions),
    [basePositions],
  );
  const pointsRef = useRef<THREE.Points>(null);
  const cursorNDC = useCursorNDC();
  const unprojected = useMemo(() => new THREE.Vector3(), []);

  // Reduced-motion users still see the field and its scroll-zone color
  // shifts — just no per-frame drift/repel, so a much lower cap suffices.
  useFrameCap(reducedMotion ? FRAME_CAP_FPS_STATIC : FRAME_CAP_FPS);

  // Mutates `livePositions` (a typed array, not React state) in place every
  // frame — the standard, performance-required R3F/Three.js buffer-attribute
  // update pattern. Allocating a fresh Float32Array per frame instead would
  // be a real perf regression for zero behavioral benefit.
  // eslint-disable-next-line react-hooks/immutability -- per-frame GPU buffer mutation, not React state
  useFrame((state) => {
    if (!reducedMotion) {
      const { camera, clock } = state;
      const t = clock.elapsedTime;

      unprojected
        .set(cursorNDC.current.x, cursorNDC.current.y, 0.5)
        .unproject(camera);
      const dir = unprojected.sub(camera.position).normalize();
      const dist = dir.z !== 0 ? -camera.position.z / dir.z : 0;
      const cursorX = camera.position.x + dir.x * dist;
      const cursorY = camera.position.y + dir.y * dist;

      for (let i = 0; i < particleCount; i++) {
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];
        const phaseX = phases[i * 2];
        const phaseY = phases[i * 2 + 1];

        let x = bx + Math.sin(t * 0.15 + phaseX) * DRIFT_AMPLITUDE;
        let y = by + Math.cos(t * 0.12 + phaseY) * DRIFT_AMPLITUDE;

        const dx = x - cursorX;
        const dy = y - cursorY;
        const distSq = dx * dx + dy * dy;
        if (distSq < REPEL_RADIUS * REPEL_RADIUS) {
          const d = Math.sqrt(distSq) || 0.001;
          const force = (1 - d / REPEL_RADIUS) * REPEL_STRENGTH;
          x += (dx / d) * force;
          y += (dy / d) * force;
        }

        // eslint-disable-next-line react-hooks/immutability -- per-frame GPU buffer mutation, not React state (see note above useFrame)
        livePositions[i * 3] = x;
        livePositions[i * 3 + 1] = y;
        livePositions[i * 3 + 2] = bz;
      }

      const attribute = pointsRef.current?.geometry.attributes.position as
        | THREE.BufferAttribute
        | undefined;
      if (attribute) attribute.needsUpdate = true;
    }

    const material = pointsRef.current?.material as
      | THREE.PointsMaterial
      | undefined;
    if (material) material.color.copy(zoneColor);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[livePositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={ACCENT_COLOR}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ParticlePoints />
      </Canvas>
    </div>
  );
}
