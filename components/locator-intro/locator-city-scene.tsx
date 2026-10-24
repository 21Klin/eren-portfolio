"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import { ACCENT_COLOR } from "@/lib/theme";
import { CITY_BUILD_MS } from "@/lib/locator-coords";
import { useMediaQuery } from "@/lib/use-media-query";

export type CityStage = "constructing" | "settled";

// Deterministic seeded RNG (fixed seed) so the skyline layout doesn't
// reshuffle between renders.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type BuildingSpec = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  delayFrac: number; // 0..1, position in the build-out sweep
};

const CELL = 0.85;

// A loose city-block grid around a small central plaza (where the target
// marker effectively "lands") — some lots deliberately skipped for streets/
// gaps rather than tiling every cell, and a couple of taller landmark towers
// near the center so the skyline reads as a real place, not a uniform grid
// of identical blocks.
function generateCity(gridSize: number): BuildingSpec[] {
  const rand = seededRandom(1337);
  const specs: BuildingSpec[] = [];
  const half = (gridSize - 1) / 2;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gz = 0; gz < gridSize; gz++) {
      const cx = gx - half;
      const cz = gz - half;
      const distFromCenter = Math.hypot(cx, cz);
      if (distFromCenter < 1.05 && rand() > 0.25) continue; // central plaza
      if (rand() < 0.14) continue; // scattered empty lots / streets

      const w = CELL * (0.48 + rand() * 0.34);
      const d = CELL * (0.48 + rand() * 0.34);
      const isLandmark = distFromCenter < 2.1 && rand() < 0.22;
      const h = isLandmark ? 1.9 + rand() * 1.1 : 0.32 + rand() * 0.95;
      const z = cz * CELL;
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);

      specs.push({ x: cx * CELL, z, w, d, h, delayFrac: 0 });
    }
  }

  const span = Math.max(0.001, maxZ - minZ);
  return specs.map((spec) => ({
    ...spec,
    delayFrac: (spec.z - minZ) / span,
  }));
}

function GridFloor({ size }: { size: number }) {
  const fine = useMemo(() => {
    const grid = new THREE.GridHelper(size, size * 4, ACCENT_COLOR, ACCENT_COLOR);
    const material = grid.material as THREE.LineBasicMaterial;
    material.transparent = true;
    material.opacity = 0.08;
    return grid;
  }, [size]);
  const bold = useMemo(() => {
    const grid = new THREE.GridHelper(size, size, ACCENT_COLOR, ACCENT_COLOR);
    const material = grid.material as THREE.LineBasicMaterial;
    material.transparent = true;
    material.opacity = 0.22;
    return grid;
  }, [size]);

  return (
    <>
      <primitive object={fine} />
      <primitive object={bold} />
    </>
  );
}

