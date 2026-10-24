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
  unmuteForIntro: () => void;
  startAmbientScore: () => void;
  stopAmbientScore: () => void;
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

  // Locator intro: a user gesture (the INITIALIZE click) both unlocks the
  // AudioContext and opts the visit into sound — there's no separate mute
  // toggle to hunt for afterward. Distinct from `unlock`, which only resumes
  // the context; this also forces the stored preference to unmuted.
  const unmuteForIntro = useCallback(() => {
    unlock();
    if (readStoredMuted()) writeStoredMuted(false);
  }, [unlock]);

  // Continuous cinematic pad under the whole locator sequence — three
  // detuned low oscillators (a root + fifth + soft octave shimmer) through a
  // slowly LFO-swept lowpass filter, plus a very quiet filtered-noise "space
  // air" bed. Everything sine/triangle with slow envelopes on purpose: nothing
  // here should read as a synth blip, just a low evolving drone. Nodes are
  // built once per start/stop cycle and kept in a ref so the mute-effect
  // below can ride the same gain node live, rather than gating at trigger
  // time the way the one-shot sounds above do.
  const ambientRef = useRef<{
    gain: GainNode;
    targetGain: number;
    oscillators: OscillatorNode[];
    noiseSource: AudioBufferSourceNode | null;
  } | null>(null);

  const startAmbientScore = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ambientRef.current) return;
    const master = masterGainRef.current!;
    const now = ctx.currentTime;
    const targetGain = 0.055;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.0001;
    droneGain.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.4;
    filter.connect(droneGain);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.045;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 260;
    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    lfo.start(now);

    const oscillators: OscillatorNode[] = [lfo];
    const droneVoices: [number, OscillatorType, number][] = [
      [55, "sine", 0.5],
      [82.41, "sine", 0.3],
      [110, "triangle", 0.16],
    ];
    for (const [freq, type, level] of droneVoices) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = level;
      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start(now);
      oscillators.push(osc);
    }

    // Slow tremolo on a quiet high shimmer voice — the one "twinkle" element,
    // kept subtle and sine-only so it reads as cinematic sparkle, not sci-fi
    // sonar.
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 440;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.02;
    const tremolo = ctx.createOscillator();
    tremolo.type = "sine";
    tremolo.frequency.value = 0.12;
    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.value = 0.018;
    tremolo.connect(tremoloDepth);
    tremoloDepth.connect(shimmerGain.gain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(filter);
    shimmer.start(now);
    tremolo.start(now);
    oscillators.push(shimmer, tremolo);

    // Filtered brown-noise bed for a faint "cabin air" texture under the
    // drone — generated once, looped, never re-synthesized per frame.
    const noiseBufferSeconds = 4;
    const noiseBuffer = ctx.createBuffer(
      1,
      ctx.sampleRate * noiseBufferSeconds,
      ctx.sampleRate,
    );
    const data = noiseBuffer.getChannelData(0);
    let lastSample = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      lastSample = (lastSample + 0.02 * white) / 1.02;
      data[i] = lastSample * 3.2;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 380;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.35;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(filter);
    noiseSource.start(now);

    ambientRef.current = {
      gain: droneGain,
      targetGain,
      oscillators,
      noiseSource,
    };

    if (unlockedRef.current && !mutedRef.current) {
      droneGain.gain.linearRampToValueAtTime(targetGain, now + 2.2);
    }
  }, [getAudioContext]);

  const stopAmbientScore = useCallback(() => {
    const amb = ambientRef.current;
    const ctx = ctxRef.current;
    if (!amb || !ctx) return;
    const now = ctx.currentTime;
    amb.gain.gain.cancelScheduledValues(now);
    amb.gain.gain.setValueAtTime(amb.gain.gain.value, now);
    amb.gain.gain.linearRampToValueAtTime(0.0001, now + 1.1);
    const oscillators = amb.oscillators;
    const noiseSource = amb.noiseSource;
    setTimeout(() => {
      oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // already stopped
        }
      });
      try {
        noiseSource?.stop();
      } catch {
        // already stopped
      }
    }, 1200);
    ambientRef.current = null;
  }, []);

  // Lets the ambient score respond live to the mute toggle instead of only
  // gating at the moment it starts — a continuous bed, unlike the one-shot
  // sounds above, needs to actually go quiet mid-playback.
  useEffect(() => {
    const amb = ambientRef.current;
    const ctx = ctxRef.current;
    if (!amb || !ctx) return;
    const now = ctx.currentTime;
    amb.gain.gain.cancelScheduledValues(now);
    amb.gain.gain.setValueAtTime(amb.gain.gain.value, now);
    amb.gain.gain.linearRampToValueAtTime(muted ? 0.0001 : amb.targetGain, now + 0.4);
  }, [muted]);

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
        unmuteForIntro,
        startAmbientScore,
        stopAmbientScore,
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
