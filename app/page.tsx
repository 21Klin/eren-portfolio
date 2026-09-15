const SECTIONS = [
  { id: "hero", label: "Hero", phase: "10–11" },
  { id: "about", label: "About", phase: "13" },
  { id: "projects", label: "Projects", phase: "14–16" },
  { id: "skills", label: "Skills", phase: "17–18" },
  { id: "achievements", label: "Achievements", phase: "19–23" },
  { id: "contact", label: "Contact", phase: "24" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {SECTIONS.map(({ id, label, phase }) => (
        <section
          key={id}
          id={id}
          className="flex min-h-screen scroll-mt-16 flex-col items-center justify-center gap-4 border-t border-accent/10 px-6 text-center first:border-t-0"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Section — Phase {phase}
          </p>
          <h2 className="font-mono text-2xl text-foreground sm:text-4xl">
            {label.toUpperCase()}
          </h2>
        </section>
      ))}
    </main>
  );
}
