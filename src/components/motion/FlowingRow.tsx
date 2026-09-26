"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

/** Enough repeats that the run is wider than any viewport before it loops. */
const REPEATS = 6;

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION = 520;

/**
 * A menu row the label flows across on hover.
 *
 * The band enters from the edge the pointer actually crossed and leaves by the
 * edge it leaves through, so the motion follows the hand rather than playing a
 * fixed direction — the row reads as something being pushed aside and let back.
 *
 * Driven by direct style writes rather than state: hovering a menu row should
 * not re-render the panel, and the band is decorative besides.
 */
export function FlowingRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  /** Above or below the row's midpoint — which edge the pointer came through. */
  const edgeOf = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY - rect.top < rect.height / 2 ? -101 : 101;
  };

  const onEnter = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const band = bandRef.current;
    if (!band) return;

    // Jump to the entry edge with no transition, then run in from there.
    band.style.transition = "none";
    band.style.transform = `translate3d(0, ${edgeOf(event)}%, 0)`;
    // Read back, so the browser cannot collapse both writes into one frame.
    void band.offsetHeight;
    band.style.transition = `transform ${DURATION}ms ${EASE}`;
    band.style.transform = "translate3d(0, 0%, 0)";
  }, []);

  const onLeave = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const band = bandRef.current;
    if (!band) return;

    band.style.transition = `transform ${DURATION}ms ${EASE}`;
    band.style.transform = `translate3d(0, ${edgeOf(event)}%, 0)`;
  }, []);

  if (reducedMotion) return <>{children}</>;

  return (
    <div
      className="relative isolate overflow-hidden"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {children}

      <div ref={bandRef} aria-hidden className="flow-band">
        <div className="flow-band-track">
          {[0, 1].map((run) => (
            <div key={run} className="flow-band-run">
              {Array.from({ length: REPEATS }, (_, index) => (
                <span key={index} className="flow-band-item">
                  {label}
                  <span aria-hidden className="flow-band-mark" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
