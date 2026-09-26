"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { sections, site } from "@/lib/data/site";
import { socials } from "@/lib/data/socials";
import { scrollToTarget } from "@/lib/scroll";
import { lockPageScroll, unlockPageScroll } from "@/lib/scrollLock";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { FlowingRow } from "@/components/motion/FlowingRow";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Two elements only: a monogram and one trigger. Everything else lives in a
 * full-bleed index panel — a conventional link bar would have been the first
 * thing to make this page look like every other portfolio.
 *
 * The panel is a modal dialog, so it owns focus while open: focus moves in on
 * open, Tab cycles inside it, and focus returns to the trigger on close.
 */
export function Navigation() {
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const activeSection = useActiveSection();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Set when closing via a nav item, so focus follows the page, not the trigger. */
  const navigatingRef = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    lockPageScroll();

    const panel = panelRef.current;
    const focusables = () =>
      panel
        ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (element) => element.getClientRects().length > 0,
          )
        : [];

    focusables()[0]?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      // aria-modal promises the rest of the page is unreachable; honour it.
      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const inside = panel?.contains(current) ?? false;

      if (event.shiftKey && (current === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockPageScroll();

      if (navigatingRef.current) {
        navigatingRef.current = false;
      } else {
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
  }, [open, close]);

  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Let Cmd/Ctrl/middle clicks open the anchor normally.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    navigatingRef.current = true;
    close();

    // Let the panel begin clearing before the scroll starts.
    window.setTimeout(() => scrollToTarget(`#${id}`), reducedMotion ? 0 : 420);
  };

  /**
   * The panel is full-bleed, so "outside" means the empty ground around the
   * content rather than anywhere off-panel. Handled on the panel itself
   * instead of a document listener, which would otherwise also catch the
   * click that opened it.
   */
  const onGroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-menu-content]")) return;
    close();
  };

  const panelTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const };

  return (
    <>
      <header className="gutter pointer-events-none fixed inset-x-0 top-0 z-[75] flex items-center justify-between py-5 md:py-7">
        <a
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            scrollToTarget(0);
          }}
          className="label pointer-events-auto flex cursor-pointer items-center gap-2 text-ink mix-blend-difference"
          data-cursor="link"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-accent"
            title={site.availability}
          />
          {site.monogram}
        </a>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="index-panel"
          aria-haspopup="dialog"
          className="label pointer-events-auto flex cursor-pointer items-center gap-3 text-ink mix-blend-difference"
          data-cursor="link"
          data-cursor-label={open ? "Close" : "Open"}
        >
          <span className="relative flex h-3 w-6 flex-col justify-between">
            <motion.span
              className="block h-px w-full bg-current"
              animate={open ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.span
              className="block h-px w-full bg-current"
              animate={open ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            />
          </span>
          {open ? "Close" : "Index"}
        </button>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="index-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site index"
            className="fixed inset-0 z-[74] bg-surface"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", pointerEvents: "auto" }}
            // Dropped immediately on exit: the panel stays mounted for the
            // length of the wipe, and would otherwise keep swallowing clicks
            // meant for the page underneath it.
            exit={{ clipPath: "inset(0% 0% 100% 0%)", pointerEvents: "none" }}
            transition={panelTransition}
          >
            {/*
              The single scroll container, sized to the panel. The inner
              wrapper carries min-h-full so short content still spreads to the
              corners while tall content simply scrolls.

              `data-lenis-prevent` is what actually makes it scrollable: Lenis
              intercepts wheel and touch across the document and calls
              preventDefault, so without opting this subtree out the events
              never reach the panel's own overflow — stopping Lenis is not
              enough, since a stopped instance still swallows them.
            */}
            <div
              onClick={onGroundClick}
              data-lenis-prevent
              className="panel-scroll h-full overflow-y-auto overscroll-contain"
            >
              <div className="gutter flex min-h-full flex-col justify-between gap-12 pb-8 pt-24 md:pb-12 md:pt-32">
                <nav aria-label="Sections" data-menu-content>
                  <ul>
                    {sections.map((section, index) => {
                      const isActive = activeSection === section.id;

                      return (
                        <li key={section.id} className="hairline">
                          <FlowingRow label={section.label}>
                            <motion.a
                              href={`#${section.id}`}
                              onClick={(event) => goTo(event, section.id)}
                              aria-current={isActive ? "true" : undefined}
                              data-cursor="view"
                              data-cursor-label="Go"
                              className="group flex w-full cursor-pointer items-baseline gap-5 py-3 text-left focus-visible:outline-offset-8 md:gap-10 md:py-5"
                              {...(reducedMotion
                                ? {}
                                : {
                                    initial: { opacity: 0, y: 32 },
                                    animate: { opacity: 1, y: 0 },
                                    transition: {
                                      duration: 0.7,
                                      delay: 0.18 + index * 0.06,
                                      ease: [0.16, 1, 0.3, 1] as const,
                                    },
                                  })}
                            >
                              <span
                                className={cn(
                                  "label w-8 shrink-0 transition-colors duration-300 group-hover:text-accent",
                                  isActive ? "text-accent" : "text-muted",
                                )}
                              >
                                {section.index}
                              </span>

                              <span className="font-display text-display font-extrabold text-ink transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:text-accent">
                                {section.label}
                              </span>

                              {isActive ? (
                                <span className="label ml-auto flex shrink-0 items-center gap-2 self-center text-accent">
                                  <span
                                    aria-hidden
                                    className="h-1.5 w-1.5 rounded-full bg-accent"
                                  />
                                  <span className="hidden sm:inline">Here</span>
                                </span>
                              ) : null}
                            </motion.a>
                          </FlowingRow>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <motion.div
                  data-menu-content
                  className="hairline flex flex-wrap items-end justify-between gap-6 pt-6"
                  {...(reducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { duration: 0.6, delay: 0.5 },
                      })}
                >
                  <div className="flex flex-col gap-1">
                    <span className="label text-muted">Direct</span>
                    <a
                      href={`mailto:${site.email}`}
                      className="cursor-pointer text-ink transition-colors hover:text-accent"
                      data-cursor="link"
                    >
                      {site.email}
                    </a>
                  </div>

                  <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {socials
                      .filter((social) => social.id !== "email")
                      .map((social) => (
                        <li key={social.id}>
                          <MagneticButton
                            href={social.href}
                            external
                            cursorLabel="Open"
                            className="label cursor-pointer items-center text-muted transition-colors hover:text-accent"
                          >
                            {social.label}
                            <ArrowUpRight
                              className="h-3 w-3"
                              strokeWidth={1.5}
                            />
                          </MagneticButton>
                        </li>
                      ))}
                    <li>
                      <MagneticButton
                        href={site.resume}
                        external
                        cursorLabel="Open"
                        className="label cursor-pointer items-center text-muted transition-colors hover:text-accent"
                      >
                        Résumé
                        <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                      </MagneticButton>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
