"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { projects, type Project } from "@/lib/data/site-content";

const TILT_DEGREES = 10;

export function ProjectsSection() {
  const [expanded, setExpanded] = useState<Project | null>(null);

  return (
    <section
      id="projects"
      className="flex min-h-screen scroll-mt-16 flex-col items-center gap-12 border-t border-accent/10 px-6 py-24"
    >
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent">
        [ PROJECTS ]
      </p>

      <div
        className="grid w-full max-w-5xl gap-6 md:grid-cols-3"
        style={{ perspective: 1200 }}
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onExpand={() => setExpanded(project)}
          />
        ))}
      </div>

      {expanded && (
        <ProjectDetailModal
          project={expanded}
          onClose={() => setExpanded(null)}
        />
      )}
    </section>
  );
}

function ProjectCard({
  project,
  onExpand,
}: {
  project: Project;
  onExpand: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, { stiffness: 250, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 250, damping: 20 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * TILT_DEGREES * 2);
    rotateX.set(py * -TILT_DEGREES * 2);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Cards sharpen as they cross the viewport center and blur toward the edges.
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center", "end start"],
  });
  const blurPx = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, 6]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, filter }}
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

      <div className="mt-auto flex items-center justify-between gap-4">
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs uppercase tracking-widest text-accent hover:underline"
        >
          View live &gt;&gt;
        </a>
        <button
          type="button"
          onClick={onExpand}
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
        >
          Full brief &gt;&gt;
        </button>
      </div>
    </motion.div>
  );
}

function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const paragraphs = project.description.split("\n\n");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-accent/30 bg-surface p-6 sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent">
              [ PROJECT BRIEF ]
            </p>
            <h3 className="mt-2 font-mono text-xl text-foreground">
              {project.name}
            </h3>
            {project.license && (
              <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
                {project.license}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            Close [X]
          </button>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <ul className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="border border-accent/20 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-accent/80"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-4">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-accent hover:underline"
          >
            View live &gt;&gt;
          </a>
          {project.extraLinks?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-accent hover:underline"
            >
              {link.label} &gt;&gt;
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
