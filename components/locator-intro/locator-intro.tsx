"use client";

import { useEffect, useState } from "react";
import { LocatorAtmosphereTransition } from "@/components/locator-intro/locator-atmosphere-transition";
import { LocatorCityScene, type CityStage } from "@/components/locator-intro/locator-city-scene";
import { LocatorGlobeScene, type GlobeStage } from "@/components/locator-intro/locator-globe-scene";
import { LocatorHud } from "@/components/locator-intro/locator-hud";
import { LocatorPhotoReveal, type PhotoStage } from "@/components/locator-intro/locator-photo-reveal";
import { LocatorSolarSystem, type SolarStage } from "@/components/locator-intro/locator-solar-system";
import { LocatorStageLabel } from "@/components/locator-intro/locator-stage-label";
import { LocatorSurfacePunchTransition } from "@/components/locator-intro/locator-surface-punch-transition";
import { locatorIntro } from "@/lib/data/site-content";
import {
  ATMOSPHERE_TOTAL_MS,
  CITY_STAGE_MS,
  FLIGHT_LEG1_MS,
  FLIGHT_LEG2_MS,
  SOLAR_EARTH_MS,
  SOLAR_WIDE_MS,
  SURFACE_PUNCH_MS,
} from "@/lib/locator-coords";
import { useLocatorPreload } from "@/lib/locator-preload";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useSoundEngine } from "@/lib/use-sound-engine";

type Stage =
  | "gate"
  | "loading"
  | "solar-wide"
  | "solar-earth"
  | "atmosphere"
  | "globe"
  | "flight-leg1"
  | "flight-leg2"
  | "lock"
  | "surface-punch"
  | "city"
  | "hud"
  | "photo-wide"
  | "photo-crop"
  | "photo-face"
  | "identity"
  | "handoff"
  | "done";

// Deliberately varied, not uniform — the sequence should feel like it's
// alternately settling and hunting, not ticking on a metronome.
const GLOBE_HOLD_MS = 1200;
const LOCK_HOLD_MS = 900;
const HUD_HOLD_MS = 1800;
const WIDE_HOLD_MS = 1400;
const CROP_HOLD_MS = 1100;
const PHOTO_FACE_HOLD_MS = 1900;
const IDENTITY_HOLD_MS = 1600;
const HANDOFF_MS = 550;

// The 3D globe mounts from "atmosphere" onward (underneath the cloud-blur
// overlay, so it's already rendering by the time the clouds clear) and
// tears down once the surface-punch dive hands off to the wireframe city.
// Both flight legs map to the same GlobeStage "flight" — the globe scene
// runs one continuous two-leg GSAP timeline across them; the split only
// exists at this stage-machine level, to swap the "narrowing" label text
// partway through.
const GLOBE_STAGE_MAP: Partial<Record<Stage, GlobeStage>> = {
  atmosphere: "globe",
  globe: "globe",
  "flight-leg1": "flight",
  "flight-leg2": "flight",
  lock: "locked",
  "surface-punch": "punch",
};

// The wireframe city mounts once the surface-punch dive completes, builds
// itself out, then recedes (as "settled") once the 2D Struga map HUD
// crossfades on top of it — mirroring how the globe used to recede behind
// the HUD, before the city scene took over that role.
const CITY_STAGE_MAP: Partial<Record<Stage, CityStage>> = {
  city: "constructing",
  hud: "settled",
};

const SOLAR_STAGE_MAP: Partial<Record<Stage, SolarStage>> = {
  "solar-wide": "wide",
  "solar-earth": "earth",
};

const STAGE_LABELS: Partial<Record<Stage, string>> = {
  "solar-wide": "SOLAR SYSTEM",
  "solar-earth": "EARTH",
  globe: "MAP",
  "flight-leg1": "EUROPE",
  "flight-leg2": "NORTH MACEDONIA",
  lock: "STRUGA",
  "surface-punch": "BREACHING SURFACE",
  city: "RECONSTRUCTING TERRAIN",
  hud: "STRUGA",
};

const HUD_ACTIVE_STAGES: Stage[] = [
  "hud",
  "photo-wide",
  "photo-crop",
  "photo-face",
  "identity",
];

function GateScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <button
        type="button"
        onClick={onStart}
        className="border border-accent/40 bg-black/60 px-10 py-4 font-mono text-sm uppercase tracking-[0.5em] text-accent transition-colors hover:border-accent hover:bg-accent/10 sm:text-base"
      >
        {locatorIntro.gateLabel}
      </button>
    </div>
  );
}

