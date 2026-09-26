/** Props for the untyped `Lanyard.jsx` scene, so callers stay type-checked. */
export type LanyardProps = {
  /** Camera position, `[x, y, z]`. */
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  /** Image URL or data URL composited onto the card's front face. */
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  /** Overrides the strap texture. */
  lanyardImage?: string | null;
  lanyardWidth?: number;
  /** Tints the strap texture; multiplied with it, so `white` leaves it as-is. */
  lanyardColor?: string;
  /** Multiplies the card mesh and its collider; the rope is unaffected. */
  cardScale?: number;
  /** Floods each texture half before compositing, hiding the baked atlas. */
  faceBackground?: string | null;
};

export default function Lanyard(props: LanyardProps): JSX.Element;
