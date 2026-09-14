# EREN MURTISHI — PORTFOLIO SITE BUILD PLAN

**Project codename:** `mainframe` (or pick your own)
**Aesthetic:** Hacker / AI / Matrix — dark, dense, heavily animated, terminal/system UI language
**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion + GSAP/ScrollTrigger + Three.js / React Three Fiber
**Deployment target:** Vercel or Cloudflare Pages

---

## HOW TO USE THIS DOCUMENT

This is a phased build plan. Work through the phases **in order**, one at a time.
After each phase:
1. Run the dev server and actually look at what was built.
2. Confirm it works and looks right before moving to the next phase.
3. Do not skip ahead — later phases assume earlier ones are done and stable.

Each phase is scoped to be completable and testable in a single sitting.
If a phase feels too big when you get to it, stop and split it into
smaller steps rather than rushing through it.

---

## CONTENT REFERENCE

All final copy for the site is below. Use this content exactly — do not
invent or rephrase achievements, project descriptions, or the title.

### Identity / Hero

**Name:** Eren Murtishi

**Title:**
> Founder & Chief Executive Officer of Egy AI — Principal Architect of
> Ultracognitive AI & Neurosynthetic Systems, Full-Spectrum Metastack
> Software, and High-Performance, Custom Liquid-Cooled Hardware Systems

**Boot sequence text (sequential lines):**
```
ESTABLISHING UPLINK...
TRIANGULATING SIGNAL...
CONNECTING TO STATION [EREN.SYS]...
```
Followed by a percentage counter (non-linear, stalls/jumps), a glitch
flash, then "CONNECTION ESTABLISHED", then reveal the site.

### About

I build systems that think, trade, serve, and run — from the code down
to the copper.

Egy AI is a crypto trading platform I founded and lead as CEO, built
around a genetic algorithm trading bot of my own design. Rather than
following fixed rules, the bot maintains a population of trading
strategies encoded as digital "genomes" — each one a distinct set of
parameters governing entry/exit logic, risk tolerance, and market
signal weighting. Every generation, strategies are evaluated against
live and historical market data, the strongest performers survive and
reproduce through crossover and mutation, and the weak get culled. Over
successive generations, the population evolves toward strategies no
human explicitly programmed — the market selects the trader, not the
other way around.

Beyond Egy AI, I've built production-grade AI systems end to end: a
full-stack AI hotel receptionist with real-time booking, an
availability engine, and live AI tool-calling; and an AI-powered
business operations platform combining CRM, automated lead scoring,
and a workflow automation engine for enterprise clients.

My stack runs deep — Python, JavaScript, TypeScript, C++, C#, SQL —
across frameworks and infrastructure including React, Next.js,
Node.js, Tailwind, Firebase, Redis, WebSockets, and REST/AI
tool-calling APIs, with hands-on experience integrating LLMs directly
into production systems. On the hardware side: full custom PC builds,
liquid-cooling loop design and installation, and component-level
diagnostics and repair.

I'm a student at Yahya Kemal College in Struga, North Macedonia.

### Projects

**Egy AI — Low-Latency Genetic Algorithm Adaptive Trading Framework**
Live: https://egy-ai.pages.dev · Open source, MIT License

Egy AI is a browser-based algorithmic trading platform for BTC/USDT
that doesn't run on fixed, hand-coded rules — it evolves its own
trading strategy in real time using a genetic algorithm. The system
maintains a live population of 24 strategy variants ("genomes"), each
backtested against the 500 most recent one-minute candles every 45
seconds. The top 4 performers survive unchanged (elitism); the
remaining 20 slots are filled through tournament selection, arithmetic
crossover, and random mutation. Across generations, the population
converges on parameter combinations no human explicitly programmed.

Across testing sessions, evolved populations consistently converged
within 8–12 generations, with fast moving-average periods settling
around 7–14 candles and slow moving averages around 28–45 candles — a
range independently consistent with established intraday BTC trading
literature. Over 1,000 simulated trades were executed across all
testing sessions, with the built-in stop-loss circuit breaker
triggering correctly in 2 of 12 sessions during sustained breakout
events.

