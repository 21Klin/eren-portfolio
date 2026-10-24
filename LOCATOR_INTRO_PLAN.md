# LOCATOR INTRO SEQUENCE — BUILD PLAN
## (Plays before the existing terminal boot sequence)

## CONCEPT

Before the site's existing "ESTABLISHING UPLINK..." terminal boot sequence,
add a new cinematic intro: a satellite/tracking-system sequence that "finds"
Eren. Sequence order:

1. Black screen, single click-to-start gate (also unlocks audio — required
   by browser autoplay policy, so this doubles as the permission gesture)
2. A translucent, glowing cyan 3D Earth — wireframe grid shell over real
   continent textures, thin orbit rings, particle swarm — slowly rotating
3. Camera pushes in fast, flies toward the Balkans, lands on Struga, North
   Macedonia (41.1231°N, 20.6773°E) — a glowing hexagonal target marker
   locks onto the spot
4. Crossfade into a flat 2D tracking HUD overlay: scanning crosshair,
   ticking coordinate/data readouts on side panels, matching the site's
   existing monospace/cyan visual language
5. "TARGET LOCKED" — reveal the photo (wide shot first, then the moderate
   crop), with a bounding-box/tracking-dot overlay on Eren specifically
   (he's the one in the light grey suit)
6. Text reveal: "EREN MURTISHI — LOCATED", then hands off directly into
   the EXISTING terminal boot sequence (do not replace it — this new
   sequence is a prepended intro, the current boot sequence stays
   unchanged after it)

**Behavior:**
- Plays in full on EVERY visit (unlike the terminal boot sequence, this
  does NOT use session-skip persistence — no sessionStorage check)
- A visible skip button is present throughout, same visual treatment as
  the existing boot sequence's skip button
- Sound: reuse the Phase 26 Web Audio synthesis approach (no audio
  files) — add scanning/radar-style tones, a lock-on chime, and a
  whoosh/transition tone for the camera push-in

## ASSETS PROVIDED

Two images are provided in this batch:
- `full_scene_wide.png` — the full original photo: Eren (third from
  left, light grey suit, hands clasped) being interviewed alongside
  three other students, at an event with sponsor branding visible
  (Samsung, NLB Banka, Marriott Skopje, etc.) — this is from Eren
  presenting his project at an international project olympiad, covered
  by press
- `eren_target_crop.jpg` — a moderate head-to-knee crop centered on
  Eren specifically, already prepared — use this for the close-in
  "TARGET LOCKED" moment. Do not crop tighter than this (a face-only
  crop was explicitly rejected)

Sequence should show the wide photo first (establishing shot, as if the
system pulled the whole scene), then transition to the moderate crop for
the lock-on/bounding-box moment — not jump straight to the tight crop.

## PHASE-BY-PHASE BUILD PLAN

### PHASE L1 — Click-to-Start Gate
- Full-screen black overlay, single centered button/word (pick something
  that fits the aesthetic — e.g. "INITIALIZE", "BREACH", "ACCESS" — Eren
  can override the exact word later, don't overthink it)
- On click: unlock/resume the AudioContext (required user gesture), then
  begin Phase L2
- This overlay sits in front of (i.e. plays before) the existing boot
  sequence and background particle canvas
- Confirm: button is clickable, audio context resumes on click with no
  console warnings

### PHASE L2 — 3D Globe, Static
- New Three.js/React Three Fiber scene: a sphere with Earth continent
  texture, tinted cyan, with a translucent wireframe grid shell around
  it (slightly larger radius than the solid sphere) and a particle
  swarm/star shell further out
- Add 2-3 thin elliptical "orbit ring" lines around the globe at
  different angles (matching the reference video's look)
- Static render first, no rotation or camera movement yet
- Confirm: globe renders correctly, wireframe shell and orbit rings are
  visually distinct layers, not visually noisy/overlapping

### PHASE L3 — Globe Rotation + Ambient Motion
- Add slow continuous rotation to the globe
- Animate the particle swarm with subtle independent drift (similar
  technique to the existing background particle-field.tsx)
- Confirm: rotation is smooth, particles drift naturally, consistent
  frame rate

### PHASE L4 — Camera Flight Path to Struga
- Using GSAP, script a camera animation: starts at a wide orbital
  view of the globe, then pushes in toward the Balkans region,
  ending centered on Struga, North Macedonia (41.1231°N, 20.6773°E)
- Convert lat/long to 3D sphere surface coordinates for the camera's
  target point (standard spherical-to-cartesian conversion)
- The push-in should feel fast/dramatic, not slow and gentle — this is
  a "the system is hunting" moment
- Confirm: camera path is smooth, ends precisely oriented toward the
  correct coordinates, no jarring snaps

### PHASE L5 — Target Lock Marker
- At the end of the camera flight, render a glowing hexagonal target
  marker at the Struga coordinate (matching the reference video's
  hex-lock visual)
- Add a brief pulse/flash animation on lock, plus the lock-on sound cue
- Confirm: marker appears precisely at the right location, animation
  timing feels like a "catch," not a fade

### PHASE L6 — 2D Tracking HUD Overlay
- Build a 2D overlay (CSS/SVG, not 3D) that crossfades in as the globe
  scene fades/zooms past: scanning crosshair reticle, 2-3 side data
  panels with ticking monospace numbers/coordinates (fake but
  plausible-looking — lat/long readouts, signal strength, etc.),
  reuse the site's existing monospace font and cyan accent
- Confirm: overlay renders correctly, ticking data doesn't cause
  layout shift, crossfade timing feels intentional

### PHASE L7 — Photo Reveal, Wide Shot
- Fade in `full_scene_wide.png` inside a bordered "data panel" frame
  consistent with the HUD aesthetic
- Brief hold (1-2 seconds) so it reads as "found the scene" before
  zooming further
- Confirm: image displays at good quality, panel framing looks
  intentional not slapped-on

### PHASE L8 — Photo Reveal, Target Crop + Bounding Box
- Transition/zoom from the wide shot into `eren_target_crop.jpg`
- Overlay a "TARGET LOCKED" bounding box around Eren specifically
  (styled like the reference: a bracket-cornered rectangle, small
  tracking dots, a label callout), matching the reference video's
  facial-recognition HUD style
- Confirm: bounding box is correctly positioned over him in the
  cropped image, styling matches site's cyan/monospace aesthetic

### PHASE L9 — Identity Text Reveal
- After the bounding box locks, reveal text: "EREN MURTISHI" then
  "LOCATED" (or similar — match the terminal boot sequence's existing
  text-reveal style: typing or glitch-decode effect, not a plain fade)
- Confirm: text timing feels like a payoff, matches existing site
  typography/animation style

### PHASE L10 — Handoff to Existing Boot Sequence
- After the identity reveal completes, transition directly into the
  EXISTING terminal boot sequence ("ESTABLISHING UPLINK..." etc.) —
  no changes to that existing sequence, just chain into it
- Confirm: transition between the two sequences feels connected, not
  like two unrelated things bolted together; no flash of unstyled
  content between them

### PHASE L11 — Skip Button
- Add a visible skip button/link present throughout phases L2-L9
  (not needed during L1, since clicking start IS the action)
- Clicking skip jumps straight to the existing terminal boot sequence
  (not all the way to the final site — the terminal boot still plays)
- Style consistently with the existing boot sequence's skip button
- Confirm: skip works from any point in the sequence, no broken state

### PHASE L12 — Sound Design for the Sequence
- Using the existing Phase 26 Web Audio synthesis approach (no audio
  files), add: a soft ambient hum/tone during the globe rotation, a
  whoosh/rising tone during the camera push-in (Phase L4), a
  lock-on chime at the target marker (Phase L5), and a distinct tone
  at the identity reveal (Phase L9)
- All sound respects the existing mute toggle/localStorage preference
  from Phase 26 — do not create a separate mute system
- Confirm: sounds trigger at the right moments, muting the existing
  toggle silences this sequence too

### PHASE L13 — No Session-Skip Persistence (Explicit)
- Unlike the existing terminal boot sequence, this new intro sequence
  must NOT check sessionStorage to skip on repeat visits — it plays in
  full every time the site is opened (skip button remains the only way
  to shorten it)
- Confirm: reloading the page replays the full sequence from Phase L1
  every time

### PHASE L14 — Mobile & Performance Pass
- Test on mobile viewport: simplify the globe's particle count/shader
  complexity if needed to maintain acceptable frame rate, same
  discipline as the existing background particle system's mobile
  handling
- Confirm: sequence plays acceptably on a throttled/mobile-simulated
  device, no long freezes or dropped frames severe enough to break the
  effect

### PHASE L15 — Full End-to-End QA
- Play the full sequence start to finish in-browser: click-to-start →
  globe → flight → lock → HUD → photo reveal → bounding box → identity
  text → handoff into existing terminal boot → full site reveal
- Test skip button from multiple points
- Test on a fresh session (should NOT skip) and confirm sound/mute
  toggle carries over correctly from the existing Phase 26 system
- Commit and push once verified

## NOTES
- Do not replace or modify the existing terminal boot sequence — this
  is a new sequence that plays BEFORE it.
- Do not crop the reveal photo tighter than `eren_target_crop.jpg` —
  that crop was deliberately chosen to include enough context (not an
  extreme close-up).
- This sequence plays every visit — this is intentional, not an
  oversight, and differs from the existing boot sequence's
  session-skip behavior.
