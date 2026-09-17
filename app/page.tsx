import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SkillsSection } from "@/components/sections/skills-section";

const SECTIONS = [
  { id: "achievements", label: "Achievements", phase: "19–23" },
  { id: "contact", label: "Contact", phase: "24" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
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
