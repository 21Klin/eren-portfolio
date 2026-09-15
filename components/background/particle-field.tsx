"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ACCENT_COLOR } from "@/lib/theme";

const PARTICLE_COUNT = 900;
const SPREAD = 12;
const DRIFT_AMPLITUDE = 0.15;
const REPEL_RADIUS = 1.4;
const REPEL_STRENGTH = 0.6;

function useParticleBase(count: number, spread: number) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      phases[i * 2] = Math.random() * Math.PI * 2;
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
  const { positions: basePositions, phases } = useParticleBase(
    PARTICLE_COUNT,
    SPREAD,
  );
  const livePositions = useMemo(
    () => new Float32Array(basePositions),
    [basePositions],
  );
  const pointsRef = useRef<THREE.Points>(null);
  const cursorNDC = useCursorNDC();
  const unprojected = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const { camera, clock } = state;
    const t = clock.elapsedTime;

    unprojected
      .set(cursorNDC.current.x, cursorNDC.current.y, 0.5)
      .unproject(camera);
    const dir = unprojected.sub(camera.position).normalize();
    const dist = dir.z !== 0 ? -camera.position.z / dir.z : 0;
    const cursorX = camera.position.x + dir.x * dist;
    const cursorY = camera.position.y + dir.y * dist;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
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

      livePositions[i * 3] = x;
      livePositions[i * 3 + 1] = y;
      livePositions[i * 3 + 2] = bz;
    }

    const attribute = pointsRef.current?.geometry.attributes.position as
      | THREE.BufferAttribute
      | undefined;
    if (attribute) attribute.needsUpdate = true;
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
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ParticlePoints />
      </Canvas>
    </div>
  );
}
