export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">
        Phase 1 — Scaffolding
      </p>
      <h1 className="font-mono text-3xl text-foreground sm:text-5xl">
        EREN.SYS <span className="text-accent">ONLINE</span>
      </h1>
      <p className="max-w-md font-sans text-sm text-muted">
        Dark theme, accent color, and fonts are wired up. Next: the boot
        sequence overlay.
      </p>
    </main>
  );
}