function Building({ spec, reducedMotion }: { spec: BuildingSpec; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(spec.w, spec.h, spec.d);
    box.translate(0, spec.h / 2, 0);
    return new THREE.EdgesGeometry(box);
  }, [spec.w, spec.h, spec.d]);
  const fillGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(spec.w * 0.985, spec.h * 0.99, spec.d * 0.985);
    box.translate(0, (spec.h * 0.99) / 2, 0);
    return box;
  }, [spec.w, spec.h, spec.d]);

  useEffect(() => {
    if (!groupRef.current) return;
    if (reducedMotion) {
      groupRef.current.scale.set(1, 1, 1);
      return;
    }
    groupRef.current.scale.set(1, 0, 1);
    const delayMs = spec.delayFrac * CITY_BUILD_MS * 0.72;
    const riseMs = 320 + Math.random() * 220;
    const tween = gsap.to(groupRef.current.scale, {
      y: 1,
      duration: riseMs / 1000,
      delay: delayMs / 1000,
      ease: "back.out(1.7)",
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot rise-in on mount
  }, []);

  return (
    <group ref={groupRef} position={[spec.x, 0, spec.z]}>
      <mesh geometry={fillGeometry}>
        <meshBasicMaterial color="#001217" transparent opacity={0.65} depthWrite />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={ACCENT_COLOR} transparent opacity={0.85} />
      </lineSegments>
    </group>
  );
}

// A bright horizontal band sweeping across the grid in sync with the
// buildings' z-ordered stagger — visually ties the construction to a single
// moving "system building this" cause rather than buildings just randomly
// popping up.
function ScanSweep({ size, reducedMotion }: { size: number; reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    if (!meshRef.current || !materialRef.current) return;
    if (reducedMotion) {
      materialRef.current.opacity = 0;
      return;
    }
    const half = size / 2;
    meshRef.current.position.z = -half;
    const tl = gsap.timeline();
    tl.to(materialRef.current, { opacity: 0.5, duration: 0.15 })
      .to(
        meshRef.current.position,
        { z: half, duration: (CITY_BUILD_MS * 0.85) / 1000, ease: "none" },
        0,
      )
      .to(materialRef.current, { opacity: 0, duration: 0.3 }, `-=0.3`);
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot sweep on mount
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[size, 0.16]} />
      <meshBasicMaterial
        ref={materialRef}
        color={ACCENT_COLOR}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const CAMERA_START = new THREE.Vector3(0, 0.32, 0.6);
const CAMERA_END = new THREE.Vector3(0.4, 3.1, 5.4);
const LOOK_TARGET = new THREE.Vector3(0, 0.4, 0);

function CityCamera({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera);
  const idlePhaseRef = useRef(0);
  const settledRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      camera.position.copy(CAMERA_END);
      camera.lookAt(LOOK_TARGET);
      settledRef.current = true;
      return;
    }
    camera.position.copy(CAMERA_START);
    camera.lookAt(LOOK_TARGET);
    const state = { t: 0 };
    const tween = gsap.to(state, {
      t: 1,
      duration: (CITY_BUILD_MS + 500) / 1000,
      delay: 0.1,
      ease: "power2.out",
      onUpdate: () => {
        camera.position.lerpVectors(CAMERA_START, CAMERA_END, state.t);
        camera.lookAt(LOOK_TARGET);
      },
      onComplete: () => {
        settledRef.current = true;
      },
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot camera move on mount
  }, [camera]);

  // Gentle idle sway once settled, so the finished skyline doesn't feel
  // frozen behind the 2D HUD that crossfades in over it.
  useFrame((_, delta) => {
    if (reducedMotion || !settledRef.current) return;
    idlePhaseRef.current += delta * 0.15;
    const radius = Math.hypot(CAMERA_END.x, CAMERA_END.z);
    const baseAngle = Math.atan2(CAMERA_END.z, CAMERA_END.x);
    const angle = baseAngle + Math.sin(idlePhaseRef.current) * 0.06;
    camera.position.set(Math.cos(angle) * radius, CAMERA_END.y, Math.sin(angle) * radius);
    camera.lookAt(LOOK_TARGET);
  });

  return null;
}

function CityBloom({ isMobile }: { isMobile: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={isMobile ? 0.35 : 0.65}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
    </EffectComposer>
  );
}

export function LocatorCityScene({
  stage,
  reducedMotion,
}: {
  stage: CityStage;
  reducedMotion: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const gridSize = isMobile ? 5 : 7;
  const [buildings] = useState(() => generateCity(gridSize));
  const floorSize = gridSize * CELL + CELL;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${
        stage === "settled" ? "opacity-25" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [CAMERA_START.x, CAMERA_START.y, CAMERA_START.z], fov: 52 }}
        dpr={[1, isMobile ? 1.25 : 1.75]}
        gl={{ antialias: true, alpha: true }}
        resize={{ debounce: 0 }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000308", 3, floorSize * 1.6]} />
        <GridFloor size={floorSize} />
        <ScanSweep size={floorSize} reducedMotion={reducedMotion} />
        {buildings.map((spec, i) => (
          <Building key={i} spec={spec} reducedMotion={reducedMotion} />
        ))}
        <Sparkles
          count={isMobile ? 120 : 300}
          scale={[floorSize, 1.8, floorSize]}
          size={1.4}
          speed={reducedMotion ? 0 : 0.1}
          color={ACCENT_COLOR}
          opacity={0.35}
        />
        <CityCamera reducedMotion={reducedMotion} />
        <CityBloom isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
