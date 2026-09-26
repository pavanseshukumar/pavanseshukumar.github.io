/**
 * Artwork for the lanyard badge's two faces.
 *
 * The 3D card is a textured mesh, so its faces can only ever be bitmaps — a
 * React component cannot be mapped onto one. The front face is therefore a
 * bake of `ProfileCard`: the same composition (inner gradient, holographic
 * sheen, bottom-anchored avatar, and the name and title over it), drawn to a
 * canvas at the card's proportions and used on both sides of the card.
 *
 * The result is a PNG data URL, so replacing it with real artwork later means
 * swapping a string.
 */

/** Face size in pixels. Close to ProfileCard's 0.718 aspect. */
const W = 512;
const H = 720;

/** ProfileCard's 30px radius, at this size. */
const RADIUS = 40;

/** ProfileCard sizes its interior in 16px ems; this is that scale, here. */
const EM = 21;

const ACCENT = "#b7ff3c";

/**
 * ProfileCard's structure, in this site's palette rather than the component's
 * purple/blue: void ground, an accent wash instead of the violet gradient, and
 * a sheen built from accent and ink rather than the six `--sunpillar` hues.
 */
const CARD = {
  ground: "#050505",
  gradient: ["rgba(183, 255, 60, 0.12)", "rgba(245, 245, 240, 0.05)"] as const,
  /** The two tones the holographic sheen passes through. */
  sheen: ["rgba(183, 255, 60, 0.5)", "rgba(245, 245, 240, 0.35)"] as const,
  /** The name is ink falling off to dim, the way the page's display type is. */
  nameGradient: ["#f5f5f0", "rgba(245, 245, 240, 0.62)"] as const,
} as const;

export type BadgeFaceContent = {
  name: string;
  title: string;
  /** Drawn bottom-anchored and width-filling, as ProfileCard does. */
  avatarUrl?: string | null;
};

type Fonts = { display: string; sans: string; mono: string };

/** Resolves a font token to the family list Next's font loader generated. */
function family(token: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value || fallback;
}

/** Resolves to null rather than rejecting, so a missing avatar is survivable. */
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

/** `roundRect` is recent enough to be worth not depending on. */
function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** A vertical gradient across the text's own box, as `background-clip: text`. */
function gradientText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  baseline: number,
  size: number,
  stops: readonly [string, string],
) {
  const gradient = ctx.createLinearGradient(0, baseline - size, 0, baseline);
  gradient.addColorStop(0, stops[0]);
  gradient.addColorStop(1, stops[1]);
  ctx.fillStyle = gradient;
  ctx.textAlign = "center";
  ctx.fillText(text, cx, baseline);
}

/** Shrinks a font until the text fits `max`, so long names never clip. */
function fitted(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: string,
  size: number,
  fontFamily: string,
  max: number,
): number {
  let current = size;
  ctx.font = `${weight} ${current}px ${fontFamily}`;
  while (ctx.measureText(text).width > max && current > 12) {
    current -= 1;
    ctx.font = `${weight} ${current}px ${fontFamily}`;
  }
  return current;
}

/* ------------------------------------------------------------------ *
 * Front — the ProfileCard bake
 * ------------------------------------------------------------------ */

function ground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = CARD.ground;
  ctx.fillRect(0, 0, W, H);

  // `linear-gradient(145deg, …)`, ProfileCard's --inner-gradient.
  const inner = ctx.createLinearGradient(0, 0, W * 0.75, H);
  inner.addColorStop(0, CARD.gradient[0]);
  inner.addColorStop(1, CARD.gradient[1]);
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, W, H);
}

/**
 * The holographic sheen, flattened. On the live card this is a masked rainbow
 * in `color-dodge` that tracks the pointer; baked, it becomes one fixed
 * diagonal pass at low opacity, plus the dark radial ProfileCard layers over
 * it, so the face still catches light instead of reading as flat print.
 */
