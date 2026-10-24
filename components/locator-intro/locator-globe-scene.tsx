"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import { ACCENT_COLOR } from "@/lib/theme";
import {
  EARTH_TEXTURE_URL,
  EUROPE_DIST,
  EUROPE_LAT,
  EUROPE_LON,
  FLIGHT_LEG1_MS,
  FLIGHT_LEG2_MS,
  FLIGHT_LEG3_MS,
  GLOBE_RADIUS,
  MACEDONIA_DIST,
  STRUGA_DIST,
  SURFACE_PUNCH_DIST,
  SURFACE_PUNCH_MS,
  TARGET_LAT,
  TARGET_LON,
  latLongToVector3,
} from "@/lib/locator-coords";
import { createTechOverlayTexture } from "@/lib/locator-earth-texture";
import { useMediaQuery } from "@/lib/use-media-query";

export type GlobeStage = "globe" | "flight" | "locked" | "punch";

const MARKER_LOCAL_POS = latLongToVector3(TARGET_LAT, TARGET_LON, GLOBE_RADIUS * 1.02);
const EUROPE_LOCAL_DIR = latLongToVector3(EUROPE_LAT, EUROPE_LON, 1);
const ROTATION_SPEED = 0.12;
const LATTICE_ROTATION_SPEED = -0.045;

// Real photographic day-map, very lightly cooled toward cyan (a
// MeshBasicMaterial's `color` multiplies per-channel with `map`) — light
// enough that real coastlines, terrain and cloud detail stay clearly
// legible; the "sci-fi tech" read comes from the wireframe/lattice/overlay
// layers and bloom on top of it, not from flattening the photo itself.
const GLOBE_TINT = new THREE.Color(ACCENT_COLOR).lerp(new THREE.Color("#ffffff"), 0.72);

// drei's useTexture (Suspense-based) rather than a hand-rolled
// THREE.TextureLoader — it's the standard, well-tested R3F loading path.
// Wrapped in <Suspense> below so the semi-transparent placeholder sphere
// shows until the real photo is ready, then swaps in automatically.
function EarthSphere() {
  // colorSpace deliberately left at drei's default (sRGB is already its
  // default for regular color textures) rather than set here — mutating a
  // value a hook returned is flagged by this project's lint rules, since
  // useTexture caches/shares texture instances by URL.
  const earthTexture = useTexture(EARTH_TEXTURE_URL);
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 48]} />
      <meshBasicMaterial map={earthTexture} color={GLOBE_TINT} />
    </mesh>
  );
}

function EarthSpherePlaceholder() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 48]} />
      <meshBasicMaterial color={ACCENT_COLOR} transparent opacity={0.15} />
    </mesh>
  );
}

function useTechOverlayTexture() {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const tex = createTechOverlayTexture();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- texture requires `document` (canvas), so it can only be built client-side in an effect; state gates the mesh's material until it's ready
    setTexture(tex);
    return () => tex.dispose();
  }, []);
  return texture;
}

// A geodesic wireframe shell, counter-rotating independently of the frozen
// globe group — a constant, decorative "scanning lattice" layer that keeps
// the sphere feeling alive even once the camera has locked on and the
// marker-bearing group below has stopped turning.
function TechLattice({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!reducedMotion && meshRef.current) {
      meshRef.current.rotation.y += delta * LATTICE_ROTATION_SPEED;
      meshRef.current.rotation.x += delta * LATTICE_ROTATION_SPEED * 0.4;
    }
  });
  return (
    <mesh ref={meshRef} scale={1.16}>
      <icosahedronGeometry args={[GLOBE_RADIUS, 1]} />
      <meshBasicMaterial color={ACCENT_COLOR} wireframe transparent opacity={0.1} />
    </mesh>
  );
}

function OrbitRing({
  radius,
  rotation,
  opacity,
}: {
  radius: number;
  rotation: [number, number, number];
  opacity: number;
}) {
  // Built as a plain THREE.LineLoop and dropped in via <primitive> — the
  // lowercase JSX <line> intrinsic collides with the DOM/SVG "line" element's
  // types in this project's JSX setup, so it can't take a "rotation" prop.
  const line = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.92, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(96).map((p) => new THREE.Vector3(p.x, 0, p.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: ACCENT_COLOR,
      transparent: true,
      opacity,
    });
    return new THREE.LineLoop(geometry, material);
  }, [radius, opacity]);

  return <primitive object={line} rotation={rotation} />;
}

