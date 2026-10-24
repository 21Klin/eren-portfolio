"use client";

// A small "narrowing" readout shown across the whole locate sequence — solar
// system, then Earth, then the regional zoom — echoing Google Earth-style
// zoom labels (continent, then country) so each camera move reads as real
// narrowing rather than an arbitrary swoop. Remounts on `label` change (via
// key, in the parent) so the flicker replays at each boundary instead of
// just updating text in place.
export function LocatorStageLabel({ label }: { label: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-20 flex justify-center sm:top-24"
      aria-hidden="true"
    >
      <div className="animate-flicker-in border border-accent/40 bg-black/60 px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent backdrop-blur-sm sm:text-xs">
        {label}
      </div>
    </div>
  );
}