The entire genetic algorithm runs client-side in the browser — no
backend server required for core functionality — connected directly to
Binance's public WebSocket API across four concurrent live data
streams (trade, order book depth, ticker, and kline data). The
platform also includes a live trading terminal, a real-time GA
dashboard for watching evolution happen generation-by-generation, an
equity curve and bot history view, a six-chapter educational section
teaching genetic algorithms and crypto markets to students, and a full
user profile/auth system.

Tech stack: Next.js 14 (App Router), TypeScript, Zustand, Tailwind CSS,
Recharts, TradingView widget, Firebase Auth, Cloud Firestore, Binance
WebSocket API, Cloudflare Pages

---

**Grand Horizon Hotel — AI Receptionist**
Live: https://hotel-receptionist.vercel.app · Admin at /admin

A production-quality AI hotel receptionist built end-to-end for a demo
property, "Grand Horizon Hotel" — designed to handle real guest
interactions, not a scripted chatbot demo. The system combines a
conversational AI front-end with a full booking and availability
engine, real-time room inventory management, and an admin dashboard
for hotel staff to manage reservations, guests, and operations.

The AI receptionist uses live tool-calling to actually check room
availability, create bookings, and answer guest questions grounded in
real data — rather than hallucinating responses. The entire system was
built and shipped across 19 planned development phases, from initial
architecture and database schema design through to full deployment.

Tech stack: React, TypeScript, Node.js, Firebase, Redis, WebSockets,
REST APIs, AI tool-calling

---

**Northstar Command Center — AI-Powered Business Operations & Automation Platform**
Live: https://ai-command-center-app.vercel.app

An AI-powered business operations platform built for a demo
real-estate agency, "Northstar Property Group" — a public-facing
client site paired with a full internal operations system behind
role-gated authentication. Every number on every dashboard is backed
by a real database row; nothing in the UI is faked.

The system combines a CRM with AI-driven lead classification and
sentiment analysis, an AI admin assistant with function-calling/tool
use for operational tasks, and a custom-built workflow automation
engine — designed and implemented from scratch rather than wired to a
third-party workflow tool. Workflows are modeled as events triggering
conditions that queue step executions, backed by a database-driven job
queue polled on a scheduled cron cycle. Role-gated route protection is
enforced at the edge via middleware, and the entire platform is built
with strict type safety end to end.

Tech stack: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind
CSS v4, Prisma ORM → Neon Postgres, Google Gemini (@google/genai) for
lead classification and AI assistant tool-calling, iron-session
authentication with scrypt hashing, Resend for transactional email,
Vitest for unit and integration testing, deployed on Vercel

### Skills / Tech Stack

**Languages:** HTML, CSS, JavaScript, TypeScript, C++, C#, SQL

**Styling & CSS Tooling:** Tailwind CSS, PostCSS, Radix UI, Panda CSS

**Frontend Frameworks & Libraries:** React, Next.js, Zustand, Recharts,
TradingView Widget

**Backend & Runtime:** Node.js, Prisma ORM, REST APIs, WebSockets, Edge
Middleware, Turbopack

**Databases:** Neon Postgres, Firebase / Cloud Firestore, Redis

**AI & Computation:** LLM Integration & Tool-Calling, Genetic
Algorithms & Evolutionary Computation, Numeric/Numerical Computing

**Auth, Email & Testing:** iron-session, Resend, Vitest

**Hardware:** Custom PC Builds, Liquid-Cooling Loop Design &
Installation, Hardware Diagnostics & Repair

**Tooling & Workflow:** Git & GitHub, npm Package Management,
Environment Variables & Secrets Management, Vercel & Cloudflare
Deployment Workflows, Browser DevTools Debugging, JSON & API Design,
Responsive/Mobile-First Design, Cron Jobs & Scheduled Tasks

### Achievements & Competitions

