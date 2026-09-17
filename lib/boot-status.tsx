"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type BootStatusContextValue = {
  bootComplete: boolean;
  /** Bumped on every replay so consumers can remount and reset local state via `key`. */
  generation: number;
  markComplete: () => void;
  reset: () => void;
};

const BootStatusContext = createContext<BootStatusContextValue | null>(null);

export function BootStatusProvider({ children }: { children: ReactNode }) {
  const [bootComplete, setBootComplete] = useState(false);
  const [generation, setGeneration] = useState(0);
  const markComplete = useCallback(() => setBootComplete(true), []);
  const reset = useCallback(() => {
    setBootComplete(false);
    setGeneration((g) => g + 1);
  }, []);

  return (
    <BootStatusContext.Provider
      value={{ bootComplete, generation, markComplete, reset }}
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
