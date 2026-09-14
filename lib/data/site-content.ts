// Locked copy from PORTFOLIO_PLAN.md — do not rephrase or invent content here.
// Sections read from this file so copy lives in exactly one place.

export const hero = {
  name: "Eren Murtishi",
  title:
    "Founder & Chief Executive Officer of Egy AI — Principal Architect of Ultracognitive AI & Neurosynthetic Systems, Full-Spectrum Metastack Software, and High-Performance, Custom Liquid-Cooled Hardware Systems",
  bootLines: [
    "ESTABLISHING UPLINK...",
    "TRIANGULATING SIGNAL...",
    "CONNECTING TO STATION [EREN.SYS]...",
  ],
};

export const about = `I build systems that think, trade, serve, and run — from the code down to the copper.

Egy AI is a crypto trading platform I founded and lead as CEO, built around a genetic algorithm trading bot of my own design. Rather than following fixed rules, the bot maintains a population of trading strategies encoded as digital "genomes" — each one a distinct set of parameters governing entry/exit logic, risk tolerance, and market signal weighting. Every generation, strategies are evaluated against live and historical market data, the strongest performers survive and reproduce through crossover and mutation, and the weak get culled. Over successive generations, the population evolves toward strategies no human explicitly programmed — the market selects the trader, not the other way around.

Beyond Egy AI, I've built production-grade AI systems end to end: a full-stack AI hotel receptionist with real-time booking, an availability engine, and live AI tool-calling; and an AI-powered business operations platform combining CRM, automated lead scoring, and a workflow automation engine for enterprise clients.

My stack runs deep — Python, JavaScript, TypeScript, C++, C#, SQL — across frameworks and infrastructure including React, Next.js, Node.js, Tailwind, Firebase, Redis, WebSockets, and REST/AI tool-calling APIs, with hands-on experience integrating LLMs directly into production systems. On the hardware side: full custom PC builds, liquid-cooling loop design and installation, and component-level diagnostics and repair.

I'm a student at Yahya Kemal College in Struga, North Macedonia.`;

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  liveUrl: string;
  extraLinks?: { label: string; url: string }[];
  license?: string;
  description: string;
  stack: string[];
};

export const projects: Project[] = [
  {
    slug: "egy-ai",
    name: "Egy AI",
    tagline: "Low-Latency Genetic Algorithm Adaptive Trading Framework",
    liveUrl: "https://egy-ai.pages.dev",
    license: "Open source, MIT License",
    description: `Egy AI is a browser-based algorithmic trading platform for BTC/USDT that doesn't run on fixed, hand-coded rules — it evolves its own trading strategy in real time using a genetic algorithm. The system maintains a live population of 24 strategy variants ("genomes"), each backtested against the 500 most recent one-minute candles every 45 seconds. The top 4 performers survive unchanged (elitism); the remaining 20 slots are filled through tournament selection, arithmetic crossover, and random mutation. Across generations, the population converges on parameter combinations no human explicitly programmed.

Across testing sessions, evolved populations consistently converged within 8–12 generations, with fast moving-average periods settling around 7–14 candles and slow moving averages around 28–45 candles — a range independently consistent with established intraday BTC trading literature. Over 1,000 simulated trades were executed across all testing sessions, with the built-in stop-loss circuit breaker triggering correctly in 2 of 12 sessions during sustained breakout events.

The entire genetic algorithm runs client-side in the browser — no backend server required for core functionality — connected directly to Binance's public WebSocket API across four concurrent live data streams (trade, order book depth, ticker, and kline data). The platform also includes a live trading terminal, a real-time GA dashboard for watching evolution happen generation-by-generation, an equity curve and bot history view, a six-chapter educational section teaching genetic algorithms and crypto markets to students, and a full user profile/auth system.`,
    stack: [
      "Next.js 14 (App Router)",
      "TypeScript",
      "Zustand",
      "Tailwind CSS",
      "Recharts",
      "TradingView Widget",
      "Firebase Auth",
      "Cloud Firestore",
      "Binance WebSocket API",
      "Cloudflare Pages",
    ],
  },
  {
    slug: "grand-horizon-hotel",
    name: "Grand Horizon Hotel — AI Receptionist",
    tagline: "Full-stack AI hotel receptionist with live tool-calling",
    liveUrl: "https://hotel-receptionist.vercel.app",
    extraLinks: [{ label: "Admin", url: "https://hotel-receptionist.vercel.app/admin" }],
    description: `A production-quality AI hotel receptionist built end-to-end for a demo property, "Grand Horizon Hotel" — designed to handle real guest interactions, not a scripted chatbot demo. The system combines a conversational AI front-end with a full booking and availability engine, real-time room inventory management, and an admin dashboard for hotel staff to manage reservations, guests, and operations.

The AI receptionist uses live tool-calling to actually check room availability, create bookings, and answer guest questions grounded in real data — rather than hallucinating responses. The entire system was built and shipped across 19 planned development phases, from initial architecture and database schema design through to full deployment.`,
    stack: [
      "React",
      "TypeScript",
      "Node.js",
      "Firebase",
      "Redis",
      "WebSockets",
      "REST APIs",
      "AI tool-calling",
    ],
  },
  {
    slug: "northstar-command-center",
    name: "Northstar Command Center",
    tagline: "AI-Powered Business Operations & Automation Platform",
    liveUrl: "https://ai-command-center-app.vercel.app",
    description: `An AI-powered business operations platform built for a demo real-estate agency, "Northstar Property Group" — a public-facing client site paired with a full internal operations system behind role-gated authentication. Every number on every dashboard is backed by a real database row; nothing in the UI is faked.

The system combines a CRM with AI-driven lead classification and sentiment analysis, an AI admin assistant with function-calling/tool use for operational tasks, and a custom-built workflow automation engine — designed and implemented from scratch rather than wired to a third-party workflow tool. Workflows are modeled as events triggering conditions that queue step executions, backed by a database-driven job queue polled on a scheduled cron cycle. Role-gated route protection is enforced at the edge via middleware, and the entire platform is built with strict type safety end to end.`,
    stack: [
      "Next.js 16 (App Router, Turbopack)",
      "TypeScript",
      "Tailwind CSS v4",
      "Prisma ORM",
      "Neon Postgres",
      "Google Gemini (@google/genai)",
      "iron-session (scrypt)",
      "Resend",
      "Vitest",
      "Vercel",
    ],
  },
];

