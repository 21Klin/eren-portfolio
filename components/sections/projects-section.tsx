import { projects } from "@/lib/data/site-content";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="flex min-h-screen scroll-mt-16 flex-col items-center gap-12 border-t border-accent/10 px-6 py-24"
    >
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent">
        [ PROJECTS ]
      </p>

      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <a
            key={project.slug}
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col gap-4 border border-accent/20 bg-surface/60 p-6 transition-colors hover:border-accent/60"
          >
            <div className="space-y-1">
              <h3 className="font-mono text-lg text-foreground group-hover:text-accent">
                {project.name}
              </h3>
              <p className="text-sm text-muted">{project.tagline}</p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="border border-accent/20 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-accent/80"
                >
                  {tech}
                </li>
              ))}
            </ul>

            <span className="mt-auto font-mono text-xs uppercase tracking-widest text-accent">
              View live &gt;&gt;
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
