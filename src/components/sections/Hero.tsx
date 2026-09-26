"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hero, site } from "@/lib/data/site";
import { scrollToTarget } from "@/lib/scroll";
import { HERO_START_SECONDS } from "@/lib/constants";
import { useGSAP } from "@/lib/hooks/useGSAP";
import { useLocalTime } from "@/lib/hooks/useLocalTime";
import { usePointerBus } from "@/lib/hooks/usePointerBus";
import {
  useIsCoarsePointer,
  usePrefersReducedMotion,
} from "@/lib/hooks/useMediaQuery";
import { LanyardBadge } from "@/components/visuals/LanyardBadge";

gsap.registerPlugin(ScrollTrigger);

/** Parallax depth, read by `.pointer-depth` through calc(). */
const depth = (px: number) => ({ "--depth": `${px}px` }) as CSSProperties;

const EASE = [0.16, 1, 0.3, 1] as const;

/** Entrance beats, in seconds after the veil lifts. */
const BEAT = {
  backdrop: 0,
  meta: 0.15,
  wordmark: 0.3,
  cue: 1.1,
} as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);

  const time = useLocalTime(site.location.timeZone);
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useIsCoarsePointer();

  const start = reducedMotion ? 0 : HERO_START_SECONDS;

  /**
   * Rects for the lit wordmark lines. Measured out of band and read by the
   * pointer bus each frame, so the loop never touches layout.
   */
  const litRef = useRef<{ lines: HTMLElement[]; rects: DOMRect[] }>({
    lines: [],
    rects: [],
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion) return;

    const lines = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-lit-line]"),
    );
    litRef.current.lines = lines;

    let queued = false;
    const measure = () => {
      litRef.current.rects = lines.map((line) => line.getBoundingClientRect());
      queued = false;
    };
    const queueMeasure = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    measure();
    // Re-measure once the entrance has settled; the lines move until then.
    const settle = window.setTimeout(measure, (start + 1.4) * 1000);
    window.addEventListener("resize", queueMeasure);
    window.addEventListener("scroll", queueMeasure, { passive: true });

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", queueMeasure);
      window.removeEventListener("scroll", queueMeasure);
    };
  }, [reducedMotion, start]);

  /**
   * One gated loop publishes the pointer to the whole stage and moves the
   * light inside the letterforms. Nothing here touches React state, so moving
   * the mouse renders no components.
   */
  usePointerBus(stageRef, {
    enabled: !reducedMotion,
    autoDrift: coarse,
    onFrame: (x, y) => {
      const { lines, rects } = litRef.current;
      for (let i = 0; i < lines.length; i += 1) {
        const rect = rects[i];
        if (!rect) continue;
        lines[i].style.setProperty("--lx", `${x - rect.left}px`);
        lines[i].style.setProperty("--ly", `${y - rect.top}px`);
      }
    },
  });

  /**
   * The scroll transformation. The wordmark halves separate and scale while
   * the grid dollies in behind them, so the hero is travelled through rather
   * than scrolled past — and the next section's title arrives in the gap the
   * name leaves behind.
   */
  useGSAP(
    () => {
      const media = gsap.matchMedia();

      /*
       * Every tween carries an explicit duration. GSAP's default is 0.5, so
       * leaving it off makes the timeline's total length the sum of whatever
       * the longest branch happens to be — and every authored position then
       * maps to a different scroll fraction than it reads as. Pinning the
       * total to 1 keeps positions readable as "fraction of the transition".
       */
      media.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "none" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=110%",
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              /*
               * Three sections pin on this page. ScrollTrigger has to measure
               * them in document order or a later pin computes its start
               * against a stale document height and activates early. They are
               * not created in that order — the career log builds its pin
               * after a hydration pass — so the order is declared here
               * instead: highest priority refreshes first.
               */
              refreshPriority: 3,
            },
          });

          timeline
            .to(backdropRef.current, { scale: 1.45, opacity: 0.3 }, 0)
            .to(
              leadRef.current,
              { xPercent: -34, yPercent: -8, scale: 1.2, opacity: 0.16 },
              0,
            )
            .to(
              trailRef.current,
              { xPercent: 26, yPercent: 8, scale: 1.2, opacity: 0.16 },
              0,
            )
            .to("[data-hero-meta]", { opacity: 0, y: -24, duration: 0.35 }, 0)
            .to(cueRef.current, { opacity: 0, y: 24, duration: 0.25 }, 0)
            .fromTo(
              outroRef.current,
              { opacity: 0, scale: 0.94, y: 34 },
              { opacity: 1, scale: 1, y: 0, duration: 0.35 },
              0.45,
            );
        },
      );

      media.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          // No pin on phones: a pinned 100svh section fights the browser
          // chrome collapsing on first scroll, which reads as a jump.
          //
          // Because nothing is held in place, the hand-off has to finish
          // early — the section keeps travelling, and a late fade peaks only
          // after the title has already left the top of the screen.
          const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "none" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });

          timeline
            .to(backdropRef.current, { scale: 1.18, opacity: 0.4 }, 0)
            .to(leadRef.current, { xPercent: -9, scale: 1.05 }, 0)
            .to(trailRef.current, { xPercent: 7, scale: 1.05 }, 0)
            .to("[data-hero-meta]", { opacity: 0, duration: 0.4 }, 0)
            .to(cueRef.current, { opacity: 0, duration: 0.3 }, 0)
            .to(
              [leadRef.current, trailRef.current],
              { opacity: 0.18, duration: 0.2 },
              0.15,
            )
            .fromTo(
              outroRef.current,
              { opacity: 0, y: 26 },
              { opacity: 1, y: 0, duration: 0.25 },
              0.18,
            );
        },
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  const enter = (delay: number, y = 18) =>
    reducedMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay: start + delay, ease: EASE },
        };

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      className="relative isolate min-h-svh overflow-clip"
    >
      <div ref={stageRef} className="pointer-stage relative flex min-h-svh flex-col">
        {/* ---------- Background ---------- */}
        <motion.div
          ref={backdropRef}
          aria-hidden
          className="absolute inset-0 -z-10"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: start + BEAT.backdrop }}
        >
          <div className="pointer-depth absolute inset-0" style={depth(7)}>
            {/* Inset past the edges so the parallax never exposes a seam. */}
            <div className="tech-grid hero-grid absolute inset-[-5%]" />
          </div>

          <div className="hero-halo absolute left-1/2 top-1/2 h-[72vmax] w-[72vmax] -translate-x-1/2 -translate-y-1/2" />

          {/* Registration marks — technical detail, not decoration. */}
          <div
            className="pointer-depth absolute inset-0 hidden md:block"
            style={depth(11)}
          >
            {[
              "left-10 top-28",
              "right-10 top-28",
              "left-10 bottom-24",
              "right-10 bottom-24",
            ].map((position) => (
              <span
                key={position}
                className={`absolute ${position} block h-3 w-3 text-line`}
              >
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
              </span>
            ))}
            <span className="label absolute left-10 top-1/2 origin-left -translate-y-1/2 rotate-90 text-line">
              {site.location.coordinates}
            </span>
          </div>
        </motion.div>

        {/* ---------- Hanging ID badge (desktop, pointer-driven) ---------- */}
        <LanyardBadge />

        {/* ---------- Composition ---------- */}
        <div className="gutter relative flex min-h-svh flex-1 flex-col justify-between pb-6 pt-20 md:pb-8 md:pt-28">
          {/* Top rail */}
          <div data-hero-meta className="pointer-depth" style={depth(13)}>
            <motion.div
              className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-line pt-3"
              {...enter(BEAT.meta)}
            >
              <p className="label text-ink">{hero.discipline}</p>
              <p className="label text-muted">{hero.experience}</p>
            </motion.div>
          </div>

          {/* Wordmark */}
          <h1
            aria-label={site.name}
            className="hero-name pointer-depth relative my-auto font-display font-extrabold uppercase leading-[0.8] tracking-[-0.045em]"
            style={depth(4)}
          >
            <span ref={leadRef} className="block will-change-transform">
              {hero.wordmark.lead.map((line, index) => (
                <span key={line} aria-hidden className="reveal-clip">
                  <motion.span
                    data-lit-line
                    className="lit-text block whitespace-nowrap"
                    initial={reducedMotion ? false : { y: "112%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 1.25,
                      delay: start + BEAT.wordmark + index * 0.1,
                      ease: EASE,
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </span>

            <span ref={trailRef} className="block will-change-transform">
              {hero.wordmark.trail.map((line, index) => (
                <span
                  key={line}
                  aria-hidden
                  className={`reveal-clip ${
                    index === 0
                      ? "md:ml-[6vw] lg:ml-[10vw] xl:ml-[15vw]"
                      : "md:ml-[12vw] lg:ml-[20vw] xl:ml-[30vw]"
                  }`}
                >
                  <motion.span
                    data-lit-line
                    className="lit-text block whitespace-nowrap"
                    initial={reducedMotion ? false : { y: "112%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 1.25,
                      delay:
                        start +
                        BEAT.wordmark +
                        (hero.wordmark.lead.length + index) * 0.1,
                      ease: EASE,
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          {/* Stack line — sits under the wordmark, marked by the accent. */}
          <div data-hero-meta className="pointer-depth" style={depth(13)}>
            <motion.p
              className="label flex items-center gap-3 text-muted"
              {...enter(BEAT.meta + 0.75)}
            >
              <span aria-hidden className="h-2 w-2 shrink-0 bg-accent" />
              {hero.stack}
            </motion.p>
          </div>

          {/* Bottom rail */}
          <div
            data-hero-meta
            className="pointer-depth mt-8 md:mt-10"
            style={depth(13)}
          >
            <motion.div
              className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-line pt-3"
              {...enter(BEAT.meta + 0.85)}
            >
              <p className="label text-muted">{hero.based}</p>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <p className="label text-accent">{site.availability}</p>
                <p className="label text-muted">
                  <span className="tabular-nums text-ink">
                    {time ?? "--:--:--"}
                  </span>
                  <span className="pl-2">IST</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Scroll cue */}
          <div ref={cueRef} className="mt-6 flex md:mt-8">
            <motion.button
              type="button"
              onClick={() => scrollToTarget("#about")}
              data-cursor="view"
              data-cursor-label="Scroll"
              aria-label="Scroll to the next section"
              className="group flex cursor-pointer items-center gap-4 py-2 text-left"
              {...enter(BEAT.cue, 12)}
            >
              <span className="label text-muted transition-colors duration-300 group-hover:text-accent">
                Scroll
              </span>
              {/* A segment falling down its own rule. */}
              <span
                aria-hidden
                className="relative block h-10 w-px overflow-hidden bg-line"
              >
                <span
                  className="absolute inset-x-0 top-0 block h-1/2 bg-accent"
                  style={{ animation: "hero-cue 2.1s ease-in-out infinite" }}
                />
              </span>
              <ArrowDown
                className="h-3.5 w-3.5 text-muted transition-colors duration-300 group-hover:text-accent"
                strokeWidth={1.5}
              />
            </motion.button>
          </div>
        </div>

        {/* ---------- Hand-off to the next section ---------- */}
        <div
          ref={outroRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-5 pb-24 opacity-0 md:justify-center md:pb-0"
        >
          <p className="label text-accent">
            {hero.outro.kicker}
            <span className="px-2 text-line">/</span>
            <span className="text-muted">01</span>
          </p>
          <p className="font-display text-display font-extrabold uppercase tracking-tight text-ink">
            {hero.outro.title}
          </p>
          <span className="block h-px w-24 bg-accent" />
        </div>
      </div>
    </section>
  );
}
