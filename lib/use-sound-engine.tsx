"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const MUTE_STORAGE_KEY = "eren-sys-sound-muted";
const HOVER_SELECTOR = "a, button, [role='button'], [data-sound-hover]";

type SoundEngineContextValue = {
  muted: boolean;
  toggleMuted: () => void;
  playTick: () => void;
  playHover: () => void;
  playConnectionEstablished: () => void;
};

const SoundEngineContext = createContext<SoundEngineContextValue | null>(
  null,
);

const muteListeners = new Set<() => void>();

function readStoredMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

function writeStoredMuted(value: boolean) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // storage unavailable — preference just won't persist
  }
  muteListeners.forEach((listener) => listener());
}

function subscribeMuted(listener: () => void) {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}

// Server (and pre-hydration client) default is muted — this is also the
// user-facing default on a first visit, so it can never mismatch.
function getMutedServerSnapshot() {
  return true;
}

export function SoundEngineProvider({ children }: { children: ReactNode }) {
  const muted = useSyncExternalStore(
    subscribeMuted,
    readStoredMuted,
    getMutedServerSnapshot,
  );
  const mutedRef = useRef(muted);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  // Audio only ever starts inside a user-gesture handler (autoplay policy) —
  // this ref, not React state, gates every playback call so a stale render
  // can never let a sound slip out before that gesture has happened.
  const unlockedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const getAudioContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const gain = ctx.createGain();
    gain.gain.value = 1;
    gain.connect(ctx.destination);
    ctxRef.current = ctx;
    masterGainRef.current = gain;
    return ctx;
  }, []);

  // Constructing/resuming the AudioContext must happen synchronously inside
  // a real user-gesture event handler, or the browser silently blocks it
  // (and some browsers log a warning). Never call this outside one.
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    unlockedRef.current = true;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }, [getAudioContext]);

  useEffect(() => {
    const handleFirstInteraction = () => unlock();
    window.addEventListener("pointerdown", handleFirstInteraction, {
      once: true,
      capture: true,
    });
    window.addEventListener("keydown", handleFirstInteraction, {
      once: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction, true);
      window.removeEventListener("keydown", handleFirstInteraction, true);
    };
  }, [unlock]);

  // Global hover delegation, same pattern as the custom cursor: one listener
  // instead of wiring every button/link/card individually. Reads through a
  // ref so this mount-once effect always calls the latest playHover.
  const playHoverRef = useRef<() => void>(() => {});
  useEffect(() => {
    let lastMatched: Element | null = null;

    const handleOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const matched = target?.closest(HOVER_SELECTOR) ?? null;
      if (matched && matched !== lastMatched) {
        lastMatched = matched;
        playHoverRef.current();
      } else if (!matched) {
        lastMatched = null;
      }
    };

    const handleOut = (event: PointerEvent) => {
      if (!lastMatched) return;
      const related = event.relatedTarget as Element | null;
      if (!related || !lastMatched.contains(related)) {
        lastMatched = null;
      }
    };

    window.addEventListener("pointerover", handleOver);
    window.addEventListener("pointerout", handleOut);
    return () => {
      window.removeEventListener("pointerover", handleOver);
      window.removeEventListener("pointerout", handleOut);
    };
  }, []);

  const canPlay = useCallback(() => {
    return unlockedRef.current && !mutedRef.current && !!ctxRef.current;
  }, []);

  const playTick = useCallback(() => {
    if (!canPlay()) return;
    const ctx = ctxRef.current!;
    const master = masterGainRef.current!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // Randomized pitch per tick so a long typewriter burst doesn't sound
    // like a single sample looping.
    const freq = 1700 + Math.random() * 1100;
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.018);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.03);
  }, [canPlay]);

  const playHover = useCallback(() => {
    if (!canPlay()) return;
    const ctx = ctxRef.current!;
    const master = masterGainRef.current!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1250, now + 0.05);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.09);
  }, [canPlay]);

  const playConnectionEstablished = useCallback(() => {
    if (!canPlay()) return;
    const ctx = ctxRef.current!;
    const master = masterGainRef.current!;
    const now = ctx.currentTime;

    // Short ascending arpeggio — a distinct "handshake confirmed" chime.
    const notes = [660, 880, 1320];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);

      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  }, [canPlay]);

  useEffect(() => {
    playHoverRef.current = playHover;
  }, [playHover]);

  const toggleMuted = useCallback(() => {
    writeStoredMuted(!readStoredMuted());
    // The toggle click is itself a user gesture — unlock immediately so
    // unmuting is audible right away rather than waiting on a separate one.
    unlock();
  }, [unlock]);

  return (
    <SoundEngineContext.Provider
      value={{
        muted,
        toggleMuted,
        playTick,
        playHover,
        playConnectionEstablished,
      }}
    >
      {children}
    </SoundEngineContext.Provider>
  );
}

export function useSoundEngine() {
  const ctx = useContext(SoundEngineContext);
  if (!ctx) {
    throw new Error("useSoundEngine must be used within a SoundEngineProvider");
  }
  return ctx;
}