function LoadingGate({ progress }: { progress: number }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6">
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent sm:text-sm">
        Calibrating Tracking Array
        <span className="animate-loading-dot ml-1 inline-block">.</span>
        <span
          className="animate-loading-dot ml-0.5 inline-block"
          style={{ animationDelay: "0.15s" }}
        >
          .
        </span>
        <span
          className="animate-loading-dot ml-0.5 inline-block"
          style={{ animationDelay: "0.3s" }}
        >
          .
        </span>
      </p>
      <div className="h-1 w-48 border border-accent/30 bg-black/60 sm:w-64">
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function LocatorIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("gate");
  const reducedMotion = usePrefersReducedMotion();
  const { unmuteForIntro, startAmbientScore, stopAmbientScore } = useSoundEngine();
  const { ready: assetsReady, progress: preloadProgress } = useLocatorPreload();

  // Assets start preloading the moment this component mounts (i.e. while
  // the click-to-start gate is up), well before "loading" is ever entered —
  // that stage only exists as a fallback for a slow connection where they
  // aren't ready by the time INITIALIZE is clicked.
  useEffect(() => {
    if (stage !== "loading" || !assetsReady) return;
    const timeout = setTimeout(() => setStage("solar-wide"), 0);
    return () => clearTimeout(timeout);
  }, [stage, assetsReady]);

  useEffect(() => {
    if (stage !== "solar-wide") return;
    const timeout = setTimeout(() => setStage("solar-earth"), SOLAR_WIDE_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "solar-earth") return;
    const timeout = setTimeout(() => setStage("atmosphere"), SOLAR_EARTH_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "atmosphere") return;
    const timeout = setTimeout(() => setStage("globe"), ATMOSPHERE_TOTAL_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "globe") return;
    const timeout = setTimeout(() => setStage("flight-leg1"), GLOBE_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "flight-leg1") return;
    const timeout = setTimeout(() => setStage("flight-leg2"), FLIGHT_LEG1_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "flight-leg2") return;
    const timeout = setTimeout(() => setStage("lock"), FLIGHT_LEG2_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "lock") return;
    const timeout = setTimeout(() => setStage("surface-punch"), LOCK_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  // The camera punches through the surface here (see the "punch" GlobeStage
  // in locator-globe-scene.tsx) — this stage's only job is to hold long
  // enough for that dive + the breach-flash overlay to play before handing
  // off to the wireframe city scene.
  useEffect(() => {
    if (stage !== "surface-punch") return;
    const timeout = setTimeout(() => setStage("city"), SURFACE_PUNCH_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "city") return;
    const timeout = setTimeout(() => setStage("hud"), CITY_STAGE_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "hud") return;
    const timeout = setTimeout(() => setStage("photo-wide"), HUD_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "photo-wide") return;
    const timeout = setTimeout(() => setStage("photo-crop"), WIDE_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "photo-crop") return;
    const timeout = setTimeout(() => setStage("photo-face"), CROP_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "photo-face") return;
    const timeout = setTimeout(() => setStage("identity"), PHOTO_FACE_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "identity") return;
    const timeout = setTimeout(() => setStage("handoff"), IDENTITY_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "handoff") return;
    stopAmbientScore();
    const timeout = setTimeout(() => setStage("done"), HANDOFF_MS);
    return () => clearTimeout(timeout);
  }, [stage, stopAmbientScore]);

  useEffect(() => {
    if (stage === "done") onComplete();
  }, [stage, onComplete]);

  // Belt-and-braces: if this component is ever torn down mid-sequence
  // without passing through "handoff" (shouldn't happen via the UI, but
  // costs nothing to guard), make sure the ambient score doesn't keep
  // playing into whatever comes next.
  useEffect(() => {
    return () => stopAmbientScore();
  }, [stopAmbientScore]);

  const handleStart = () => {
    // The click is the user gesture — unlocks audio AND opts this visit
    // into sound, so there's no separate mute toggle to hunt for after.
    unmuteForIntro();
    startAmbientScore();
    setStage(assetsReady ? "solar-wide" : "loading");
  };

  const handleSkip = () => {
    if (stage === "gate" || stage === "handoff" || stage === "done") return;
    setStage("handoff");
  };

  if (stage === "done") return null;

  const solarStage = SOLAR_STAGE_MAP[stage];
  const globeStage = GLOBE_STAGE_MAP[stage];
  const cityStage = CITY_STAGE_MAP[stage];
  const photoStage: PhotoStage =
    stage === "photo-wide"
      ? "wide"
      : stage === "photo-crop"
        ? "crop"
        : stage === "photo-face"
          ? "face"
          : stage === "identity"
            ? "identity"
            : "hidden";
  const showSkip = stage !== "gate" && stage !== "handoff";
  const stageLabel = STAGE_LABELS[stage] ?? null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black ${
        stage === "handoff" ? "animate-zoom-out" : ""
      }`}
    >
      {stage === "gate" ? (
        <GateScreen onStart={handleStart} />
      ) : stage === "loading" ? (
        <LoadingGate progress={preloadProgress} />
      ) : (
        <>
          {solarStage && <LocatorSolarSystem stage={solarStage} reducedMotion={reducedMotion} />}
          {globeStage && <LocatorGlobeScene stage={globeStage} reducedMotion={reducedMotion} />}
          {stage === "atmosphere" && <LocatorAtmosphereTransition />}
          {stage === "surface-punch" && <LocatorSurfacePunchTransition />}
          {cityStage && <LocatorCityScene stage={cityStage} reducedMotion={reducedMotion} />}
          <LocatorHud
            active={HUD_ACTIVE_STAGES.includes(stage)}
            showMap={stage === "hud"}
            locked
          />
          <LocatorPhotoReveal stage={photoStage} />
          {stageLabel && <LocatorStageLabel key={stageLabel} label={stageLabel} />}
        </>
      )}

      {stage === "handoff" && (
        <div className="pointer-events-none absolute inset-0 animate-white-flash bg-white" />
      )}

      {showSkip && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute bottom-4 right-4 z-10 p-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
        >
          skip &gt;&gt;
        </button>
      )}
    </div>
  );
}
