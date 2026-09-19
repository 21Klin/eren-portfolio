"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import type { Body, World } from "cannon-es";

// cannon-es is dynamically imported on the first actual grab, not on mount —
// most visitors never drag a card, so this keeps the physics engine (and its
// setup cost) off the critical path entirely for them, and off touch/
// reduced-motion visitors forever (the caller gates `enabled` for that).
const REST_POSITION_EPSILON = 0.05;
const REST_VELOCITY_EPSILON = 0.02;
const REST_ANGLE_EPSILON = 0.01; // radians
const SPRING_STIFFNESS = 90;
const SPRING_DAMPING = 4.5; // underdamped on purpose: settling overshoots a little before it rests
const LINEAR_DAMPING = 0.65;
const ANGULAR_DAMPING = 0.75;
// cannon-es's Spring is a purely linear (center-to-center) force — it has no
// opinion about rotation, so without this a flick's spin would decay via
// angularDamping alone and the card could settle stuck at whatever tilt it
// had when angular velocity happened to bleed out, instead of coming back
// level. This is a matching torsional spring-damper applied by hand.
const ANGULAR_SPRING_STIFFNESS = 10;
const ANGULAR_SPRING_DAMPING = 1.4;
const VELOCITY_SAMPLE_WINDOW_MS = 120;
const FLICK_SPIN_SCALE = 0.05;
const MAX_SUBSTEPS = 5;

