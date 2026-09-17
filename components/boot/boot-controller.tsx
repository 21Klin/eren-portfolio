"use client";

import { useState } from "react";
import { BootSequence } from "@/components/boot/boot-sequence";
import { clearBootSeen } from "@/lib/boot-session";
import { useBootStatus } from "@/lib/boot-status";

export function BootController() {
  const [bootKey, setBootKey] = useState(0);
  const { markComplete, reset } = useBootStatus();

  const handleReplay = () => {
    clearBootSeen();
    reset();
    setBootKey((k) => k + 1);
  };

  return (
    <>
      <BootSequence key={bootKey} onComplete={markComplete} />
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
