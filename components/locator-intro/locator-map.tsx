"use client";

import { ACCENT_COLOR } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// Stylized, non-cartographic layout of North Macedonia and its immediate
// neighbors — proportioned by eye to read as "a real regional map" on a
// HUD, not surveyed border data. Coordinates are local to the 300x300
// viewBox below, unrelated to lat/long.
const NORTH_MACEDONIA =
  "M140,70 L175,85 L195,110 L190,160 L165,195 L130,205 L105,190 L88,165 L80,135 L95,100 Z";
const ALBANIA = "M70,90 L85,100 L80,135 L75,165 L70,200 L55,210 L45,180 L50,140 L55,105 Z";
const KOSOVO = "M95,100 L80,90 L75,65 L95,55 L115,65 L110,85 Z";
const SERBIA = "M75,65 L95,30 L160,25 L195,45 L175,85 L140,70 L115,65 L95,55 Z";
const BULGARIA = "M195,45 L252,55 L258,125 L238,172 L195,110 L190,160 Z";
const GREECE =
  "M105,190 L130,205 L165,195 L190,160 L238,172 L228,232 L178,262 L118,270 L68,248 L55,210 L70,200 Z";

// Lake Ohrid — a small teardrop in NM's southwest corner, right on the
// Albanian border. Struga sits at its northern tip.
const LAKE_OHRID = "M88,165 C94,172 96,182 92,192 C89,199 82,202 78,196 C74,188 77,175 82,168 Z";
const STRUGA_POS = { x: 86, y: 170 };

function NeighborLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      className="fill-muted font-mono"
      style={{ fontSize: 8, letterSpacing: 1 }}
    >
      {label}
    </text>
  );
}

export function LocatorMap({ active }: { active: boolean }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={`pointer-events-none flex items-center justify-center transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div className="relative h-64 w-64 border border-accent/30 bg-black/50 sm:h-80 sm:w-80">
        <svg viewBox="0 0 300 300" className="h-full w-full overflow-hidden">
          <defs>
            <radialGradient id="mk-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.35" />
              <stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* radar backdrop grid */}
          <g stroke={ACCENT_COLOR} strokeOpacity="0.08">
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 60} x2={300} y2={i * 60} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={300} />
            ))}
          </g>
          <circle cx={150} cy={150} r={120} fill="none" stroke={ACCENT_COLOR} strokeOpacity="0.08" />
          <circle cx={150} cy={150} r={80} fill="none" stroke={ACCENT_COLOR} strokeOpacity="0.08" />

          {/* neighboring countries — dim outlines for context only */}
          <g fill="none" stroke={ACCENT_COLOR} strokeOpacity="0.28" strokeWidth={1}>
            <path d={ALBANIA} />
            <path d={KOSOVO} />
            <path d={SERBIA} />
            <path d={BULGARIA} />
            <path d={GREECE} />
          </g>
          <NeighborLabel x={58} y={150} label="AL" />
          <NeighborLabel x={92} y={72} label="KS" />
          <NeighborLabel x={135} y={42} label="RS" />
          <NeighborLabel x={225} y={95} label="BG" />
          <NeighborLabel x={150} y={230} label="GR" />

          {/* North Macedonia — highlighted */}
          <path d={NORTH_MACEDONIA} fill="url(#mk-glow)" />
          <path
            d={NORTH_MACEDONIA}
            fill={ACCENT_COLOR}
            fillOpacity="0.14"
            stroke={ACCENT_COLOR}
            strokeOpacity="0.9"
            strokeWidth={1.75}
          />

          {/* Lake Ohrid */}
          <path d={LAKE_OHRID} fill="#010506" stroke={ACCENT_COLOR} strokeOpacity="0.6" strokeWidth={1} />

          {/* Struga marker */}
          <g>
            <circle
              cx={STRUGA_POS.x}
              cy={STRUGA_POS.y}
              r={5}
              fill="none"
              stroke={ACCENT_COLOR}
              strokeWidth={1}
              className={reducedMotion ? undefined : "animate-pulse"}
            />
            <circle cx={STRUGA_POS.x} cy={STRUGA_POS.y} r={2} fill={ACCENT_COLOR} />
            <line
              x1={STRUGA_POS.x}
              y1={STRUGA_POS.y}
              x2={STRUGA_POS.x + 38}
              y2={STRUGA_POS.y - 30}
              stroke={ACCENT_COLOR}
              strokeOpacity="0.6"
              strokeWidth={1}
            />
            <text
              x={STRUGA_POS.x + 41}
              y={STRUGA_POS.y - 32}
              className="fill-accent font-mono font-bold"
              style={{ fontSize: 11, letterSpacing: 1 }}
            >
              STRUGA
            </text>
          </g>

          <text
            x={150}
            y={84}
            textAnchor="middle"
            className="fill-accent font-mono font-bold"
            style={{ fontSize: 9, letterSpacing: 1.5 }}
          >
            N. MACEDONIA
          </text>
        </svg>

        {active && !reducedMotion && (
          <div
            className="animate-map-scan pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-accent/0 via-accent/25 to-accent/0"
            aria-hidden="true"
          />
        )}

        <div className="absolute left-1.5 top-1.5 h-3 w-3 border-l border-t border-accent/50" />
        <div className="absolute right-1.5 top-1.5 h-3 w-3 border-r border-t border-accent/50" />
        <div className="absolute bottom-1.5 left-1.5 h-3 w-3 border-b border-l border-accent/50" />
        <div className="absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r border-accent/50" />
      </div>
    </div>
  );
}
