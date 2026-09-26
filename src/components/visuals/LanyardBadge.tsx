"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { hero, site } from "@/lib/data/site";
import { buildBadgeFaces, type BadgeFaceContent } from "@/lib/badgeFace";
import {
  useIsCoarsePointer,
  useIsDesktop,
  usePrefersReducedMotion,
} from "@/lib/hooks/useMediaQuery";

/**
 * The hero's hanging ID badge — a physics-driven card the reader can grab.
 *
 * Three.js, Rapier and the card model together are far heavier than the rest
 * of the page, so none of it is in the initial bundle: the scene is imported
 * on the client only, after mount, and never at all when the reader has asked
 * for reduced motion (the whole point of it is a swinging rope) or on a coarse
 * pointer, where there is nothing to grab it with and the type needs the room.
 */
const Lanyard = dynamic(() => import("@/components/Lanyard"), { ssr: false });

/**
 * The photo composited onto the front face. Anchored to the bottom edge and
 * filled to the width, as ProfileCard places its avatar, so a portrait crop
 * suits it best. A missing file falls back to a marked photo slot.
 */
const AVATAR_URL = "/pic.jpg";

const CONTENT: BadgeFaceContent = {
  name: site.name,
  title: hero.discipline,
  avatarUrl: AVATAR_URL,
};

export function LanyardBadge() {
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useIsCoarsePointer();
  const desktop = useIsDesktop();
  const enabled = desktop && !coarse && !reducedMotion;

  const [faces, setFaces] = useState<{
    front: string | null;
    back: string | null;
  } | null>(null);

  // Faces are drawn with the site's own fonts, so they have to wait for those
  // to load — otherwise the labels bake in a fallback family. The bake itself
  // is async: the avatar has to decode before it can be composited.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const draw = () => {
      buildBadgeFaces(CONTENT).then((next) => {
        if (!cancelled) setFaces(next);
      });
    };

    if (document.fonts?.status === "loaded") draw();
    else document.fonts?.ready.then(draw).catch(draw);

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled || !faces) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[42vw] max-w-[620px]"
    >
      {/* Only the scene itself takes the pointer, so the hero's own
          pointer-tracked lighting keeps working everywhere else. */}
      <div className="pointer-events-auto h-full [&>div]:h-full">
        <Lanyard
          position={[0, 0, 22]}
          gravity={[0, -40, 0]}
          fov={20}
          frontImage={faces.front}
          backImage={faces.back}
          imageFit="cover"
          lanyardWidth={0.9}
          // The page's one saturated colour, --color-accent.
          lanyardColor="#b7ff3c"
          cardScale={1.32}
          // Fills the unused strip of each texture half, so the card has no
          // leftover band of the original white atlas along an edge.
          faceBackground="#050505"
        />
      </div>
    </div>
  );
}
