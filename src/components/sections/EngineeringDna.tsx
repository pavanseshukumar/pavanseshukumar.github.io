"use client";

import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dimensions, dna, technologyCount } from "@/lib/data/dna";
import type { DimensionId } from "@/lib/data/dna";
import { useGSAP } from "@/lib/hooks/useGSAP";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { SectionHeading } from "@/components/motion/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

const KEYS = [
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
  "ArrowUp",
  "Home",
  "End",
] as const;

/**
 * How Pavan builds, run as a shell session rather than shown as a diagram.
 *
 * One terminal window, one `select`-style menu of five stages, and the
 * output — that stage's own tools — printed back into the same box. Picking
 * a stage is issuing a command; the box does the rest.
 */
export function EngineeringDna() {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [activeId, setActiveId] = useState<DimensionId>(dimensions[0].id);
  const reducedMotion = usePrefersReducedMotion();

  const activeIndex = dimensions.findIndex((item) => item.id === activeId);
  const active = dimensions[activeIndex] ?? dimensions[0];

  /** Roving focus across the menu, with selection following focus. */
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (!KEYS.includes(event.key as (typeof KEYS)[number])) return;
    event.preventDefault();

    setActiveId((current) => {
      const index = dimensions.findIndex((item) => item.id === current);
      let next = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = (index + 1) % dimensions.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = (index - 1 + dimensions.length) % dimensions.length;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = dimensions.length - 1;
      }

      tabRefs.current[next]?.focus();
      return dimensions[next].id;
    });
  }, []);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        // The session boots in as the window is scrolled to, line by line —
        // the section should already feel live on arrival, not wait on it.
        gsap.from("[data-terminal-line]", {
          opacity: 0,
          y: 8,
          duration: 0.5,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: { trigger: terminalRef.current, start: "top 78%" },
        });

        // The window recedes as the section leaves, handing over to the
        // career log rather than cutting to it.
        gsap
          .timeline({
            defaults: { duration: 1, ease: "none" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "bottom 72%",
              end: "bottom 18%",
              scrub: 0.6,
            },
          })
          .to(terminalRef.current, { opacity: 0.16 }, 0)
          .fromTo(
            outroRef.current,
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.5 },
            0.3,
          );
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="dna"
      className="gutter relative scroll-mt-24 overflow-hidden border-t border-line bg-surface py-24 md:py-32"
    >
      <p
        aria-hidden
        className="pointer-events-none absolute -right-[4vw] top-10 select-none font-display text-[32vw] font-extrabold uppercase leading-none tracking-tighter text-ink/[0.035] lg:top-4"
      >
        {dna.centre}
      </p>

      <SectionHeading
        index="02"
        label="Engineering DNA"
        title={["How I", "build"]}
        note={`${dimensions.length} stages, ${technologyCount} tools — run one and see what's underneath it.`}
      />

      <div className="relative mt-16 lg:mt-20">
        <div ref={terminalRef} className="terminal-card">
          <div className="terminal-head">
            <span className="label text-muted">
              <span aria-hidden className="terminal-status" />
              pavan@build — zsh
            </span>
            <span className="label text-muted">{technologyCount} tools</span>
          </div>

          <div className="terminal-body">
            <p data-terminal-line className="terminal-line">
              <span className="text-accent">$</span> ./how-i-build.sh
            </p>
            <p data-terminal-line className="terminal-comment">
              Select a stage to inspect:
            </p>

            <div
              role="tablist"
              aria-label="Engineering dimensions"
              className="terminal-options"
              onKeyDown={onKeyDown}
            >
              {dimensions.map((dimension, index) => {
                const isActive = dimension.id === activeId;

                return (
                  <button
                    key={dimension.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`dna-tab-${dimension.id}`}
                    aria-selected={isActive}
                    aria-controls={`dna-panel-${dimension.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveId(dimension.id)}
                    data-cursor="link"
                    data-active={isActive}
                    data-terminal-line
                    className="terminal-option"
                  >
                    <span>{index + 1})</span>
                    <span>{dimension.label}</span>
                  </button>
                );
              })}
            </div>

            <p data-terminal-line className="terminal-prompt">
              <span className="text-accent">#?</span>
              {activeIndex + 1}
              <span aria-hidden className="terminal-caret" />
            </p>

            <div
              role="tabpanel"
              id={`dna-panel-${active.id}`}
              aria-labelledby={`dna-tab-${active.id}`}
              tabIndex={0}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="terminal-line">
                    <span className="text-accent">➜</span>
                    <span className="terminal-output-label text-lg">
                      {active.label}
                    </span>
                  </p>
                  <p className="terminal-comment">{active.summary}</p>

                  <ul className="terminal-log">
                    {active.technologies.map((technology, index) => (
                      <motion.li
                        key={technology}
                        className="terminal-log-line"
                        initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: reducedMotion ? 0 : 0.08 + index * 0.045,
                        }}
                      >
                        <span aria-hidden className="text-accent">
                          →
                        </span>
                        {technology}
                      </motion.li>
                    ))}
                  </ul>

                  <p className="terminal-line mt-4">
                    <span className="text-accent">$</span>
                    <span aria-hidden className="terminal-caret" />
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Hand-off to the career log ---------- */}
      <div ref={outroRef} className="mt-20 border-t border-line pt-4">
        <p className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <span className="text-accent">{dna.outro.kicker}</span>
          <span className="text-line">/</span>
          <span>{dna.outro.index}</span>
          <span className="text-ink">{dna.outro.title}</span>
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
        </p>
      </div>
    </section>
  );
}
