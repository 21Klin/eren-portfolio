"use client";

import { useEffect, useRef, useState } from "react";
import { locatorIntro } from "@/lib/data/site-content";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useSoundEngine } from "@/lib/use-sound-engine";

export type PhotoStage = "hidden" | "wide" | "crop" | "face" | "identity";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
const NAME_DECODE_DURATION = 650;
const STATUS_DECODE_DURATION = 400;
const MATCH_PERCENT = 98.6;
const MATCH_COUNT_DURATION = 750;
const MATCH_COUNT_TICK = 30;

// Bounding box for eren_face_crop.jpg, hand-picked against the actual
// image — a tight head/face box, not the whole head-to-knee frame.
const BOUNDING_BOX = { left: 10, top: 3, width: 68, height: 58 };

// `onCharLock` fires once per character the moment it settles from scramble
// into its final glyph — not once per animation frame — so a mechanical-
// keyboard click can ride along with it: every letter gets exactly one
// click as it "types in", same contract as the boot sequence's typewriter.
function useDecodeText(
  text: string,
  active: boolean,
  durationMs: number,
  reducedMotion: boolean,
  onCharLock?: () => void,
) {
  const [display, setDisplay] = useState(reducedMotion ? text : "");
  const onCharLockRef = useRef(onCharLock);
  useEffect(() => {
    onCharLockRef.current = onCharLock;
  });

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      const timeout = setTimeout(() => setDisplay(text), 0);
      return () => clearTimeout(timeout);
    }
    const frameMs = 40;
    const totalFrames = Math.round(durationMs / frameMs);
    let frame = 0;
    let lockedCount = 0;

    const interval = setInterval(() => {
      frame += 1;
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      setDisplay(
        text
          .split("")
          .map((char, i) =>
            char === " "
              ? " "
              : i < revealCount
                ? char
                : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
          )
          .join(""),
      );
      while (lockedCount < revealCount) {
        if (text[lockedCount] !== " ") onCharLockRef.current?.();
        lockedCount += 1;
      }
      if (frame >= totalFrames) {
        setDisplay(text);
        while (lockedCount < text.length) {
          if (text[lockedCount] !== " ") onCharLockRef.current?.();
          lockedCount += 1;
        }
        clearInterval(interval);
      }
    }, frameMs);

    return () => clearInterval(interval);
  }, [active, text, durationMs, reducedMotion]);

  return display;
}

