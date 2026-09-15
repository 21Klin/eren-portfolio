const BOOT_SESSION_KEY = "eren-sys-boot-seen";

export function hasSeenBoot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(BOOT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markBootSeen() {
  try {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
  } catch {
    // storage unavailable (private browsing, disabled) — safe to ignore
  }
}

export function clearBootSeen() {
  try {
    sessionStorage.removeItem(BOOT_SESSION_KEY);
  } catch {
    // storage unavailable — safe to ignore
  }
}
