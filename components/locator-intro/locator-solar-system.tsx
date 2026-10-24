"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { ACCENT_COLOR } from "@/lib/theme";
import {
  ASTEROID_BELT_INNER,
  ASTEROID_BELT_OUTER,
  EARTH_PLANET_INDEX,
  PLANETS,
  SATURN_RING_ALPHA_URL,
  SOLAR_EARTH_MS,
  SOLAR_WIDE_MS,
  SUN_RADIUS,
  SUN_TEXTURE_URL,
} from "@/lib/locator-coords";
import { createRadialGlowTexture } from "@/lib/locator-glow-texture";
import { useMediaQuery } from "@/lib/use-media-query";

export type SolarStage = "wide" | "earth";

const WIDE_CAMERA_RADIUS = 15;
const WIDE_CAMERA_HEIGHT = 6.5;
const WIDE_SWEEP = Math.PI * 0.65;

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

// ---------------------------------------------------------------------------
// Sun: an animated noise-turbulence shader (not a flat color) plus a
// multi-layer additive corona so it reads as a real star and dominates the
// scene's bloom, exactly like a real point light source should.
// ---------------------------------------------------------------------------

const sunVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Classic Ashima simplex 3D noise — compact, well-tested, no texture lookups.
const simplexNoiseGlsl = /* glsl */ `
  vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const sunFragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  varying vec2 vUv;
  ${simplexNoiseGlsl}
  void main() {
    vec3 base = texture2D(uMap, vUv).rgb;
    float n1 = snoise(vec3(vUv * 6.0, uTime * 0.08));
    float n2 = snoise(vec3(vUv * 16.0, uTime * 0.17 + 10.0));
    float turbulence = n1 * 0.6 + n2 * 0.4;
    vec3 cool = vec3(0.95, 0.33, 0.04);
    vec3 hot = vec3(1.0, 0.93, 0.68);
    vec3 color = mix(cool, hot, clamp(turbulence * 0.5 + 0.55, 0.0, 1.0));
    color *= (base * 0.55 + 0.55);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function Sun() {
  const sunTexture = useTexture(SUN_TEXTURE_URL);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const glowTexture = useMemo(() => createRadialGlowTexture(), []);

  const uniforms = useMemo(
    () => ({
      uMap: { value: sunTexture },
      uTime: { value: 0 },
    }),
    [sunTexture],
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS, 48, 32]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
        />
      </mesh>
      {/* Multi-layer additive corona: three stacked translucent sprites of
          decreasing opacity radiating outward, always facing the camera. */}
      <Billboard>
        {[
          { scale: SUN_RADIUS * 3.2, opacity: 0.55, color: "#ffb066" },
          { scale: SUN_RADIUS * 5.2, opacity: 0.3, color: "#ff8c3d" },
          { scale: SUN_RADIUS * 8, opacity: 0.15, color: "#ff7a2e" },
        ].map((layer, i) => (
          <mesh key={i}>
            <planeGeometry args={[layer.scale, layer.scale]} />
            <meshBasicMaterial
              map={glowTexture}
              color={layer.color}
              transparent
              opacity={layer.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </Billboard>
    </>
  );
}

function OrbitPath({ radius }: { radius: number }) {
  const line = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(96).map((p) => new THREE.Vector3(p.x, 0, p.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: ACCENT_COLOR,
      transparent: true,
      opacity: 0.15,
    });
    return new THREE.LineLoop(geometry, material);
  }, [radius]);

  return <primitive object={line} />;
}

// Real ring geometry with a proper radial UV remap (THREE.RingGeometry's
// default UVs don't line up with a radial-gradient texture out of the box —
// U needs to run 0→1 from inner to outer edge) so the alpha-mapped texture's
// banded structure (gaps like the Cassini Division, varying opacity) shows
// correctly instead of a single flat tint.
function SaturnRing({ radius }: { radius: number }) {
  const ringAlpha = useTexture(SATURN_RING_ALPHA_URL);
  const geometry = useMemo(() => {
    const inner = radius * 1.3;
    const outer = radius * 2.3;
    const geo = new THREE.RingGeometry(inner, outer, 96, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      uv.setXY(i, THREE.MathUtils.clamp((r - inner) / (outer - inner), 0, 1), 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [radius]);

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2.3, 0, 0]}>
      <meshStandardMaterial
        map={ringAlpha}
        alphaMap={ringAlpha}
        transparent
        side={THREE.DoubleSide}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

const rimVertexShader = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewPosition;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const rimFragmentShader = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewPosition;
  uniform vec3 uColor;
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float rim = 1.0 - max(dot(viewDir, vNormalV), 0.0);
    rim = pow(rim, 2.4);
    gl_FragColor = vec4(uColor, rim * 0.85);
  }
`;

