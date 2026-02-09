import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Color interpolation helpers                                        */
/* ------------------------------------------------------------------ */

/** Parse a hex color (#RRGGBB) into [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Linear interpolation between two numbers */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * 3-stop color interpolation (RGB) with flat zones.
 * t ∈ [0, 1]:
 *   0.0 – 0.3  → c0 (flat destructive)
 *   0.3 – 0.8  → c0 → c1 → c2 (interpolation zone)
 *   0.8 – 1.0  → c2 (flat primary)
 */
function interpolateProgressColor(t: number, c0: string, c1: string, c2: string): string {
  const clamped = Math.max(0, Math.min(1, t));

  if (clamped <= 0.3) return rgbString(hexToRgb(c0));
  if (clamped >= 0.8) return rgbString(hexToRgb(c2));

  // Map 0.3–0.8 to 0–1
  const local = (clamped - 0.3) / 0.5;

  const [r0, g0, b0] = hexToRgb(c0);
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);

  let r: number, g: number, b: number;
  if (local <= 0.5) {
    const sub = local / 0.5;
    r = lerp(r0, r1, sub);
    g = lerp(g0, g1, sub);
    b = lerp(b0, b1, sub);
  } else {
    const sub = (local - 0.5) / 0.5;
    r = lerp(r1, r2, sub);
    g = lerp(g1, g2, sub);
    b = lerp(b1, b2, sub);
  }

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function rgbString([r, g, b]: [number, number, number]) {
  return `rgb(${r}, ${g}, ${b})`;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Color stops: 0% → destructive (hot pink), 50% → gold, 100% → primary (mint) */
const COLOR_0 = "#FF4D94";
const COLOR_50 = "#EFBD6E";
const COLOR_100 = "#2DD4BF";

const BORDER_WIDTH = 3; // px
const BAR_WIDTH = 64; // px — total container width
const BAR_HEIGHT = 26; // px — total container height

/** Padding between border and inner fill = border width */
const INNER_PADDING = BORDER_WIDTH;

/** Inner fill area dimensions (accounting for border + padding on each side) */
const INNER_INSET = BORDER_WIDTH + INNER_PADDING;
const INNER_MAX_WIDTH = BAR_WIDTH - INNER_INSET * 2;
const INNER_HEIGHT = BAR_HEIGHT - INNER_INSET * 2;

/** Delay before the trailing layer catches up (ms) */
const GHOST_DELAY = 360;

/** Border radius */
const CONTAINER_RADIUS = 8; // px — rounded rectangle, not capsule
const INNER_RADIUS = Math.max(3, CONTAINER_RADIUS - INNER_INSET); // slightly smaller for inset

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Props = {
  /** Progress value 0-100 */
  value: number;
  squashX?: MotionValue<number>;
  squashY?: MotionValue<number>;
  className?: string;
};

export function ProgressBar({ value, squashX, squashY, className }: Props) {
  const normalized = Math.max(0, Math.min(1, value / 100));

  /* ---- animated spring values ---- */
  const mainProgress = useMotionValue(normalized);
  const ghostProgress = useMotionValue(normalized);

  const mainSpring = useSpring(mainProgress, { stiffness: 300, damping: 28 });
  const ghostSpring = useSpring(ghostProgress, { stiffness: 300, damping: 28 });

  /* ---- rubber pulse key ---- */
  const [rubberKey, setRubberKey] = React.useState(0);
  const prevValueRef = React.useRef(value);
  const ghostTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  /* ---- hit-flash effect ---- */
  const [flashKey, setFlashKey] = React.useState(0);
  const lastFlashTimeRef = React.useRef(0);
  const MIN_FLASH_INTERVAL = 300; // ms

  React.useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    const newNorm = Math.max(0, Math.min(1, value / 100));

    if (prev === value) return;

    const now = Date.now();
    const timeSinceLastFlash = now - lastFlashTimeRef.current;

    // Trigger rubber pulse and flash only if enough time has passed
    if (timeSinceLastFlash >= MIN_FLASH_INTERVAL) {
      setRubberKey((k) => k + 1);
      setFlashKey((k) => k + 1);
      lastFlashTimeRef.current = now;
    }

    // Clear any pending ghost timeout
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current);
      ghostTimeoutRef.current = null;
    }

    const increasing = value > prev;

    if (increasing) {
      // Ghost (doubler) moves first, main catches up after delay
      ghostProgress.set(newNorm);
      ghostTimeoutRef.current = setTimeout(() => {
        mainProgress.set(newNorm);
      }, GHOST_DELAY);
    } else {
      // Main moves first, ghost catches up after delay
      mainProgress.set(newNorm);
      ghostTimeoutRef.current = setTimeout(() => {
        ghostProgress.set(newNorm);
      }, GHOST_DELAY);
    }

    return () => {
      if (ghostTimeoutRef.current) clearTimeout(ghostTimeoutRef.current);
    };
  }, [value, mainProgress, ghostProgress]);

  /* ---- derived widths ---- */
  const mainWidth = useTransform(mainSpring, (v) =>
    Math.max(0, Math.min(v * INNER_MAX_WIDTH, INNER_MAX_WIDTH))
  );

  /* ---- derived colors ---- */
  const mainColor = useTransform(mainSpring, (v) =>
    interpolateProgressColor(v, COLOR_0, COLOR_50, COLOR_100)
  );

  /**
   * Ghost: uses the MAIN progress color in real-time,
   * rendered as a solid color with reduced opacity.
   */
  const ghostColor = useTransform(mainSpring, (mv) => {
    // Get the current progress color based on MAIN value (real-time)
    const ghostColorRgb = interpolateProgressColor(mv, COLOR_0, COLOR_50, COLOR_100);
    // Convert to rgba with 50% opacity
    return ghostColorRgb.replace('rgb', 'rgba').replace(')', ', 0.5)');
  });

  const ghostW = useTransform(ghostSpring, (v) =>
    Math.max(0, Math.min(v * INNER_MAX_WIDTH, INNER_MAX_WIDTH))
  );

  /* ---- squash-stretch combination ---- */
  const fallbackX = useMotionValue(1);
  const fallbackY = useMotionValue(1);
  const sX = squashX ?? fallbackX;
  const sY = squashY ?? fallbackY;

  return (
    <motion.div
      key={rubberKey}
      className={cn("animate-rubber flex-shrink-0", className)}
      style={{
        width: BAR_WIDTH,
        height: BAR_HEIGHT,
        scaleX: sX,
        scaleY: sY,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Container — same parallax layer as ScoreInput containers (z: 0) */}
      <div
        key={flashKey}
        className="relative w-full h-full hit-flash-container"
        style={{
          backgroundColor: "hsl(var(--card))",
          border: `${BORDER_WIDTH}px solid hsl(var(--foreground))`,
          borderRadius: CONTAINER_RADIUS,
          transform: "translateZ(0px)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ghost / doubler fill — same parallax layer as task names/emoji */}
        <motion.div
          key={`ghost-${flashKey}`}
          className="absolute hit-flash-bar"
          style={{
            top: INNER_PADDING,
            left: INNER_PADDING,
            height: INNER_HEIGHT,
            width: ghostW,
            backgroundColor: ghostColor,
            borderRadius: INNER_RADIUS,
            transform: "translateZ(0px)",
            transformStyle: "preserve-3d",
          }}
        />

        {/* Main progress fill — same parallax layer as task names/emoji */}
        <motion.div
          key={`main-${flashKey}`}
          className="absolute hit-flash-bar"
          style={{
            top: INNER_PADDING,
            left: INNER_PADDING,
            height: INNER_HEIGHT,
            width: mainWidth,
            backgroundColor: mainColor,
            borderRadius: INNER_RADIUS,
            transform: "translateZ(20px)",
            transformStyle: "preserve-3d",
          }}
        />
      </div>
    </motion.div>
  );
}
