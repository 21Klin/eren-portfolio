"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { hero, projects, contact } from "@/lib/data/site-content";

type LogEntry = { type: "input" | "output"; text: string };

const WELCOME_TEXT = "EREN.SYS TERMINAL — type 'help' to begin.";

const HELP_TEXT = [
  "AVAILABLE COMMANDS:",
  "  whoami     — identify the operator of this system",
  "  projects   — list deployed systems",
  "  contact    — open a transmission channel",
  "  help       — show this list",
].join("\n");

function runCommand(raw: string): string {
  const cmd = raw.trim().toLowerCase();

  switch (cmd) {
    case "":
      return "";
    case "whoami":
      return `IDENTITY: ${hero.name}\nROLE: ${hero.title}\nSTATUS: Online`;
    case "projects":
      return projects
        .map(
          (project, i) =>
            `[0${i + 1}] ${project.name}\n     ${project.tagline}\n     ${project.liveUrl}`,
        )
        .join("\n\n");
    case "contact":
      return `EMAIL: ${contact.email}`;
    case "help":
      return HELP_TEXT;
    // Hidden — not listed in `help`. Numbers pulled from the Egy AI writeup in
    // site-content.ts (24-genome population, top-4 elitism); closing line is a
    // verbatim quote from the About copy.
    case "evolve":
      return [
        "INITIATING GENETIC ALGORITHM SIMULATION...",
        "POPULATION: 24 genomes — SELECTION: tournament + elitism (top 4 survive)",
        "GEN 1... GEN 4... GEN 9 — convergence reached.",
        "The market selects the trader, not the other way around.",
      ].join("\n");
    default:
      return `COMMAND NOT FOUND: ${cmd}\nType 'help' for a list of commands.`;
  }
}

export function TerminalWidget() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [log, setLog] = useState<LogEntry[]>([
    { type: "output", text: WELCOME_TEXT },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const command = value.trim();
    if (!command) return;

    const output = runCommand(command);
    setLog((prev) =>
      [
        ...prev,
        { type: "input" as const, text: command },
        ...(output ? [{ type: "output" as const, text: output }] : []),
      ].slice(-200),
    );
    setValue("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-mono text-xs">
      {open && (
        <div className="mb-2 flex h-80 w-72 flex-col border border-accent/30 bg-black/90 backdrop-blur-sm sm:w-80">
          <div className="flex items-center justify-between border-b border-accent/20 px-3 py-2 text-[0.65rem] uppercase tracking-widest text-muted">
            <span className="text-accent">EREN.SYS — TERMINAL</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close terminal"
              className="text-muted transition-colors hover:text-accent"
            >
              ✕
            </button>
          </div>

          <div
            ref={logRef}
            className="flex-1 space-y-2 overflow-y-auto px-3 py-2"
          >
            {log.map((entry, i) => (
              <p
                key={i}
                className={`whitespace-pre-wrap break-words ${
                  entry.type === "input" ? "text-foreground" : "text-accent"
                }`}
              >
                {entry.type === "input" ? `> ${entry.text}` : entry.text}
              </p>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-accent/20 px-3 py-2"
          >
            <span className="text-muted">&gt;</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
              autoComplete="off"
              spellCheck={false}
              aria-label="Terminal command input"
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted/50"
              placeholder="type a command..."
            />
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 border border-accent/30 bg-background px-3 py-2 uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <span className="text-accent">{open ? "×" : ">_"}</span>
        {open ? "close" : "terminal"}
      </button>
    </div>
  );
}