// A slightly-oversized shell with a view-dependent Fresnel glow, brightest at
// the grazing edge — cheap stand-in for true rim lighting that keeps each
// planet from reading as a flat lit disc.
function PlanetRim({ radius, color }: { radius: number; color: string }) {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color(color) } }), [color]);
  return (
    <mesh scale={1.045}>
      <sphereGeometry args={[radius, 32, 24]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={rimVertexShader}
        fragmentShader={rimFragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function PlanetMaterial({ textureUrl }: { textureUrl: string }) {
  const texture = useTexture(textureUrl);
  return <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />;
}

// Real texture + lit material + rim glow. Orbits continuously unless
// `frozenRef` is provided and true — Earth is the only planet the camera
// ever needs to hold still next to, so it's the only one that passes one,
// read fresh every frame (a mutated ref doesn't trigger a re-render, so a
// boolean prop snapshotted from it would never actually flip once the scene
// stops re-rendering).
function Planet({
  index,
  isMobile,
  frozenRef,
}: {
  index: number;
  isMobile: boolean;
  frozenRef?: React.RefObject<boolean>;
}) {
  const data = PLANETS[index];
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef((index / PLANETS.length) * Math.PI * 2);

  useFrame((_, delta) => {
    if (!frozenRef?.current) {
      angleRef.current += data.orbitSpeed * delta;
    }
    if (orbitRef.current) {
      orbitRef.current.position.set(
        Math.cos(angleRef.current) * data.orbitRadius,
        0,
        Math.sin(angleRef.current) * data.orbitRadius,
      );
    }
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <>
      {!isMobile && <OrbitPath radius={data.orbitRadius} />}
      <group ref={orbitRef}>
        <mesh ref={spinRef}>
          <sphereGeometry args={[data.radius, 32, 24]} />
          <PlanetMaterial textureUrl={data.textureUrl} />
        </mesh>
        <PlanetRim radius={data.radius} color={data.color} />
        {data.ring && <SaturnRing radius={data.radius} />}
      </group>
    </>
  );
}

// Earth's position when the camera arrives is computed directly from its
// deterministic orbital motion (angle = initial angle + speed * elapsed
// time) rather than read live off PlanetWithAnchor's ref — freezeEarth() is
// always called at exactly SOLAR_WIDE_MS after mount (when "wide" hands off
// to "earth"), so that elapsed time is known in advance. This avoids any
// dependency on frame-to-frame ordering between two separately-mounted
// components' useFrame callbacks for something that's fully predictable.
const EARTH_DATA = PLANETS[EARTH_PLANET_INDEX];
const EARTH_INITIAL_ANGLE = (EARTH_PLANET_INDEX / PLANETS.length) * Math.PI * 2;
const EARTH_ANGLE_AT_FREEZE = EARTH_INITIAL_ANGLE + EARTH_DATA.orbitSpeed * (SOLAR_WIDE_MS / 1000);
const EARTH_WORLD_AT_FREEZE = new THREE.Vector3(
  Math.cos(EARTH_ANGLE_AT_FREEZE) * EARTH_DATA.orbitRadius,
  0,
  Math.sin(EARTH_ANGLE_AT_FREEZE) * EARTH_DATA.orbitRadius,
);
const EARTH_CLOSE_POS_AT_FREEZE = EARTH_WORLD_AT_FREEZE.clone()
  .add(EARTH_WORLD_AT_FREEZE.clone().normalize().multiplyScalar(1.1))
  .add(new THREE.Vector3(0, 0.15, 0));

function SolarCamera({
  stage,
  reducedMotion,
  freezeEarth,
}: {
  stage: SolarStage;
  reducedMotion: boolean;
  freezeEarth: () => void;
}) {
  const camera = useThree((s) => s.camera);
  const phaseRef = useRef<SolarStage | null>(null);
  const phaseStartRef = useRef(0);
  const startPosRef = useRef(new THREE.Vector3());

  useEffect(() => {
    phaseRef.current = stage;
    phaseStartRef.current = performance.now();
    startPosRef.current.copy(camera.position);

    if (stage === "earth") {
      freezeEarth();
      if (reducedMotion) {
        camera.position.copy(EARTH_CLOSE_POS_AT_FREEZE);
        camera.lookAt(EARTH_WORLD_AT_FREEZE);
      }
    } else if (stage === "wide" && reducedMotion) {
      camera.position.set(
        Math.cos(WIDE_SWEEP) * WIDE_CAMERA_RADIUS,
        WIDE_CAMERA_HEIGHT,
        Math.sin(WIDE_SWEEP) * WIDE_CAMERA_RADIUS,
      );
      camera.lookAt(0, 0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per stage transition
  }, [stage]);

  // Driven per-frame rather than via an external tweening library's
  // onUpdate callback — reads `stage` fresh from a ref each frame, so there
  // is no dependency on effect-commit timing relative to the render loop.
  useFrame(() => {
    if (reducedMotion || !phaseRef.current) return;
    const elapsed = (performance.now() - phaseStartRef.current) / 1000;

    if (phaseRef.current === "wide") {
      const t = Math.min(1, elapsed / (SOLAR_WIDE_MS / 1000));
      const angle = WIDE_SWEEP * easeInOutSine(t);
      camera.position.set(
        Math.cos(angle) * WIDE_CAMERA_RADIUS,
        WIDE_CAMERA_HEIGHT,
        Math.sin(angle) * WIDE_CAMERA_RADIUS,
      );
      camera.lookAt(0, 0, 0);
    } else if (phaseRef.current === "earth") {
      const t = Math.min(1, elapsed / (SOLAR_EARTH_MS / 1000));
      const eased = easeOutCubic(t);
      camera.position.lerpVectors(startPosRef.current, EARTH_CLOSE_POS_AT_FREEZE, eased);
      camera.lookAt(EARTH_WORLD_AT_FREEZE);
    }
  });

  return null;
}

function SolarBloom({ isMobile }: { isMobile: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={isMobile ? 0.55 : 0.95}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
    </EffectComposer>
  );
}

// Scattered rocky debris between Mars and Jupiter — instanced for a single
// draw call, static per mount (regenerating every frame would be wasted
// work for something this small on screen), slowly co-rotating as one field
// for a little parallax against the planets.
function AsteroidBelt({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = isMobile ? 90 : 220;
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.lerp(
        ASTEROID_BELT_INNER,
        ASTEROID_BELT_OUTER,
        Math.random(),
      );
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.25;
      dummy.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      const scale = THREE.MathUtils.lerp(0.02, 0.055, Math.random());
      dummy.scale.setScalar(scale);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.02;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8a8378" roughness={1} metalness={0} />
      </instancedMesh>
    </group>
  );
}

// Denser, varied-brightness, varied-color-temperature starfield — a custom
// point cloud (not a uniform-color helper) so individual stars read as warm,
// cool or neutral rather than identical white dots.
function Starfield({ isMobile }: { isMobile: boolean }) {
  const count = isMobile ? 900 : 2200;
  // Lazy useState initializer rather than useMemo — Math.random() is an
  // impure call this project's lint rules forbid directly in a render-phase
  // memo, but a lazy initializer is the sanctioned escape hatch for a
  // one-time impure computation that must stay stable across re-renders.
  const [geometry] = useState(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const palette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#cfe3ff"),
      new THREE.Color("#fff2d6"),
      new THREE.Color("#bcd6ff"),
      new THREE.Color("#ffe0b8"),
    ];
    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.lerp(30, 70, Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const c = palette[Math.floor(Math.random() * palette.length)].clone();
      const brightness = THREE.MathUtils.lerp(0.35, 1, Math.random());
      c.multiplyScalar(brightness);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = THREE.MathUtils.lerp(0.35, 1.4, Math.random());
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  });

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.11,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  return <points geometry={geometry} material={material} />;
}

export function LocatorSolarSystem({
  stage,
  reducedMotion,
}: {
  stage: SolarStage;
  reducedMotion: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const earthFrozenRef = useRef(false);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, WIDE_CAMERA_HEIGHT, WIDE_CAMERA_RADIUS], fov: 45 }}
        dpr={[1, isMobile ? 1.25 : 1.75]}
        gl={{ antialias: true, alpha: true }}
        resize={{ debounce: 0 }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={45} decay={2} color="#fff4e0" />
        <Starfield isMobile={isMobile} />
        <AsteroidBelt isMobile={isMobile} />
        <Suspense fallback={null}>
          <Sun />
          {PLANETS.map((_, i) => (
            <Planet
              key={PLANETS[i].name}
              index={i}
              isMobile={isMobile}
              frozenRef={i === EARTH_PLANET_INDEX ? earthFrozenRef : undefined}
            />
          ))}
        </Suspense>
        <SolarCamera
          stage={stage}
          reducedMotion={reducedMotion}
          freezeEarth={() => {
            earthFrozenRef.current = true;
          }}
        />
        <SolarBloom isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
