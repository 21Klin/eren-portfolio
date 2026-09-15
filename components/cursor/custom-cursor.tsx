"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_LENGTH = 6;
const RING_EASE = 0.2;
const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, [data-cursor-hover]";

export function CustomCursor() {
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);

  const dotOuterRef = useRef<HTMLDivElement>(null);
  const ringOuterRef = useRef<HTMLDivElement>(null);
  const trailOuterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const raw = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const history = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 })),
  );

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setActive(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setActive(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("custom-cursor-active", active);
    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const handleMove = (event: PointerEvent) => {
      raw.current.x = event.clientX;
      raw.current.y = event.clientY;
    };
    const handleOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      setHovering(!!target?.closest(INTERACTIVE_SELECTOR));
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerover", handleOver);

    let frame: number;
    const tick = () => {
      const { x, y } = raw.current;

      if (dotOuterRef.current) {
        dotOuterRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      ringPos.current.x += (x - ringPos.current.x) * RING_EASE;
      ringPos.current.y += (y - ringPos.current.y) * RING_EASE;
      if (ringOuterRef.current) {
        ringOuterRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      history.current.push({ x, y });
      history.current.shift();
      trailOuterRefs.current.forEach((el, i) => {
        const point = history.current[i];
        if (el && point) {
          el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
        }
      });

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      cancelAnimationFrame(frame);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden="true"
    >
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailOuterRefs.current[i] = el;
          }}
          className="fixed left-0 top-0 will-change-transform"
        >
          <div
            className="h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
            style={{ opacity: (1 - i / TRAIL_LENGTH) * 0.3 }}
          />
        </div>
      ))}

      <div
        ref={ringOuterRef}
        className="fixed left-0 top-0 will-change-transform"
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 border border-accent/70 transition-all duration-200 ease-out ${
            hovering
              ? "h-10 w-10 rotate-45 rounded-sm border-accent"
              : "h-6 w-6 rounded-full"
          }`}
        />
      </div>

      <div
        ref={dotOuterRef}
        className="fixed left-0 top-0 will-change-transform"
      >
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      </div>
    </div>
  );
}