export type SkillCategory = { category: string; items: string[] };

export const skills: SkillCategory[] = [
  { category: "Languages", items: ["HTML", "CSS", "JavaScript", "TypeScript", "C++", "C#", "SQL"] },
  { category: "Styling & CSS Tooling", items: ["Tailwind CSS", "PostCSS", "Radix UI", "Panda CSS"] },
  { category: "Frontend Frameworks & Libraries", items: ["React", "Next.js", "Zustand", "Recharts", "TradingView Widget"] },
  { category: "Backend & Runtime", items: ["Node.js", "Prisma ORM", "REST APIs", "WebSockets", "Edge Middleware", "Turbopack"] },
  { category: "Databases", items: ["Neon Postgres", "Firebase / Cloud Firestore", "Redis"] },
  { category: "AI & Computation", items: ["LLM Integration & Tool-Calling", "Genetic Algorithms & Evolutionary Computation", "Numeric/Numerical Computing"] },
  { category: "Auth, Email & Testing", items: ["iron-session", "Resend", "Vitest"] },
  { category: "Hardware", items: ["Custom PC Builds", "Liquid-Cooling Loop Design & Installation", "Hardware Diagnostics & Repair"] },
  {
    category: "Tooling & Workflow",
    items: [
      "Git & GitHub",
      "npm Package Management",
      "Environment Variables & Secrets Management",
      "Vercel & Cloudflare Deployment Workflows",
      "Browser DevTools Debugging",
      "JSON & API Design",
      "Responsive/Mobile-First Design",
      "Cron Jobs & Scheduled Tasks",
    ],
  },
];

export type Achievement = {
  title: string;
  org?: string;
  location?: string;
  result: string;
  pending?: boolean;
  certificateImage?: string;
  verifyUrl?: string;
};

export type AchievementGroup = {
  group: string;
  entries: Achievement[];
};

