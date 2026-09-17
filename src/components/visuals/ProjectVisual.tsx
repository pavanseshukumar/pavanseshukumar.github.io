import type { Project, ProjectVisual as VisualType } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

/**
 * A generated composition per project — never a screenshot, and never a mock
 * of one. Each visual is built only from things the project actually is: the
 * languages its editor supports, the surfaces it exposes, the shape of the
 * work. Nothing here implies a UI that does not exist.
 *
 * All geometry is fixed arithmetic, so the server and client markup are
 * byte-identical and hydration stays quiet. Motion is CSS, so it costs no
 * React renders and collapses under `prefers-reduced-motion`.
 */

const FRAME = "relative isolate overflow-hidden border border-line bg-void";

/** Shared chrome: a hairline plate label, set as instrument type. */
function Plate({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(FRAME, className)}>
      <p className="label absolute left-4 top-4 z-2 text-muted">{label}</p>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 01 — Assess Pro: two portals, an AI author, an editor, an analyst
 * ------------------------------------------------------------------ */

const EDITOR_LANGUAGES = ["Python", "SQL", "JavaScript", "Java"] as const;

function AssessVisual({ phase = 0 }: { phase?: number }) {
  return (
    <div
      className={cn(FRAME, "grid h-full w-full grid-cols-2 grid-rows-[auto_1fr_auto]")}
      data-phase={phase}
    >
      {/* Portal split — the product's actual top-level division. */}
      <p className="label border-b border-r border-line px-4 py-3 text-muted">
        <span className="text-accent">◍</span> Learner
      </p>
      <p className="label border-b border-line px-4 py-3 text-muted">
        <span className="text-accent">◍</span> Admin
      </p>

      {/* Left: the code question surface. */}
      <div className="border-r border-line p-4">
        <ul className="flex flex-col gap-1.5">
          {EDITOR_LANGUAGES.map((language, index) => (
            <li
              key={language}
              className="label flex items-center gap-2 text-ink/70"
              style={{ opacity: 1 - index * 0.14 }}
            >
              <span aria-hidden className="text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              {language}
            </li>
          ))}
        </ul>

        {/* A caret on a blank line: an editor waiting, not a fake file. */}
        <p className="label mt-3 flex items-center gap-1 text-muted">
          <span aria-hidden>&gt;</span>
          <span aria-hidden className="assess-caret" />
        </p>

        <p className="label mt-6 text-muted">Question types</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {["MCQ", "Coding", "Descriptive"].map((kind) => (
            <li key={kind} className="label flex items-center gap-2 text-ink/60">
              <span aria-hidden className="h-px w-4 bg-line" />
              {kind}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: the AI authoring surface. */}
      <div className="flex flex-col justify-between p-4">
        <div>
          <p className="label text-muted">Question paper</p>
          <p className="label mt-2 text-accent">
            Generating
            <span aria-hidden className="assess-dots" />
          </p>
        </div>

        {/* Agent simulation, across the skill levels the product defines. */}
        <div className="mt-4">
          <p className="label text-muted">Agent</p>
          <div className="mt-2 flex items-center gap-1.5">
            {["Beginner", "Intermediate", "Advanced", "Expert"].map(
              (level, index) => (
                <span
                  key={level}
                  title={level}
                  className="assess-rung h-1 flex-1 bg-line"
                  style={{ animationDelay: `${index * 0.45}s` }}
                />
              ),
            )}
          </div>
          <p className="label mt-2 text-muted">Beginner → Expert</p>
        </div>
      </div>

      {/* Analytics: a scored distribution, unlabelled — shape, not figures. */}
      <div className="col-span-2 border-t border-line p-4">
        <p className="label text-muted">Performance</p>
        <div className="mt-3 flex h-12 items-end gap-1">
          {[34, 52, 41, 68, 57, 79, 63, 88, 72, 94, 81, 61].map((value, index) => (
            <span
              key={index}
              className="assess-bar flex-1 bg-line"
              style={
                {
                  height: `${value}%`,
                  animationDelay: `${index * 0.08}s`,
                } as React.CSSProperties
              }
              data-peak={value > 85 ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 02 — AMC Ladder: progress, climbing
 * ------------------------------------------------------------------ */

function AnalyticsVisual() {
  /*
   * A ladder: eight evenly spaced rungs, and a trace that climbs them. The
   * dots sit *on* the rungs, so the two are one drawing rather than two
   * overlaid scales. The viewBox is wide so the plate fills without a
   * non-uniform scale turning the nodes into ellipses.
   */
  const rungs = 8;
  const y = (step: number) => 88 - step * 10;
  const x = (step: number) => 16 + step * 18;

  return (
    <Plate label="Progress" className="h-full w-full">
      <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
        {Array.from({ length: rungs }, (_, step) => (
          <line
            key={step}
            x1={10}
            x2={150}
            y1={y(step)}
            y2={y(step)}
            stroke="currentColor"
            className="text-line"
            strokeWidth={0.4}
          />
        ))}

        <polyline
          points={Array.from({ length: rungs }, (_, step) =>
            `${x(step)},${y(step)}`,
          ).join(" ")}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={0.9}
          className="ladder-trace"
          pathLength={100}
        />

        {Array.from({ length: rungs }, (_, step) => {
          const last = step === rungs - 1;
          return (
            <circle
              key={`n${step}`}
              cx={x(step)}
              cy={y(step)}
              r={last ? 2.2 : 1.1}
              fill={last ? "var(--color-accent)" : "currentColor"}
              className={last ? "" : "text-muted"}
            />
          );
        })}
      </svg>
    </Plate>
  );
}

/* ------------------------------------------------------------------ *
 * 03 / 05 — the two mobile products, on different rhythms
 * ------------------------------------------------------------------ */

function DeviceVisual({
  label,
  rows,
  pulse,
}: {
  label: string;
  rows: readonly string[];
  pulse?: boolean;
}) {
  return (
    <Plate label={label} className="h-full w-full">
      <div className="flex h-full items-center justify-center p-6 pt-12">
        {/*
          A device outline at a real phone proportion, sized to the plate so
          it fills rather than floats. Deliberately empty of invented
          interface: the rows name surfaces, not screens.
        */}
        <div className="relative aspect-9/19 h-full w-auto shrink-0 rounded-[1.4rem] border border-line">
          <span
            aria-hidden
            className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line"
          />
          <ul className="flex flex-col gap-2 px-3.5 pt-8">
            {rows.map((row, index) => (
              <li
                key={row}
                className="label border-b border-line-soft pb-2 text-ink/60"
                style={{ opacity: 1 - index * 0.16 }}
              >
                {row}
              </li>
            ))}
          </ul>
          {pulse ? (
            <span
              aria-hidden
              className="care-pulse absolute bottom-5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent"
            />
          ) : (
            <span
              aria-hidden
              className="mobile-sweep absolute inset-x-3 bottom-6 h-px bg-accent"
            />
          )}
        </div>
      </div>
      <p className="label absolute bottom-4 left-4 text-muted">Cross-platform</p>
    </Plate>
  );
}

/* ------------------------------------------------------------------ *
 * 04 — CredR: a storefront over an operations layer
 * ------------------------------------------------------------------ */

function MarketplaceVisual() {
  return (
    <div className={cn(FRAME, "grid h-full w-full grid-rows-2")}>
      {/* Each band clips its own content: the tile grid is sized by its
          column count and would otherwise spill into the operations rows. */}
      <div className="relative min-h-0 overflow-hidden border-b border-line p-4">
        <p className="label text-muted">Marketplace</p>
        <div className="mt-4 grid grid-cols-8 gap-1.5">
          {Array.from({ length: 16 }, (_, index) => (
            <span
              key={index}
              className="market-tile aspect-square border border-line"
              data-live={index % 7 === 3 ? "true" : undefined}
              style={{ animationDelay: `${index * 0.11}s` }}
            />
          ))}
        </div>
      </div>
      <div className="relative min-h-0 overflow-hidden p-4">
        <p className="label text-muted">Dealer operations</p>
        <ul className="mt-4 flex flex-col gap-2">
          {["Intake", "Pricing", "Listing", "Handover"].map((step, index) => (
            <li key={step} className="label flex items-center gap-3 text-ink/60">
              <span className="w-20 shrink-0">{step}</span>
              <span
                aria-hidden
                className="market-step h-px flex-1 bg-line"
                style={{ animationDelay: `${index * 0.5}s` }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 06 — JS Fitness Coach: a schedule, one slot taken
 * ------------------------------------------------------------------ */

function BookingVisual() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
  const times = ["9:00", "11:00", "14:00", "16:00"] as const;
  const bookedDay = 2;
  const bookedTime = 1;

  return (
    <div
      className={cn(FRAME, "grid h-full w-full grid-rows-[auto_1fr_auto]")}
    >
      <p className="label border-b border-line px-4 py-3 text-muted">
        <span className="text-accent">◍</span> Trainer availability
      </p>

      <div className="grid grid-cols-5 gap-1.5 p-4 text-center">
        {days.map((day, dayIndex) => (
          <div key={day} className="flex flex-col gap-1.5">
            <p className="label text-muted">{day}</p>
            {times.map((time, timeIndex) => {
              const isBooked = dayIndex === bookedDay && timeIndex === bookedTime;
              return (
                <span
                  key={time}
                  className={cn(
                    "label border py-1.5",
                    isBooked
                      ? "border-accent text-accent"
                      : "border-line text-ink/40",
                  )}
                >
                  {time}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <p className="label text-ink/70">
          Booking confirmed <span className="text-muted">— email sent</span>
        </p>
        <span
          aria-hidden
          className="care-pulse h-2 w-2 rounded-full bg-accent"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ProjectVisual({
  project,
  phase,
  className,
}: {
  project: Project;
  /** Flagship only: which workflow phase the scroll is currently in. */
  phase?: number;
  className?: string;
}) {
  const visual = ((): React.ReactNode => {
    const type: VisualType = project.visualType;
    switch (type) {
      case "assess":
        return <AssessVisual phase={phase} />;
      case "analytics":
        return <AnalyticsVisual />;
      case "mobile":
        return (
          <DeviceVisual
            label="Wellness"
            rows={["Authentication", "Programs", "Tracking", "Profile"]}
          />
        );
      case "care":
        return (
          <DeviceVisual
            label="Care"
            rows={["Find a clinic", "Book", "Records", "Family"]}
            pulse
          />
        );
      case "marketplace":
        return <MarketplaceVisual />;
      case "booking":
        return <BookingVisual />;
    }
  })();

  return (
    <div
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${project.title} — ${project.subtitle}. Generated diagram, not a screenshot.`}
    >
      {visual}
    </div>
  );
}
