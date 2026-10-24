import * as THREE from "three";

// Struga, North Macedonia — the coordinate the locator intro's camera flies to.
export const TARGET_LAT = 41.1231;
export const TARGET_LON = 20.6773;

// A rough central-Europe waypoint the camera passes through mid-flight, so
// the zoom reads as two distinct steps (continent, then exact point)
// instead of one continuous swoop to an arbitrary-looking spot.
export const EUROPE_LAT = 48;
export const EUROPE_LON = 15;

export const GLOBE_RADIUS = 2;

// Three-leg camera flight, each leg strictly closer than the last so the
// zoom reads as continuous narrowing (continent -> country -> city) instead
// of a swoop that overshoots and has to pull back in. Leg 3 (the "lock")
// runs on entry to GlobeStage "locked", replacing what used to be a static
// hold — the 3D backdrop itself now arrives at Struga, rather than only the
// small 2D HUD map inset appearing to zoom while the backdrop stays wide.
export const FLIGHT_LEG1_MS = 1500;
export const FLIGHT_LEG2_MS = 1400;
export const FLIGHT_LEG3_MS = 850;
export const FLIGHT_DURATION_MS = FLIGHT_LEG1_MS + FLIGHT_LEG2_MS;

// Camera distance from Earth's center at each stage, as a multiple of
// GLOBE_RADIUS — each strictly smaller than the last, and smaller than the
// globe scene's own static starting distance (~1.95x, see
// locator-globe-scene.tsx's Canvas camera position) so leg 1 starts already
// zooming in rather than pulling back out first.
export const EUROPE_DIST = 1.55;
export const MACEDONIA_DIST = 1.3;
export const STRUGA_DIST = 1.14;

// Leg 4: the "punch through the surface" dive that follows the Struga lock —
// camera crashes from STRUGA_DIST almost to the globe's own radius (i.e.
// nearly touching it) so the cut into the wireframe city reads as breaching
// the surface, not just another zoom step.
export const SURFACE_PUNCH_DIST = 1.015;
export const SURFACE_PUNCH_MS = 500;

// The wireframe city construction beat: buildings rise staggered across
// CITY_BUILD_MS (see locator-city-scene.tsx), then the camera holds on the
// finished skyline for CITY_SETTLE_MS before crossfading into the 2D Struga
// map HUD.
export const CITY_BUILD_MS = 1900;
export const CITY_SETTLE_MS = 900;
export const CITY_STAGE_MS = CITY_BUILD_MS + CITY_SETTLE_MS;

// Solar system scene — deliberately compressed (non-real) orbital radii so
// all eight planets fit in one frustum; order and rough relative size are
// what sell it, not astronomical accuracy.
export type PlanetData = {
  name: string;
  radius: number;
  orbitRadius: number;
  color: string;
  orbitSpeed: number; // radians/sec, compressed for visual pacing not realism
  textureUrl: string;
  ring?: boolean;
};

export const SUN_RADIUS = 0.85;
export const SUN_TEXTURE_URL = "/assets/locator-intro/planets/2k_sun.jpg";
export const SATURN_RING_ALPHA_URL = "/assets/locator-intro/planets/2k_saturn_ring_alpha.png";
export const EARTH_TEXTURE_URL = "/assets/locator-intro/earth-daymap.jpg";

const PLANET_TEXTURE_BASE = "/assets/locator-intro/planets";

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    radius: 0.09,
    orbitRadius: 2.6,
    color: "#9a9a94",
    orbitSpeed: 0.42,
    textureUrl: `${PLANET_TEXTURE_BASE}/2k_mercury.jpg`,
  },
  {
    name: "Venus",
    radius: 0.15,
    orbitRadius: 3.5,
    color: "#e3c78f",
    orbitSpeed: 0.32,
    textureUrl: `${PLANET_TEXTURE_BASE}/2k_venus_surface.jpg`,
  },
  {
    name: "Earth",
    radius: 0.17,
    orbitRadius: 4.5,
    color: "#3fa7ff",
    orbitSpeed: 0.26,
    textureUrl: EARTH_TEXTURE_URL,
  },
  {
    name: "Mars",
    radius: 0.12,
    orbitRadius: 5.5,
    color: "#c1552c",
    orbitSpeed: 0.21,
    textureUrl: `${PLANET_TEXTURE_BASE}/2k_mars.jpg`,
  },
  {
    name: "Jupiter",
    radius: 0.52,
    orbitRadius: 7.3,
    color: "#c9a27a",
    orbitSpeed: 0.13,
    textureUrl: `${PLANET_TEXTURE_BASE}/2k_jupiter.jpg`,
  },
  {
    name: "Saturn",
    radius: 0.46,
    orbitRadius: 9.2,
    color: "#d8c193",
    orbitSpeed: 0.1,
    textureUrl: `${PLANET_TEXTURE_BASE}/2k_saturn.jpg`,
    ring: true,
  },
  {
    name: "Uranus",
    radius: 0.28,
    orbitRadius: 10.9,
    color: "#9fe0e8",
    orbitSpeed: 0.075,
    textureUrl: `${PLANET_TEXTURE_BASE}/2k_uranus.jpg`,
  },
  {
    name: "Neptune",
    radius: 0.27,
    orbitRadius: 12.4,
    color: "#5470e0",
    orbitSpeed: 0.06,
    textureUrl: `${PLANET_TEXTURE_BASE}/2k_neptune.jpg`,
  },
];

export const EARTH_PLANET_INDEX = PLANETS.findIndex((p) => p.name === "Earth");
export const ASTEROID_BELT_INNER = 6.1;
export const ASTEROID_BELT_OUTER = 6.9;

// Two-phase solar system camera move, same "leg" pattern as the flight
// above: phase 1 is the wide cinematic orbit ("SOLAR SYSTEM"), phase 2 is
// the approach-and-hold on Earth specifically ("EARTH").
export const SOLAR_WIDE_MS = 3500;
export const SOLAR_EARTH_MS = 2200;

// The atmosphere-entry overlay that disguises the handoff from the solar
// system scene into the close Earth/globe scene: glow band, then cloud
// blur, then clear — three distinct beats, not one cross-fade.
export const ATMOSPHERE_GLOW_MS = 550;
export const ATMOSPHERE_CLOUD_MS = 650;
export const ATMOSPHERE_CLEAR_MS = 450;
export const ATMOSPHERE_TOTAL_MS =
  ATMOSPHERE_GLOW_MS + ATMOSPHERE_CLOUD_MS + ATMOSPHERE_CLEAR_MS;

// Matches THREE.SphereGeometry's own UV parametrization (u=longitude wrap,
// v=0 at north pole) so a point placed with this function lines up with the
// texture wrapped onto a sphere built with the same convention.
export function latLongToVector3(
  lat: number,
  lon: number,
  radius: number,
): THREE.Vector3 {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const phi = u * Math.PI * 2;
  const theta = v * Math.PI;
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}