export const achievements: AchievementGroup[] = [
  {
    group: "International Competitions & Olympiads",
    entries: [
      {
        title: "VILIPO — Vilnius International Project Olympiad 2026",
        location: "Vilnius, Lithuania",
        result:
          "1st Place, Gold Medal, and Best Project Award (#1 overall) — the highest individual distinction awarded among all international entries at one of Europe's premier student innovation olympiads",
      },
      {
        title: "Infomatrix Asia 2026",
        location: "Astana, Kazakhstan",
        result:
          "Silver Medal, International Project Competition — recognized with a full scholarship to Energo University (Almaty, Kazakhstan) in acknowledgment of outstanding achievement in science, technology, and innovation",
      },
      {
        title: "BOSEPO — 17th Bosnian Science Project Olympiad",
        location: "Sarajevo, Bosnia and Herzegovina",
        result: "Participant, Senior Category",
      },
      {
        title: "19th International Turkish Language Olympiad",
        org: "Ala-Too International University",
        location: "Kyrgyzstan",
        result:
          "Gold Medal, Beginner Level Turkish Language Competition, first place among competing international finalists",
      },
      {
        title: "Turkish Olympiads",
        org: "Yahya Kemal College",
        result: "1st Place",
      },
      {
        title: "Hoobit International Ideathon 2025",
        result: "Certificate of Participation",
      },
      {
        title: "Economics Olympiad",
        location: "Struga, North Macedonia 2025–2026",
        result: "Local Round, 23/25 (92%)",
      },
      {
        title: "ASEF Albania 2025–2026",
        result: "2nd Place, Silver Medal, regional international science competition",
        pending: true,
      },
      {
        title: "FirSTep PBL Competition — Local Round",
        location: "Struga, North Macedonia",
        result: "1st Place",
      },
      {
        title: "FirSTep PBL Competition — Local Round",
        location: "Struga, North Macedonia",
        result: "2nd Place",
      },
      {
        title: "FirSTep PBL Competition — International Round",
        location: "Romania",
        result: "2nd Place, Silver Medal, international round of the FirSTep Project-Based Learning Competition",
        pending: true,
      },
    ],
  },
  {
    group: "Chess",
    entries: [
      { title: "FIDE Arena FIDE Master (AFM)", result: "Official title, 2026" },
      { title: "FIDE Arena Candidate Master", result: "Official title, 2026" },
      { title: "FIDE Online Arena Rapid Championship", result: "1st Place, Rapid 10m" },
      { title: "FIDE Online Arena Rapid Championship", result: "2nd Place, Rapid 10m" },
      { title: "FOA Rapid 45+10 Championships", result: "3rd Place, Rapid 45m" },
    ],
  },
  {
    group: "Technical Certifications",
    entries: [
      { title: "AI Fluency: AI Capabilities & Limitations", org: "Anthropic", result: "Certification" },
      { title: "Hardware and Upgrade Support", org: "Cisco Networking Academy", result: "Certification" },
      { title: "User Experience Design Fundamentals", org: "IBM SkillsBuild", result: "Certification" },
      {
        title: "Skills for Success",
        org: "#YouthEmpowered (Education Center of Pivara Skopje / Motiva)",
        result: "Certification",
      },
    ],
  },
  {
    group: "HackerRank Certifications",
    entries: [
      { title: "Software Engineer", result: "Role certification" },
      { title: "Software Engineer Intern", result: "Role certification" },
      { title: "Frontend Developer, React", result: "Role certification" },
      { title: "Problem Solving — Intermediate", result: "Certification" },
      { title: "Problem Solving — Basic", result: "Certification" },
      { title: "JavaScript — Intermediate", result: "Certification" },
      { title: "JavaScript — Basic", result: "Certification" },
      { title: "Node.js — Intermediate", result: "Certification" },
      { title: "Node.js — Basic", result: "Certification" },
      { title: "Python — Basic", result: "Certification" },
      { title: "CSS — Basic", result: "Certification" },
      { title: "REST API — Intermediate", result: "Certification" },
    ],
  },
  {
    group: "Financial Literacy Certifications — VibeOnEdu (Sparkasse Bank)",
    entries: [
      {
        title:
          "A complete financial education curriculum covering personal, business, and institutional finance",
        org: "VibeOnEdu, in partnership with Sparkasse Bank",
        result: "Completed June 2026",
      },
      { title: "Fraud & Data Theft", result: "Module completed" },
      { title: "Digital Trends", result: "Module completed" },
      { title: "Starting a Business", result: "Module completed" },
      { title: "Legal Entity Registration", result: "Module completed" },
      { title: "Saving", result: "Module completed" },
      { title: "Cards", result: "Module completed" },
      { title: "Debt", result: "Module completed" },
      { title: "Security", result: "Module completed" },
      { title: "E-Banking", result: "Module completed" },
      { title: "Real Estate", result: "Module completed" },
      { title: "Personal Finance", result: "Module completed" },
      { title: "Insurance", result: "Module completed" },
      { title: "Leasing", result: "Module completed" },
      { title: "Finance", result: "Module completed" },
      { title: "Investing", result: "Module completed" },
      {
        title: "Badges",
        result:
          "Financial Pioneer, Conqueror of Challenges, Investor in the Future, Winning Mindset, Future CFO",
      },
    ],
  },
];

export const contact = {
  email: "jellyslogoman12345@gmail.com",
};