**International Competitions & Olympiads**
- VILIPO — Vilnius International Project Olympiad 2026 (Vilnius,
  Lithuania) — 1st Place, Gold Medal, and Best Project Award (#1
  overall) — the highest individual distinction awarded among all
  international entries at one of Europe's premier student innovation
  olympiads
- Infomatrix Asia 2026 (Astana, Kazakhstan) — Silver Medal,
  International Project Competition — recognized with a full
  scholarship to Energo University (Almaty, Kazakhstan) in
  acknowledgment of outstanding achievement in science, technology,
  and innovation
- BOSEPO — 17th Bosnian Science Project Olympiad (Sarajevo, Bosnia and
  Herzegovina) — Participant, Senior Category
- 19th International Turkish Language Olympiad (Ala-Too International
  University, Kyrgyzstan) — Gold Medal, Beginner Level Turkish
  Language Competition, first place among competing international
  finalists
- Turkish Olympiads (Yahya Kemal College) — 1st Place
- Hoobit International Ideathon 2025 — Certificate of Participation
- Economics Olympiad — Struga, North Macedonia 2025–2026 — Local
  Round, 23/25 (92%)
- ASEF Albania 2025–2026 — 2nd Place, Silver Medal, regional
  international science competition (certificate pending)
- FirSTep PBL Competition — Local Round, Struga, North Macedonia —
  1st Place
- FirSTep PBL Competition — Local Round, Struga, North Macedonia —
  2nd Place
- FirSTep PBL Competition — Romania — 2nd Place, Silver Medal,
  international round of the FirSTep Project-Based Learning
  Competition (certificate pending)

**Chess**
- FIDE Arena FIDE Master (AFM) — Official title, 2026
- FIDE Arena Candidate Master — Official title, 2026
- FIDE Online Arena Rapid Championship — 1st Place, Rapid 10m
- FIDE Online Arena Rapid Championship — 2nd Place, Rapid 10m
- FOA Rapid 45+10 Championships — 3rd Place, Rapid 45m

**Technical Certifications**
- Anthropic — AI Fluency: AI Capabilities & Limitations
- Cisco Networking Academy — Hardware and Upgrade Support
- IBM SkillsBuild — User Experience Design Fundamentals
- #YouthEmpowered — Skills for Success (Education Center of Pivara
  Skopje / Motiva)

**HackerRank Certifications**
- Software Engineer (role certification)
- Software Engineer Intern (role certification)
- Frontend Developer, React (role certification)
- Problem Solving — Intermediate
- Problem Solving — Basic
- JavaScript — Intermediate
- JavaScript — Basic
- Node.js — Intermediate
- Node.js — Basic
- Python — Basic
- CSS — Basic
- REST API — Intermediate

**Financial Literacy Certifications — VibeOnEdu (Sparkasse Bank)**
A complete financial education curriculum covering personal, business,
and institutional finance, completed through VibeOnEdu's platform in
partnership with Sparkasse Bank, June 2026.
- Fraud & Data Theft
- Digital Trends
- Starting a Business
- Legal Entity Registration
- Saving
- Cards
- Debt
- Security
- E-Banking
- Real Estate
- Personal Finance
- Insurance
- Leasing
- Finance
- Investing
- Badges: Financial Pioneer, Conqueror of Challenges, Investor in the
  Future, Winning Mindset, Future CFO

### Contact

Email: jellyslogoman12345@gmail.com

### Certificate/Medal Image Assets

Cleaned certificate images live in `/certificates_enhanced/` (deskewed,
cropped, color-corrected from phone photos). Medal photos to be added
later. Map each achievement above to its corresponding image file
where one exists.

---

## PHASE-BY-PHASE BUILD PLAN

