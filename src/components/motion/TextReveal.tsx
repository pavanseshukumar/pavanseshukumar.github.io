"use client";

import { motion, type Variants } from "motion/react";
import type { ElementType } from "react";
import { cn, splitGraphemes } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

type TextRevealProps = {
  /** A string, or an array to force explicit line breaks. */
  text: string | readonly string[];
  as?: ElementType;
  by?: "word" | "char";
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** Animate on mount instead of on scroll — for above-the-fold type. */
  immediate?: boolean;
  /**
   * Accessible name, when joining the visual lines with spaces would produce
   * the wrong string — an email address broken across lines, for instance.
   */
  label?: string;
  /** A word (matched exactly, punctuation included) set in accent rather than ink. */
  accent?: string;
};

const unit: Variants = {
  hidden: { y: "108%" },
  visible: {
    y: "0%",
    transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Masked type reveal. Each unit rises through its own clipped box, so the
 * letters appear to be pushed up from behind the line rather than faded in.
 *
 * The split markup is hidden from assistive tech and the full string is
 * restored via aria-label.
 */
export function TextReveal({
  text,
  as = "span",
  by = "word",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.035,
  once = true,
  immediate = false,
  label,
  accent,
}: TextRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lines = typeof text === "string" ? [text] : text;
  const accessibleName = label ?? lines.join(" ");
  const Component = motion[as as keyof typeof motion] as typeof motion.span;

  if (reducedMotion) {
    const Static = as as ElementType;
    return (
      <Static className={className} aria-label={accessibleName}>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} aria-hidden className={cn("block", lineClassName)}>
            {line.split(" ").map((word, wordIndex) => (
              <span
                key={wordIndex}
                className={word === accent ? "text-accent" : undefined}
              >
                {wordIndex > 0 ? " " : ""}
                {word}
              </span>
            ))}
          </span>
        ))}
      </Static>
    );
  }

  const animation = immediate
    ? { animate: "visible" as const }
    : {
        whileInView: "visible" as const,
        viewport: { once, margin: "0px 0px -10% 0px" },
      };

  return (
    <Component
      className={className}
      aria-label={accessibleName}
      initial="hidden"
      {...animation}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={lineIndex}
          aria-hidden
          className={cn("block", lineClassName)}
        >
          {line.split(" ").map((word, wordIndex) => (
            <span
              key={wordIndex}
              className={cn(
                "inline-block whitespace-nowrap",
                word === accent && "text-accent",
              )}
            >
              {by === "char" ? (
                splitGraphemes(word).map((character, charIndex) => (
                  <Mask key={charIndex}>{character}</Mask>
                ))
              ) : (
                <Mask>{word}</Mask>
              )}
              {/* A real space, so wrapping and copy-paste behave normally. */}
              <span className="inline-block">&nbsp;</span>
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
}

function Mask({ children }: { children: React.ReactNode }) {
  return (
    // Padding + negative margin keeps descenders from being clipped by the mask.
    <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
      <motion.span className="inline-block" variants={unit}>
        {children}
      </motion.span>
    </span>
  );
}