function sheen(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // One diagonal gleam, accent through ink, rather than a rainbow.
  ctx.globalAlpha = 0.24;
  const gleam = ctx.createLinearGradient(0, H, W, 0);
  gleam.addColorStop(0, "rgba(183, 255, 60, 0)");
  gleam.addColorStop(0.42, CARD.sheen[0]);
  gleam.addColorStop(0.58, CARD.sheen[1]);
  gleam.addColorStop(1, "rgba(245, 245, 240, 0)");
  ctx.fillStyle = gleam;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // ProfileCard's radial darkening, holding the middle down.
  const vignette = ctx.createRadialGradient(
    W * 0.5,
    H * 0.42,
    W * 0.1,
    W * 0.5,
    H * 0.42,
    H * 0.8,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0.08)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

/** Bottom-anchored and width-filling, the way ProfileCard places its avatar. */
function avatar(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  const scale = Math.max(W / image.width, (H * 0.92) / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (W - w) / 2, H - h, w, h);

  /*
   * ProfileCard sets its name in `mix-blend-mode: luminosity`, which keeps it
   * legible over whatever is behind it. A bake has no blend mode to lean on,
   * so the top of the photo is darkened instead — enough for the name to hold
   * against a bright background, not enough to read as a band.
   */
  const scrim = ctx.createLinearGradient(0, H * 0.52, 0, H);
  scrim.addColorStop(0, "rgba(5, 5, 5, 0)");
  scrim.addColorStop(0.55, "rgba(5, 5, 5, 0.55)");
  scrim.addColorStop(1, "rgba(5, 5, 5, 0.88)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.52, W, H * 0.48);
}

/** Stand-in until the real cut-out exists: a marked slot, not a blank card. */
function avatarSlot(
  ctx: CanvasRenderingContext2D,
  fonts: Fonts,
  path: string,
) {
  const slot = { x: 46, y: H * 0.3, w: W - 92, h: H * 0.58 };

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundedPath(ctx, slot.x, slot.y, slot.w, slot.h, 18);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.setLineDash([8, 7]);
  roundedPath(ctx, slot.x, slot.y, slot.w, slot.h, 18);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(245, 245, 240, 0.55)";
  ctx.font = `500 15px ${fonts.mono}`;
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.18em";
  ctx.fillText("PHOTO", W / 2, slot.y + slot.h / 2 - 4);
  ctx.letterSpacing = "0em";
  ctx.font = `400 13px ${fonts.mono}`;
  ctx.fillStyle = "rgba(245, 245, 240, 0.3)";
  ctx.fillText(path, W / 2, slot.y + slot.h / 2 + 22);
}

function front(
  ctx: CanvasRenderingContext2D,
  c: BadgeFaceContent,
  fonts: Fonts,
  image: HTMLImageElement | null,
) {
  ctx.save();
  roundedPath(ctx, 0, 0, W, H, RADIUS);
  ctx.clip();

  ground(ctx);
  if (image) avatar(ctx, image);
  sheen(ctx);
  if (!image) avatarSlot(ctx, fonts, c.avatarUrl ?? "no image set");

  /*
   * Name and role sit at the foot of the card, over the scrim, in the page's
   * own two type voices: the display face, uppercase and tight, above a mono
   * micro-label in the accent — how every other section names itself.
   */
  const nameSize = fitted(
    ctx,
    c.name.toUpperCase(),
    "800",
    EM * 2.6,
    fonts.display,
    W - 72,
  );
  const baseline = H - 44 - EM * 1.5;
  ctx.letterSpacing = "-0.03em";
  gradientText(
    ctx,
    c.name.toUpperCase(),
    W / 2,
    baseline,
    nameSize,
    CARD.nameGradient,
  );
  ctx.letterSpacing = "0em";

  ctx.font = `500 14px ${fonts.mono}`;
  ctx.letterSpacing = "0.18em";
  ctx.fillStyle = ACCENT;
  ctx.textAlign = "center";
  ctx.fillText(c.title.toUpperCase(), W / 2, baseline + EM * 1.5);
  ctx.letterSpacing = "0em";

  ctx.restore();
}

/* ------------------------------------------------------------------ */

function paint(
  draw: (ctx: CanvasRenderingContext2D, fonts: Fonts) => void,
): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  draw(ctx, {
    display: family("--font-display", "system-ui, sans-serif"),
    sans: family("--font-sans", "system-ui, sans-serif"),
    mono: family("--font-mono", "ui-monospace, monospace"),
  });

  return canvas.toDataURL("image/png");
}

/**
 * The card's faces as PNG data URLs, ready to hand to the badge as textures.
 * Both sides carry the same artwork, so the card reads the same whichever way
 * it happens to be swinging — one bake, handed to both.
 *
 * Async because the avatar has to be decoded before it can be composited; a
 * missing or failed image falls back to a marked slot rather than an empty
 * card.
 */
export async function buildBadgeFaces(content: BadgeFaceContent) {
  if (typeof document === "undefined") return { front: null, back: null };

  const image = content.avatarUrl ? await loadImage(content.avatarUrl) : null;
  const face = paint((ctx, fonts) => front(ctx, content, fonts, image));

  return { front: face, back: face };
}