### PHASE 1 — Project Scaffolding
- Initialize Next.js (App Router) + TypeScript project
- Install and configure Tailwind CSS
- Set up folder structure: `/app`, `/components`, `/lib`, `/public/assets`
- Install Framer Motion, GSAP (+ ScrollTrigger plugin), Three.js, @react-three/fiber, @react-three/drei
- Set up a base dark theme in Tailwind config: background near-black, single accent color (pick ONE: matrix green `#00FF41`, electric cyan `#00F0FF`, or violet `#B026FF` — don't mix)
- Set up monospace font for headings/terminal text (e.g. JetBrains Mono or Space Mono via next/font) and a clean sans for body copy
- Confirm: empty page loads with correct dark background and fonts render correctly

### PHASE 2 — Boot Sequence, Part 1 (Static Structure)
- Build a full-screen overlay component `<BootSequence />` that renders on top of everything on first load
- Static layout only: black background, centered terminal-style text block, blinking cursor element
- No animation yet — just get the structure and positioning right
- Confirm: overlay covers the full viewport and looks right at different screen sizes

### PHASE 3 — Boot Sequence, Part 2 (Typing Animation)
- Implement typewriter effect for the three boot lines (ESTABLISHING UPLINK... / TRIANGULATING SIGNAL... / CONNECTING TO STATION [EREN.SYS]...), one line at a time
- Each line should have a slight stutter/flicker on arrival (small random delay between characters, or a brief flash)
- Confirm: lines type in correctly, timing feels right (not too fast, not sluggish)

### PHASE 4 — Boot Sequence, Part 3 (Progress Bar + Glitch)
- Add a percentage counter/progress bar beneath the text
- Make it non-linear: jump, stall, spike (NOT a smooth linear fill)
- On reaching 100%, trigger a glitch effect: brief RGB channel split, static noise flash, horizontal tear — implement via CSS clip-path animation or a canvas noise overlay
- Follow with "CONNECTION ESTABLISHED" flash text, then a sharp zoom/flash-white transition
- Confirm: full sequence plays start to finish, glitch effect looks intentional not broken

### PHASE 5 — Boot Sequence, Part 4 (Skip Button + Session Logic)
- Add a subtle "skip" link/button in a corner, appearing after ~1.5 seconds
- Store in sessionStorage/localStorage whether the user has seen the boot sequence this session — skip automatically on repeat visits within the same session (but allow a manual replay option somewhere, e.g. a small icon in the footer or nav)
- Confirm: skip works, repeat visits don't force the full sequence again

### PHASE 6 — Background Particle System (Static)
- Build the React Three Fiber canvas that will sit behind the entire site as a fixed background layer
- Render a static field of particles/nodes (no animation yet) using the chosen accent color
- Confirm: canvas renders behind content without blocking scroll/clicks, performs acceptably

### PHASE 7 — Background Particle System (Animated + Interactive)
- Animate particles with subtle drift/movement
- Add cursor-proximity interaction: particles near the cursor attract or repel slightly
- Confirm: animation is smooth (test on a lower-end device or throttled CPU in devtools), doesn't tank frame rate

### PHASE 8 — Custom Cursor
- Build a custom cursor component: default state is a small dot or ring
- On hovering interactive elements (links, buttons, cards), morph the cursor shape (e.g. dot → ring, or ring → crosshair)
- Add a fading trail effect behind cursor movement
- Confirm: cursor tracks smoothly, morphs correctly on hover targets, doesn't lag

### PHASE 9 — Global Layout Shell
- Build the persistent page shell: navigation (fixed/sticky, minimal — section links), footer
- Wire up smooth-scroll navigation between sections
- Confirm: nav links scroll to correct sections, layout doesn't shift/jump

### PHASE 10 — Hero Section, Static
- Build the Hero section layout: name, title (the full long title — decide how it's split visually, e.g. main line + smaller sub-line, or a rotating/typing sub-line)
- Static version first, no animation
- Confirm: text is legible at this length, layout doesn't break on mobile

### PHASE 11 — Hero Section, Animated
- Add terminal-style typing effect for the name/title reveal after the boot sequence transitions in
- If using the "rotating phrase" approach for the long title, implement the decode/scramble text effect (letters cycle through random characters before settling) for each segment
- Confirm: animation timing feels right, text is readable once settled

### PHASE 12 — Scroll-Driven Section Transitions (Setup)
- Set up GSAP ScrollTrigger for section-based transitions
- Define distinct visual "zones" per major section (Hero, About, Achievements, Projects, Skills, Contact) — each can have a subtle shift in background particle color/behavior or ambient tone as the user scrolls into it
- Confirm: scroll triggers fire at the right scroll positions, no jank

### PHASE 13 — About Section
- Build the About section using the locked About copy
- Style as a readable text block — resist over-decorating this section, it's the one place plain readability matters most
- Add one deliberate scroll-reveal moment (not fade-and-slide-up on every line — one clean reveal for the section as a whole)
- Confirm: text is readable, line lengths aren't too long on desktop

### PHASE 14 — Projects Section, Layout
- Build the Projects section with 3 project cards (Egy AI, Grand Horizon Hotel AI Receptionist, Northstar Command Center)
- Each card: project name, one-line tagline, tech stack tags, live demo link
- Static grid/list layout first
- Confirm: all 3 projects display correctly, links work

### PHASE 15 — Projects Section, 3D Card Effects
- Add 3D tilt-on-hover effect to project cards (CSS 3D transforms or react-three-fiber, whichever is lighter weight — prefer CSS transforms unless a specific effect requires WebGL)
- Add depth/blur effect tied to scroll position (cards sharpen as they enter viewport center, blur slightly at edges)
- Confirm: effect feels smooth, doesn't cause layout shift

### PHASE 16 — Projects Section, Expanded Detail View
- Implement click-to-expand or a dedicated per-project view showing the full project description (the detailed writeups from the content reference)
- Confirm: full descriptions display correctly, expand/collapse (or navigation) works smoothly

### PHASE 17 — Skills Section, Static
- Build the Skills/Tech Stack section using the locked category list
- Static layout: grouped categories as defined (Languages, Styling & CSS Tooling, Frontend Frameworks, Backend & Runtime, Databases, AI & Computation, Auth/Email/Testing, Hardware, Tooling & Workflow)
- Confirm: all categories and items render, readable at a glance

### PHASE 18 — Skills Section, "Live System Readout" Animation
- Animate the skills section to look like a live system status readout: bars filling in, blinking status indicators next to each category, subtle flicker/scan-line effect
- Confirm: animation reads as "system status" rather than a generic progress bar, performs well

### PHASE 19 — Achievements Section, Layout Structure
- Build the Achievements & Competitions section with the category groupings: International Competitions & Olympiads, Chess, Technical Certifications, HackerRank Certifications, Financial Literacy Certifications
- Given the volume of content, use a grouped/collapsible or tabbed layout rather than one long flat list
- Confirm: all groups render, navigation between groups works

### PHASE 20 — Achievements Section, Individual Entries
- Build the individual achievement "card" or "entry" component: title, organization, location, placement/result, and a flag for pending items (ASEF Albania, FirSTep Romania — mark clearly as pending, don't hide this)
- Populate all entries from the content reference
- Confirm: every achievement listed in the content reference appears somewhere in this section, nothing missing

### PHASE 21 — Achievements Section, Certificate Image Integration
- Wire up the cleaned certificate images from `/certificates_enhanced/` to their corresponding achievement entries
- Implement click-to-expand for viewing the full certificate image
- Confirm: images load correctly, match the correct achievement, expand/lightbox works

### PHASE 22 — Achievements Section, Verification Links
- For achievements with real public verification links (HackerRank certificates, Anthropic/Skilljar certificate, IBM/Credly badge), add "Verify" links out to the live verification pages
- Confirm: all verification links are correct and working

### PHASE 23 — Achievements Section, Visual Polish
- Style this section with the "system achievement / unlocked log entry" visual treatment discussed (terminal-log styling, checkmarks/verified tags, consistent iconography per category)
- Confirm: section feels organized and impressive rather than overwhelming — do a full scroll-through review

### PHASE 24 — Contact Section
- Build the Contact section with the email address (jellyslogoman12345@gmail.com)
- Style as a "transmitted message" moment consistent with the site's aesthetic (e.g. a terminal-style output line, or a styled mailto link with a matching visual treatment)
- Leave room to add more contact methods later (Upwork, GitHub, etc.) without restructuring
- Confirm: email link works (opens mail client correctly)

### PHASE 25 — Terminal Easter Egg
- Build a small interactive command-line widget, tucked in a corner (e.g. bottom-right, collapsible)
- Support basic commands: `whoami`, `projects`, `contact`, `help`, and one hidden/joke command of your choice
- Each command returns real content pulled from the site's data (not a dead end)
- Confirm: terminal widget works, commands return correct output, doesn't interfere with page scroll/interaction

### PHASE 26 — Sound Design (Optional Layer)
- Add subtle UI sound effects: hover blips, click confirmations, boot sequence ambient hum
- Muted by default — add a clear mute/unmute toggle, respect that browsers block autoplay audio until user interaction
- Confirm: sounds only play after user interaction/unmute, toggle works, no jarring/loud effects

### PHASE 27 — Mobile Responsiveness Pass
- Go through every section on mobile viewport sizes (375px, 414px, tablet breakpoints)
- Simplify or disable the heaviest effects on mobile where needed (e.g. reduce particle count, simplify custom cursor to standard cursor on touch devices, ensure tap targets are large enough)
- Confirm: full site is usable and doesn't break on mobile, no horizontal scroll issues

### PHASE 28 — Performance Pass
- Audit frame rate and load time (Lighthouse, Chrome DevTools Performance tab)
- Optimize: lazy-load below-the-fold sections/images, reduce particle count if needed, check for unnecessary re-renders, compress certificate images if not already optimized
- Confirm: acceptable load time and consistent frame rate, especially for the boot sequence and particle background

### PHASE 29 — Accessibility Pass
- Add visible keyboard focus states throughout
- Respect `prefers-reduced-motion` — provide a reduced-motion fallback for the boot sequence and heavy animations
- Check color contrast on all text against backgrounds
- Confirm: site is navigable via keyboard, reduced-motion users get a reasonable experience

### PHASE 30 — Cross-Browser & Final QA
- Test in Chrome, Firefox, Safari (and mobile Safari specifically, since it handles some CSS/WebGL differently)
- Full end-to-end walkthrough: boot sequence → every section → every link → contact → terminal easter egg
- Fix any visual bugs found
- Confirm: consistent experience across browsers, no console errors

### PHASE 31 — Deployment
- Deploy to Vercel or Cloudflare Pages (whichever you prefer to standardize on across your projects)
- Set up custom domain if you have one, or confirm the default deployment URL
- Confirm: live site matches local dev experience, all links/assets resolve correctly in production

---

## OPTIONAL / STRETCH PHASES (only after 1–31 are solid)

### PHASE 32 — Custom GLSL Shaders
- Replace default Three.js materials in the background particle system with a hand-written shader for a more distinctive visual (energy field, liquid distortion, or similar)

### PHASE 33 — Post-Processing Pipeline
- Add the `postprocessing` library: bloom on bright elements (accent-colored text/particles), subtle chromatic aberration, film grain
- This is the single biggest lever for a "cinematic" look — apply carefully, it's easy to overdo

### PHASE 34 — Physics-Based Interactions
- Add a physics engine (Rapier or Cannon.js) for one specific interactive moment (e.g. project cards that can be "flicked" and settle with realistic motion) — don't apply this everywhere, pick one moment

### PHASE 35 — Medal Photo Gallery
- Once medal photos are taken, build a dedicated gallery/lightbox for them, cross-linked from the relevant Achievements entries

---

## NOTES

- Do not invent achievement details, project descriptions, or stats not
  present in the Content Reference section above.
- Two achievements are marked "(certificate pending)" — keep that
  status visible in the UI rather than presenting them as fully
  verified until the actual certificates are added.
- The title is intentionally long and dense — do not shorten or
  simplify it without checking first.
