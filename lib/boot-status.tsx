"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type BootStatusContextValue = {
  bootComplete: boolean;
  /** Bumped on every replay so consumers can remount and reset local state via `key`. */
  generation: number;
  markComplete: () => void;
  reset: () => void;
  /** True while the locator intro's own canvas is up front — the persistent
   * background canvas reads this to stay unmounted meanwhile, so only one
   * WebGL context is ever active at a time. */
  locatorIntroActive: boolean;
  markLocatorIntroDone: () => void;
};

const BootStatusContext = createContext<BootStatusContextValue | null>(null);

export function BootStatusProvider({ children }: { children: ReactNode }) {
  const [bootComplete, setBootComplete] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [locatorIntroActive, setLocatorIntroActive] = useState(true);
  const markComplete = useCallback(() => setBootComplete(true), []);
  const markLocatorIntroDone = useCallback(() => setLocatorIntroActive(false), []);
  const reset = useCallback(() => {
    setBootComplete(false);
    setGeneration((g) => g + 1);
  }, []);

  return (
    <BootStatusContext.Provider
      value={{
        bootComplete,
        generation,
        markComplete,
        reset,
        locatorIntroActive,
        markLocatorIntroDone,
      }}
    >
      {children}
    </BootStatusContext.Provider>
  );
}

export function useBootStatus() {
  const ctx = useContext(BootStatusContext);
  if (!ctx) {
    throw new Error("useBootStatus must be used within a BootStatusProvider");
  }
  return ctx;
}
