import { ACCENT_COLOR } from "@/lib/theme";

export type ScrollZone = {
  id: string;
  color: string;
};

// Every zone stays in the site's single accent hue family (see lib/theme.ts) —
// only lightness/saturation shift per section, never a competing color.
export const SCROLL_ZONES: ScrollZone[] = [
  { id: "hero", color: ACCENT_COLOR },
  { id: "about", color: "#00c8d6" },
  { id: "projects", color: ACCENT_COLOR },
  { id: "skills", color: "#00fff0" },
  { id: "achievements", color: "#33f3ff" },
  { id: "contact", color: "#00838c" },
];
