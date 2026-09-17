"use client";

import { useEffect, useState } from "react";
import { hero } from "@/lib/data/site-content";
import { useBootStatus } from "@/lib/boot-status";

const [role, longTitle] = hero.title.split(" — ");

const KICKER_HOLD = 450;
const NAME_CHAR_DELAY_MIN = 30;
const NAME_CHAR_DELAY_MAX = 70;
const NAME_PAUSE = 250;
const ROLE_DECODE_DURATION = 650;
const ROLE_PAUSE = 250;

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

type Stage = "idle" | "name" | "role" | "title";

function useTypewriter(text: string, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || count >= text.length) return;
    const delay =
      NAME_CHAR_DELAY_MIN +
      Math.random() * (NAME_CHAR_DELAY_MAX - NAME_CHAR_DELAY_MIN);
    const timeout = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(timeout);
  }, [active, count, text]);

  return { display: text.slice(0, count), isComplete: count >= text.length };
}

function useDecodeText(text: string, active: boolean, durationMs: number) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!active) return;
    const frameMs = 40;
    const totalFrames = Math.round(durationMs / frameMs);
    let frame = 0;

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
                : SCRAMBLE_CHARS[
                    Math.floor(Math.random() * SCRAMBLE_CHARS.length)
                  ],
          )
          .join(""),
      );
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, frameMs);

    return () => clearInterval(interval);
  }, [active, text, durationMs]);

  return display;
}

export function HeroSection() {
  const { generation } = useBootStatus();
  return <HeroContent key={generation} />;
}

function HeroContent() {
  const { bootComplete } = useBootStatus();
  const [stage, setStage] = useState<Stage>("idle");

  useEffect(() => {
    if (!bootComplete || stage !== "idle") return;
    const timeout = setTimeout(() => setStage("name"), KICKER_HOLD);
    return () => clearTimeout(timeout);
  }, [bootComplete, stage]);

  const { display: nameDisplay, isComplete: nameComplete } = useTypewriter(
    hero.name,
    stage === "name",
  );

  useEffect(() => {
    if (stage !== "name" || !nameComplete) return;
    const timeout = setTimeout(() => setStage("role"), NAME_PAUSE);
    return () => clearTimeout(timeout);
  }, [stage, nameComplete]);

  const roleDisplay = useDecodeText(
    role,
    stage === "role",
    ROLE_DECODE_DURATION,
  );

  useEffect(() => {
    if (stage !== "role") return;
    const timeout = setTimeout(
      () => setStage("title"),
      ROLE_DECODE_DURATION + ROLE_PAUSE,
    );
    return () => clearTimeout(timeout);
  }, [stage]);

  const nameSettled = stage === "role" || stage === "title";
  const roleSettled = stage === "title";

  return (
    <section
      id="hero"
      className="flex min-h-screen scroll-mt-16 flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <p
        className={`font-mono text-xs uppercase tracking-[0.4em] text-accent ${
          bootComplete ? "animate-flicker-in" : "opacity-0"
        }`}
      >
        [ EREN.SYS — ONLINE ]
      </p>

      <h1 className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
        {stage === "idle" ? " " : nameSettled ? hero.name : nameDisplay}
        {stage === "name" && (
          <span className="ml-1 inline-block h-[0.9em] w-[0.5ch] translate-y-1 animate-blink bg-accent align-middle" />
        )}
      </h1>

      <p
        className={`max-w-3xl font-mono text-base text-accent sm:text-lg md:text-xl ${
          stage === "role" || stage === "title" ? "" : "opacity-0"
        }`}
      >
        {roleSettled ? role : roleDisplay || " "}
      </p>

      <p
        className={`max-w-2xl text-sm leading-relaxed text-muted sm:text-base ${
          stage === "title" ? "animate-fade-in" : "opacity-0"
        }`}
      >
        {longTitle}
      </p>
    </section>
  );
}