export interface CardDragPhysics {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotateZ: MotionValue<number>;
  // Lifted while grabbed or still mid-flight, so a thrown card visually
  // clears its neighbors instead of painting underneath them in DOM order.
  isLifted: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

interface PointerSample {
  x: number;
  y: number;
  t: number;
}

// One independent physics world per card (a dynamic body tethered to a
// static anchor by a spring) rather than one shared world — with at most
// three cards there's no meaningful cost difference, and it keeps each
// card's lifecycle (mount/unmount, settle/sleep) fully self-contained.
export function useCardDragPhysics(enabled: boolean): CardDragPhysics {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateZ = useMotionValue(0);
  const [isLifted, setIsLifted] = useState(false);

  const worldRef = useRef<World | null>(null);
  const bodyRef = useRef<Body | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });
  const pointerSamplesRef = useRef<PointerSample[]>([]);
  // Caches the in-flight init promise so concurrent callers (a proactive
  // mount-time preload racing an actual grab) await the same world instead
  // of each starting their own.
  const worldInitRef = useRef<Promise<void> | null>(null);

  const ensureWorld = useCallback(() => {
    if (worldRef.current) return Promise.resolve();
    if (worldInitRef.current) return worldInitRef.current;

    worldInitRef.current = (async () => {
      const CANNON = await import("cannon-es");

      const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
        linearDamping: LINEAR_DAMPING,
        angularDamping: ANGULAR_DAMPING,
      });
      // Restrict the 3D rigid body to a 2D world: move in x/y only, spin
      // around z only — the standard trick for using a 3D engine as a 2D one.
      body.linearFactor.set(1, 1, 0);
      body.angularFactor.set(0, 0, 1);
      world.addBody(body);

      const anchor = new CANNON.Body({ mass: 0 });
      world.addBody(anchor);

      const spring = new CANNON.Spring(body, anchor, {
        restLength: 0,
        stiffness: SPRING_STIFFNESS,
        damping: SPRING_DAMPING,
      });
      world.addEventListener("preStep", () => {
        spring.applyForce();
        // Torsional counterpart to the linear spring above (see the
        // ANGULAR_SPRING_* comment): pulls the tilt back to level.
        const angle = Math.atan2(body.quaternion.z, body.quaternion.w) * 2;
        body.torque.z +=
          -angle * ANGULAR_SPRING_STIFFNESS -
          body.angularVelocity.z * ANGULAR_SPRING_DAMPING;
      });

      worldRef.current = world;
      bodyRef.current = body;
    })();

    return worldInitRef.current;
  }, []);

  const stepLoop = useCallback(
    // Named function expression so the recursive call below resolves through
    // this function's own binding rather than the outer `const` — the
    // hooks linter can't otherwise verify the self-reference is safe.
    function stepLoop(time: number) {
      const world = worldRef.current;
      const body = bodyRef.current;
      if (!world || !body) return;

      const dt = lastStepTimeRef.current
        ? Math.min((time - lastStepTimeRef.current) / 1000, 1 / 30)
        : 1 / 60;
      lastStepTimeRef.current = time;

      world.step(1 / 60, dt, MAX_SUBSTEPS);
      x.set(body.position.x);
      y.set(body.position.y);
      // Body only ever rotates about z, so its quaternion encodes a plain
      // 2D angle: standard q = (0, 0, sin(a/2), cos(a/2)) extraction.
      const angleRad = Math.atan2(body.quaternion.z, body.quaternion.w) * 2;
      rotateZ.set((angleRad * 180) / Math.PI);

      const atRest =
        Math.abs(body.position.x) < REST_POSITION_EPSILON &&
        Math.abs(body.position.y) < REST_POSITION_EPSILON &&
        Math.abs(angleRad) < REST_ANGLE_EPSILON &&
        body.velocity.length() < REST_VELOCITY_EPSILON &&
        Math.abs(body.angularVelocity.z) < REST_VELOCITY_EPSILON;

      if (atRest) {
        body.position.set(0, 0, 0);
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
        body.quaternion.set(0, 0, 0, 1);
        x.set(0);
        y.set(0);
        rotateZ.set(0);
        rafRef.current = null;
        lastStepTimeRef.current = 0;
        setIsLifted(false);
        return; // settled — stop scheduling until the next grab
      }

      rafRef.current = requestAnimationFrame(stepLoop);
    },
    [x, y, rotateZ],
  );

  const scheduleLoop = useCallback(() => {
    if (rafRef.current == null) {
      lastStepTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(stepLoop);
    }
  }, [stepLoop]);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const body = bodyRef.current;
      if (!draggingRef.current || !body) return;

      const nx = event.clientX - dragStartOffsetRef.current.x;
      const ny = event.clientY - dragStartOffsetRef.current.y;
      body.position.set(nx, ny, 0);
      body.velocity.set(0, 0, 0);
      x.set(nx);
      y.set(ny);

      const now = performance.now();
      const samples = pointerSamplesRef.current;
      samples.push({ x: nx, y: ny, t: now });
      while (samples.length > 2 && now - samples[0].t > VELOCITY_SAMPLE_WINDOW_MS) {
        samples.shift();
      }
    },
    [x, y],
  );

  const onPointerUp = useCallback(
    // Named function expression for the same self-reference reason as
    // stepLoop above.
    function onPointerUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      const body = bodyRef.current;
      const samples = pointerSamplesRef.current;
      if (body && samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = Math.max((last.t - first.t) / 1000, 1 / 60);
        const vx = (last.x - first.x) / dt;
        const vy = (last.y - first.y) / dt;
        body.velocity.set(vx, vy, 0);
        body.angularVelocity.set(0, 0, -vx * FLICK_SPIN_SCALE);
      }
      pointerSamplesRef.current = [];
      scheduleLoop();
    },
    [onPointerMove, scheduleLoop],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      void ensureWorld().then(() => {
        const body = bodyRef.current;
        if (!body) return;
        draggingRef.current = true;
        dragStartOffsetRef.current = {
          x: clientX - body.position.x,
          y: clientY - body.position.y,
        };
        pointerSamplesRef.current = [
          { x: body.position.x, y: body.position.y, t: performance.now() },
        ];
        setIsLifted(true);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
      });
    },
    [enabled, ensureWorld, onPointerMove, onPointerUp],
  );

  // Warm the physics world as soon as this card is interactive, not on the
  // first grab — a dynamic import racing a fast flick can otherwise lose
  // the drag's early pointermove events (or even its pointerup) before
  // cannon-es finishes loading.
  useEffect(() => {
    if (enabled) void ensureWorld();
  }, [enabled, ensureWorld]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  return { x, y, rotateZ, isLifted, onPointerDown };
}
