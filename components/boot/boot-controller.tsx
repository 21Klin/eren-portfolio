"use client";

import { useState } from "react";
import { BootSequence } from "@/components/boot/boot-sequence";
import { LocatorIntro } from "@/components/locator-intro/locator-intro";
import { clearBootSeen } from "@/lib/boot-session";
import { useBootStatus } from "@/lib/boot-status";

export function BootController() {
  const [bootKey, setBootKey] = useState(0);
  const [locatorDone, setLocatorDone] = useState(false);
  const { markComplete, reset, markLocatorIntroDone } = useBootStatus();

  const handleReplay = () => {
    clearBootSeen();
    reset();
    setBootKey((k) => k + 1);
  };

  const handleLocatorComplete = () => {
    setLocatorDone(true);
    markLocatorIntroDone();
  };

  return (
    <>
      {/* Plays once per page load, every visit (no sessionStorage skip) —
          unlike BootSequence below, which it hands off into. */}
      {!locatorDone && <LocatorIntro onComplete={handleLocatorComplete} />}
      {locatorDone && <BootSequence key={bootKey} onComplete={markComplete} />}
      <button
        type="button"
        onClick={handleReplay}
        className="fixed bottom-4 left-4 z-10 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
      >
        &#8635; replay boot
      </button>
    </>
  );
}
