"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TextReveal } from "./TextReveal";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

type SectionHeadingProps = {
  index: string;
  label: string;
  title: string | readonly string[];
  note?: ReactNode;
  className?: string;
  titleClassName?: string;
  /** A word in `title` (matched exactly) set in accent rather than ink. */
  accent?: string;
  /** Rendering level — the page has exactly one h1, in the hero. */
  as?: "h2" | "h3";
};

/**
 * The recurring section masthead: a rule that draws itself, a mono index
 * line, then the title. Consistent here means the whole page feels indexed.
 */
export function SectionHeading({
  index,
  label,
  title,
  note,
  className,
  titleClassName,
  accent,
  as: Heading = "h2",
}: SectionHeadingProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        className="h-px w-full origin-left bg-line"
        initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-4">
        <p className="label text-muted">
          <span className="text-accent">{index}</span>
          <span className="px-2 text-line">/</span>
          {label}
        </p>
        {note ? (
          <p className="label max-w-[34ch] text-muted normal-case tracking-normal">
            {note}
          </p>
        ) : null}
      </div>

      <TextReveal
        as={Heading}
        text={title}
        by="word"
        stagger={0.045}
        accent={accent}
        className={cn(
          "mt-6 font-display text-headline font-extrabold text-ink",
          titleClassName,
        )}
      />
    </div>
  );
}