// Owns the whole "scan → snap → analyze → lock" choreography for the face
// bounding box. Mounts once (its parent keeps it mounted across "face" and
// "identity" so it never replays), and reduced-motion users skip straight
// to the settled end state.
//
// Deliberately plain setTimeout/CSS-keyframe driven rather than a JS
// animation library timeline: the corner "snap" and readout count-up used
// to run on a single GSAP timeline, but its rAF-driven ticker could stall
// or desync under background-tab throttling and leave the corners stuck
// invisible. setTimeout (still fires, just coalesced, in a background tab)
// and CSS animations (owned by the compositor, not the JS event loop) don't
// have that failure mode, and it's the same pattern already used for every
// other timed reveal in this sequence.
function TargetLockBox() {
  const reducedMotion = usePrefersReducedMotion();
  const [scanning, setScanning] = useState(!reducedMotion);
  const [glitch, setGlitch] = useState(false);
  const [cornersVisible, setCornersVisible] = useState(reducedMotion);
  const [dotsVisible, setDotsVisible] = useState(reducedMotion);
  const [readoutVisible, setReadoutVisible] = useState(reducedMotion);
  const [matchPercent, setMatchPercent] = useState(reducedMotion ? MATCH_PERCENT : 0);
  const [showLabel, setShowLabel] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };

    at(550, () => {
      setScanning(false);
      setGlitch(true);
      setCornersVisible(true);
      setReadoutVisible(true);
    });
    at(720, () => setGlitch(false));
    at(850, () => setDotsVisible(true));
    at(1400, () => setShowLabel(true));
    at(600, () => {
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += MATCH_COUNT_TICK;
        const progress = Math.min(1, elapsed / MATCH_COUNT_DURATION);
        setMatchPercent(Math.round(MATCH_PERCENT * progress * 10) / 10);
        if (progress >= 1) clearInterval(interval);
      }, MATCH_COUNT_TICK);
      timers.push(interval);
    });

    return () => timers.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot choreography on mount
  }, []);

  return (
    <div
      className="absolute"
      style={{
        left: `${BOUNDING_BOX.left}%`,
        top: `${BOUNDING_BOX.top}%`,
        width: `${BOUNDING_BOX.width}%`,
        height: `${BOUNDING_BOX.height}%`,
      }}
    >
      {scanning && (
        <div
          className="animate-photo-scan pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-accent/0 via-accent/50 to-accent/0"
          aria-hidden="true"
        />
      )}

      {glitch && (
        <div className="pointer-events-none absolute -inset-2 animate-glitch bg-accent/10 mix-blend-screen" />
      )}

      <div
        className={`absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-accent ${
          cornersVisible ? "animate-corner-snap-tl" : "opacity-0"
        }`}
      />
      <div
        className={`absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-accent ${
          cornersVisible ? "animate-corner-snap-tr" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-accent ${
          cornersVisible ? "animate-corner-snap-bl" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-accent ${
          cornersVisible ? "animate-corner-snap-br" : "opacity-0"
        }`}
      />
      <span
        className={`absolute h-1.5 w-1.5 rounded-full bg-accent ${
          dotsVisible ? "animate-dot-pop" : "-translate-x-1/2 -translate-y-1/2 opacity-0"
        }`}
        style={{ left: "50%", top: "0%" }}
      />
      <span
        className={`absolute h-1.5 w-1.5 rounded-full bg-accent ${
          dotsVisible ? "animate-dot-pop" : "-translate-x-1/2 -translate-y-1/2 opacity-0"
        }`}
        style={{ left: "50%", top: "100%", animationDelay: dotsVisible ? "80ms" : undefined }}
      />

      <div
        className={`absolute -top-6 right-0 whitespace-nowrap border border-accent/40 bg-black/80 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest text-muted transition-opacity sm:text-[0.6rem] ${
          readoutVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        MATCH {matchPercent.toFixed(1)}%
      </div>

      <div
        className={`absolute -bottom-6 left-0 whitespace-nowrap border border-accent/50 bg-black/80 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest text-accent transition-opacity sm:text-[0.65rem] ${
          showLabel ? "opacity-100 animate-flicker-in" : "opacity-0"
        }`}
      >
        {locatorIntro.targetLabel}
      </div>
    </div>
  );
}

export function LocatorPhotoReveal({ stage }: { stage: PhotoStage }) {
  const reducedMotion = usePrefersReducedMotion();
  const { playTick } = useSoundEngine();
  const [nameLine, statusLine] = locatorIntro.identityLines;
  const nameDisplay = useDecodeText(
    nameLine,
    stage === "identity",
    NAME_DECODE_DURATION,
    reducedMotion,
    playTick,
  );
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (stage !== "identity") return;
    const timeout = setTimeout(
      () => setShowStatus(true),
      reducedMotion ? 0 : NAME_DECODE_DURATION + 150,
    );
    return () => clearTimeout(timeout);
  }, [stage, reducedMotion]);

  const statusDisplay = useDecodeText(
    statusLine,
    showStatus,
    STATUS_DECODE_DURATION,
    reducedMotion,
    playTick,
  );

  if (stage === "hidden") return null;

  const showWide = stage === "wide";
  const showCrop = stage === "crop";
  const showFace = stage === "face" || stage === "identity";
  const zoomLabel = showFace ? "Zoom 8.6x" : showCrop ? "Zoom 4.2x" : "Zoom 1.0x";

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6" aria-hidden="true">
      <div className="relative w-full max-w-sm border border-accent/40 bg-black/70 p-2 sm:max-w-md">
        <div className="mb-2 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-widest text-muted sm:text-xs">
          <span className="text-accent">Visual Feed</span>
          <span>{zoomLabel}</span>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset, decorative crossfade, dimensions unknown */}
          <img
            src="/assets/locator-intro/full_scene_wide.png"
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              showWide ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* eslint-disable-next-line @next/next/no-img-element -- static asset, decorative crossfade, dimensions unknown */}
          <img
            src="/assets/locator-intro/eren_target_crop.jpg"
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              showCrop ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* eslint-disable-next-line @next/next/no-img-element -- static asset, decorative crossfade, dimensions unknown */}
          <img
            src="/assets/locator-intro/eren_face_crop.jpg"
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              showFace ? "opacity-100" : "opacity-0"
            }`}
          />

          {showFace && <TargetLockBox />}
        </div>

        {stage === "identity" && (
          <div className="mt-3 space-y-1 border-t border-accent/20 pt-3 text-center font-mono">
            <p className="text-lg font-bold tracking-widest text-accent sm:text-xl">
              {nameDisplay}
              {nameDisplay.length < nameLine.length && (
                <span className="ml-1 inline-block h-[0.9em] w-[0.5ch] translate-y-0.5 animate-blink bg-accent align-middle" />
              )}
            </p>
            <p
              className={`text-xs uppercase tracking-[0.5em] text-foreground transition-opacity duration-300 sm:text-sm ${
                showStatus ? "opacity-100" : "opacity-0"
              }`}
            >
              {statusDisplay}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
