"use client";

import { useEffect, useRef, useState } from "react";
import { LocatorMap } from "@/components/locator-intro/locator-map";
import { TARGET_LAT, TARGET_LON } from "@/lib/locator-coords";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const TICK_INTERVAL = 140;
const CONVERGE_STEPS = 9;

function formatCoord(value: number, axis: "lat" | "lon") {
  const dir = axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(4)}° ${dir}`;
}

// Jitters toward the real target coordinate over a handful of ticks, so the
// side panel reads as "converging on a signal" rather than random noise.
function useConvergingReadout(target: number, active: boolean, reducedMotion: boolean) {
  const [value, setValue] = useState(() => target + (Math.random() - 0.5) * 6);
  const stepRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      const timeout = setTimeout(() => setValue(target), 0);
      return () => clearTimeout(timeout);
    }
    stepRef.current = 0;
    const interval = setInterval(() => {
      stepRef.current += 1;
      const progress = Math.min(1, stepRef.current / CONVERGE_STEPS);
      const noise = (1 - progress) * (Math.random() - 0.5) * 4;
      setValue(target + noise);
      if (progress >= 1) clearInterval(interval);
    }, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [active, target, reducedMotion]);

  return value;
}

function useSignalStrength(active: boolean, reducedMotion: boolean) {
  const [percent, setPercent] = useState(12);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      const timeout = setTimeout(() => setPercent(100), 0);
      return () => clearTimeout(timeout);
    }
    const interval = setInterval(() => {
      setPercent((p) => (p >= 100 ? 100 : Math.min(100, p + 6 + Math.random() * 14)));
    }, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [active, reducedMotion]);

  return Math.round(percent);
}

function DataPanel({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div
      className={`pointer-events-none border border-accent/30 bg-black/60 p-3 font-mono text-[0.65rem] uppercase tracking-widest text-accent backdrop-blur-sm sm:text-xs ${className}`}
    >
      {children}
    </div>
  );
}

export function LocatorHud({
  active,
  showMap,
  locked,
}: {
  active: boolean;
  showMap: boolean;
  locked: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const lat = useConvergingReadout(TARGET_LAT, active, reducedMotion);
  const lon = useConvergingReadout(TARGET_LON, active, reducedMotion);
  const signal = useSignalStrength(active, reducedMotion);

  return (
    <div
      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <LocatorMap active={showMap} />
      </div>

      <DataPanel className="absolute left-3 top-20 w-40 space-y-1.5 sm:left-6 sm:top-24 sm:w-48">
        <p className="text-muted">Coordinates</p>
        <p>{formatCoord(lat, "lat")}</p>
        <p>{formatCoord(lon, "lon")}</p>
      </DataPanel>

      <DataPanel className="absolute right-3 top-20 w-40 space-y-1.5 sm:right-6 sm:top-24 sm:w-48">
        <p className="text-muted">Signal Strength</p>
        <div className="h-1.5 w-full border border-accent/30 bg-black/60">
          <div
            className="h-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${signal}%` }}
          />
        </div>
        <p>{signal}%</p>
      </DataPanel>

      <DataPanel className="absolute bottom-20 left-1/2 w-56 -translate-x-1/2 text-center sm:bottom-24">
        {locked ? "TARGET ACQUIRED — STRUGA, MK" : "SCANNING FOR SIGNAL..."}
      </DataPanel>

      <div className="absolute left-3 top-3 h-6 w-6 border-l border-t border-accent/40 sm:left-6 sm:top-6" />
      <div className="absolute right-3 top-3 h-6 w-6 border-r border-t border-accent/40 sm:right-6 sm:top-6" />
      <div className="absolute bottom-3 left-3 h-6 w-6 border-b border-l border-accent/40 sm:bottom-6 sm:left-6" />
      <div className="absolute bottom-3 right-3 h-6 w-6 border-b border-r border-accent/40 sm:bottom-6 sm:right-6" />
    </div>
  );
}
