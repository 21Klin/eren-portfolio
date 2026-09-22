"use client";

import { useSoundEngine } from "@/lib/use-sound-engine";

export function SoundToggle() {
  const { muted, toggleMuted } = useSoundEngine();

  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      title={muted ? "Unmute sound" : "Mute sound"}
      className="fixed right-4 top-4 z-40 flex h-8 w-8 items-center justify-center border border-accent/30 bg-background/80 text-muted backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 9v6h3.5L13 19V5L7.5 9H4Z" />
        {muted ? (
          <path d="M17 9l4.5 6M21.5 9 17 15" />
        ) : (
          <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />
        )}
      </svg>
    </button>
  );
}