function TargetMarker({
  stage,
  reducedMotion,
}: {
  stage: GlobeStage;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const circleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const quaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        MARKER_LOCAL_POS.clone().normalize(),
      ),
    [],
  );
  const visible = stage === "locked" || stage === "punch";

  useEffect(() => {
    if (stage !== "locked" || !groupRef.current) return;
    gsap.fromTo(
      groupRef.current.scale,
      { x: 2.6, y: 2.6, z: 2.6 },
      { x: 1, y: 1, z: 1, duration: 0.4, ease: "back.out(3)" },
    );
    if (ringMaterialRef.current) {
      gsap.fromTo(
        ringMaterialRef.current,
        { opacity: 0 },
        { opacity: 0.95, duration: 0.18 },
      );
    }
  }, [stage]);

  // "Flying through" the marker as the camera dives past the surface —
  // the ring rushes outward past the camera and fades, rather than just
  // sitting still while everything else moves around it.
  useEffect(() => {
    if (stage !== "punch" || !groupRef.current) return;
    if (reducedMotion) return;
    const duration = SURFACE_PUNCH_MS / 1000;
    gsap.to(groupRef.current.scale, {
      x: 5,
      y: 5,
      z: 5,
      duration,
      ease: "power2.in",
    });
    [ringMaterialRef.current, circleMaterialRef.current].forEach((mat) => {
      if (!mat) return;
      gsap.to(mat, { opacity: 0, duration: duration * 0.8, ease: "power1.in" });
    });
  }, [stage, reducedMotion]);

  return (
    <group
      ref={groupRef}
      position={MARKER_LOCAL_POS}
      quaternion={quaternion}
      visible={visible}
    >
      <mesh>
        <ringGeometry args={[0.13, 0.17, 6]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color={ACCENT_COLOR}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <circleGeometry args={[0.11, 6]} />
        <meshBasicMaterial
          ref={circleMaterialRef}
          color={ACCENT_COLOR}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function GlobeGroup({
  stage,
  reducedMotion,
  isMobile,
}: {
  stage: GlobeStage;
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const anchorRef = useRef<THREE.Object3D>(null);
  const camera = useThree((s) => s.camera);
  const overlayTexture = useTechOverlayTexture();
  const rotatingRef = useRef(true);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    if (stage !== "globe") rotatingRef.current = false;
  }, [stage]);

  useFrame((_, delta) => {
    if (rotatingRef.current && !reducedMotion && groupRef.current) {
      groupRef.current.rotation.y += delta * ROTATION_SPEED;
    }
  });

  // Three-leg flight, each leg strictly closer to Earth's center than the
  // last (see EUROPE_DIST/MACEDONIA_DIST/STRUGA_DIST — all < the globe
  // scene's own starting camera distance) so the zoom reads as continuous
  // narrowing: leg 1 finds the continent, leg 2 narrows onto the target's
  // exact bearing (still a country-level framing), leg 3 — triggered
  // separately below, on entering "locked" — makes the final approach into
  // Struga itself. Getting the ordering backwards here previously made the
  // "NORTH MACEDONIA" leg framing wider than where the camera already was,
  // reading as a zoom-out.
  useEffect(() => {
    if (stage !== "flight" || !groupRef.current || !anchorRef.current) return;

    groupRef.current.updateMatrixWorld(true);
    const targetWorld = new THREE.Vector3();
    anchorRef.current.getWorldPosition(targetWorld);
    const targetDir = targetWorld.clone().normalize();

    const europeWorldDir = EUROPE_LOCAL_DIR.clone()
      .applyQuaternion(groupRef.current.quaternion)
      .normalize();
    const europeCamPos = europeWorldDir.clone().multiplyScalar(GLOBE_RADIUS * EUROPE_DIST);
    const europeLookAt = europeWorldDir.clone().multiplyScalar(GLOBE_RADIUS * 0.9);

    const macedoniaCamPos = targetDir.clone().multiplyScalar(GLOBE_RADIUS * MACEDONIA_DIST);

    if (reducedMotion) {
      camera.position.copy(macedoniaCamPos);
      camera.lookAt(targetWorld);
      return;
    }

    const startPos = camera.position.clone();
    const startLook = new THREE.Vector3(0, 0, 0);
    const posVec = new THREE.Vector3();
    const lookVec = new THREE.Vector3();
    const leg1 = { t: 0 };
    const leg2 = { t: 0 };

    const tl = gsap.timeline();
    tl.to(leg1, {
      t: 1,
      duration: FLIGHT_LEG1_MS / 1000,
      ease: "power2.out",
      onUpdate: () => {
        posVec.lerpVectors(startPos, europeCamPos, leg1.t);
        lookVec.lerpVectors(startLook, europeLookAt, leg1.t);
        camera.position.copy(posVec);
        camera.lookAt(lookVec);
      },
    }).to(leg2, {
      t: 1,
      duration: FLIGHT_LEG2_MS / 1000,
      ease: "power2.inOut",
      onUpdate: () => {
        posVec.lerpVectors(europeCamPos, macedoniaCamPos, leg2.t);
        lookVec.lerpVectors(europeLookAt, targetWorld, leg2.t);
        camera.position.copy(posVec);
        camera.lookAt(lookVec);
      },
    });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per stage transition into "flight"
  }, [stage]);

  // Leg 3: the final approach into Struga specifically, triggered on
  // entering "locked" (previously this stage moved the camera not at all,
  // leaving only the small 2D HUD map inset to suggest arrival while the 3D
  // backdrop stayed at whatever distance leg 2 left it — now the backdrop
  // itself pushes in tight on the marker).
  useEffect(() => {
    if (stage !== "locked" || !anchorRef.current) return;

    anchorRef.current.updateMatrixWorld(true);
    const targetWorld = new THREE.Vector3();
    anchorRef.current.getWorldPosition(targetWorld);
    const strugaCamPos = targetWorld.clone().normalize().multiplyScalar(GLOBE_RADIUS * STRUGA_DIST);

    if (reducedMotion) {
      camera.position.copy(strugaCamPos);
      camera.lookAt(targetWorld);
      return;
    }

    const startPos = camera.position.clone();
    const posVec = new THREE.Vector3();
    const state = { t: 0 };

    const tl = gsap.timeline();
    tl.to(state, {
      t: 1,
      duration: FLIGHT_LEG3_MS / 1000,
      ease: "power2.out",
      onUpdate: () => {
        posVec.lerpVectors(startPos, strugaCamPos, state.t);
        camera.position.copy(posVec);
        camera.lookAt(targetWorld);
      },
    });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per stage transition into "locked"
  }, [stage]);

  // Leg 4: the "punch through the surface" dive — triggered on entering
  // "punch" (right after the lock hold), this is what makes the zoom go
  // *past* the surface rather than just stopping closer to it. Camera
  // accelerates (power2.in) almost onto the globe's own radius; the CSS
  // breach-flash overlay (see LocatorSurfacePunchTransition) covers the
  // hard cut into the wireframe city scene that follows.
  useEffect(() => {
    if (stage !== "punch" || !anchorRef.current) return;

    anchorRef.current.updateMatrixWorld(true);
    const targetWorld = new THREE.Vector3();
    anchorRef.current.getWorldPosition(targetWorld);
    const dir = targetWorld.clone().normalize();
    const breachPos = dir.clone().multiplyScalar(GLOBE_RADIUS * SURFACE_PUNCH_DIST);

    if (reducedMotion) {
      camera.position.copy(breachPos);
      camera.lookAt(targetWorld);
      return;
    }

    const startPos = camera.position.clone();
    const posVec = new THREE.Vector3();
    const state = { t: 0 };

    const tl = gsap.timeline();
    tl.to(state, {
      t: 1,
      duration: SURFACE_PUNCH_MS / 1000,
      ease: "power2.in",
      onUpdate: () => {
        posVec.lerpVectors(startPos, breachPos, state.t);
        camera.position.copy(posVec);
        camera.lookAt(targetWorld);
      },
    });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per stage transition into "punch"
  }, [stage]);

  return (
    <group ref={groupRef}>
      <object3D ref={anchorRef} position={MARKER_LOCAL_POS} />

      <Suspense fallback={<EarthSpherePlaceholder />}>
        <EarthSphere />
      </Suspense>

      {overlayTexture && (
        <mesh scale={1.006}>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 48]} />
          <meshBasicMaterial
            map={overlayTexture}
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      <mesh scale={1.05}>
        <sphereGeometry args={[GLOBE_RADIUS, 36, 26]} />
        <meshBasicMaterial color={ACCENT_COLOR} wireframe transparent opacity={0.12} />
      </mesh>

      <TechLattice reducedMotion={reducedMotion} />
      {!isMobile && (
        <>
          <OrbitRing radius={GLOBE_RADIUS * 1.5} rotation={[1.4, 0.2, 0.3]} opacity={0.18} />
          <OrbitRing radius={GLOBE_RADIUS * 1.68} rotation={[1.15, 0, 1.1]} opacity={0.12} />
          <OrbitRing radius={GLOBE_RADIUS * 1.85} rotation={[1.6, 0.5, -0.4]} opacity={0.15} />
        </>
      )}

      <TargetMarker stage={stage} reducedMotion={reducedMotion} />
    </group>
  );
}

function GlobeBloom({ isMobile }: { isMobile: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={isMobile ? 0.3 : 0.55}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
    </EffectComposer>
  );
}

export function LocatorGlobeScene({
  stage,
  reducedMotion,
}: {
  stage: GlobeStage;
  reducedMotion: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.9, 3.8], fov: 46 }}
        dpr={[1, isMobile ? 1.25 : 1.75]}
        gl={{ antialias: true, alpha: true }}
        resize={{ debounce: 0 }}
      >
        <GlobeGroup stage={stage} reducedMotion={reducedMotion} isMobile={isMobile} />
        <Sparkles
          count={isMobile ? 220 : 650}
          scale={GLOBE_RADIUS * 2.3}
          size={1.3}
          speed={reducedMotion ? 0 : 0.12}
          color={ACCENT_COLOR}
          opacity={0.5}
        />
        <Sparkles
          count={isMobile ? 220 : 550}
          scale={GLOBE_RADIUS * 3.8}
          size={2.4}
          speed={reducedMotion ? 0 : 0.16}
          color={ACCENT_COLOR}
          opacity={0.4}
        />
        <GlobeBloom isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
