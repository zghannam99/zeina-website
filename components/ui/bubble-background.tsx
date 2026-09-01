"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, type SpringOptions } from "framer-motion";

import { cn } from "@/lib/utils";

type BubbleColors = {
  first: string;
  second: string;
  third: string;
  fourth: string;
  fifth: string;
  sixth: string;
};

type BubbleBackgroundProps = React.ComponentProps<"div"> & {
  /**
   * Adds a sixth bubble that trails the pointer. Desktop only — it is skipped
   * where there is no fine pointer to trail.
   */
  interactive?: boolean;
  transition?: SpringOptions;
  colors?: BubbleColors;
  /** Opacity of the whole layer. The bubbles are drawn at full strength and
   *  dimmed here — see the note on the goo filter below. */
  intensity?: number;
};

// The warm set already established by the drifting-shapes background: the
// accent, the timeline's orange-red, the card-back orange, a deep maroon, and
// one warm tan so the group isn't uniformly hot.
const PALETTE: BubbleColors = {
  first: "182,13,6", // #b60d06 accent
  second: "226,74,43", // #e24a2b
  third: "255,138,61", // #ff8a3d
  fourth: "107,10,46", // #6b0a2e
  fifth: "205,191,174", // #cdbfae
  sixth: "226,74,43", // pointer bubble
};

/**
 * Bubbles distributed down the page, sized against the viewport and spaced
 * against the document.
 *
 * They are ordinary page content rather than a viewport-fixed layer, which is
 * the whole reason they move on a phone: the movement is the page scrolling,
 * not an animation. A fixed layer depends on the browser repainting it mid
 * scroll, and iOS in particular does not do that during a momentum fling — nor
 * does any of it run for a reader who has Reduce Motion switched on. Making the
 * bubbles part of the document sidesteps both.
 *
 * Sizes are in vh so the composition stays the same on any screen; positions
 * are in per cent so they spread over however tall the page happens to be.
 *
 * On the goo filter: it fuses shapes by multiplying alpha by 18 and subtracting
 * 8, so it only merges what is already near-opaque. The bubbles are therefore
 * drawn at full strength and the whole layer dimmed by `intensity` — dim them
 * individually and the maths lands below zero and they vanish.
 */

type Bubble = {
  color: keyof BubbleColors;
  /** Diameter, in vh. */
  size: number;
  /** Position down the document, in per cent. */
  top: string;
  left: string;
  /**
   * Pivot for the orbit, as a transform-origin. The element's own centre is
   * 50% 50%, so the distance from that to the pivot is the orbit radius — an
   * origin of "50% 85%" swings the bubble in a circle 35% of its height wide.
   * This is where nearly all the visible movement comes from.
   */
  origin: string;
  /** Seconds for one full orbit. */
  orbit: number;
  /** Anticlockwise, so neighbours don't all sweep the same way. */
  reverse?: boolean;
  /** A smaller wobble on top of the orbit, in px. */
  drift: [number, number];
  driftDuration: number;
  /** Seconds for one breathe cycle. */
  breathe: number;
};

const BUBBLES: Bubble[] = [
  { color: "first",  size: 78, top: "0%",  left: "-16%", origin: "50% 88%",  orbit: 17, drift: [55, -45], driftDuration: 11, breathe: 13 },
  { color: "second", size: 62, top: "15%", left: "50%",  origin: "86% 50%",  orbit: 21, reverse: true, drift: [-50, 40], driftDuration: 13, breathe: 15 },
  { color: "third",  size: 85, top: "33%", left: "-20%", origin: "50% 16%",  orbit: 25, drift: [45, 50], driftDuration: 12, breathe: 17 },
  { color: "fourth", size: 58, top: "53%", left: "46%",  origin: "14% 50%",  orbit: 19, reverse: true, drift: [-45, -50], driftDuration: 14, breathe: 12 },
  { color: "fifth",  size: 80, top: "71%", left: "-14%", origin: "50% 84%",  orbit: 23, drift: [50, -40], driftDuration: 10, breathe: 16 },
  { color: "second", size: 64, top: "87%", left: "42%",  origin: "88% 50%",  orbit: 15, drift: [-45, 45], driftDuration: 12, breathe: 14 },
];

function BubbleBackground({
  className,
  children,
  interactive = false,
  intensity = 0.16,
  transition = { stiffness: 100, damping: 20 },
  colors = PALETTE,
  ...props
}: BubbleBackgroundProps) {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [finePointer, setFinePointer] = React.useState(false);
  // Phones and tablets get a cheaper build of the same effect — see the note
  // above the filter below.
  const [lite, setLite] = React.useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, transition);
  const springY = useSpring(pointerY, transition);

  // Scoped so two instances on one page can't fight over the same filter.
  const gooId = `bubble-goo-${React.useId().replace(/:/g, "")}`;

  React.useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMq = window.matchMedia("(pointer: fine)");
    const apply = () => {
      setReducedMotion(motionMq.matches);
      setFinePointer(pointerMq.matches);
      setLite(!pointerMq.matches);
    };
    apply();
    motionMq.addEventListener("change", apply);
    pointerMq.addEventListener("change", apply);
    return () => {
      motionMq.removeEventListener("change", apply);
      pointerMq.removeEventListener("change", apply);
    };
  }, []);

  const showPointerBubble = interactive && finePointer && !reducedMotion;

  React.useEffect(() => {
    if (!showPointerBubble) return;

    // Listened for on the window rather than the layer itself: the layer is
    // pointer-events-none so it never blocks the page under it, which also
    // means it never receives a mousemove of its own.
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        pointerX.set(e.clientX - window.innerWidth / 2);
        pointerY.set(e.clientY - window.innerHeight / 2);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [showPointerBubble, pointerX, pointerY]);

  // The gradient goes in a style object, not a Tailwind class. An interpolated
  // class name is invisible to Tailwind's scanner, which only generates classes
  // it can read as literal strings in the source — so `bg-[radial-gradient(...)]`
  // built from a variable produces no CSS at all and the bubbles never paint.
  const fill = (color: string): React.CSSProperties => ({
    backgroundImage: `radial-gradient(circle at center, rgba(${color},0.8) 0%, rgba(${color},0) 50%)`,
  });

  return (
    <>
      <div
        aria-hidden="true"
        data-slot="bubble-background"
        className={cn(
          "pointer-events-none absolute inset-0 z-0 overflow-hidden",
          className
        )}
        style={{ opacity: intensity }}
        {...props}
      >
        <svg className="absolute top-0 left-0 h-0 w-0">
          <defs>
            <filter id={gooId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        {/* The goo filter is what fuses the bubbles into one another, and it is
            also the single most expensive thing on the page. Anything animating
            inside a filtered element makes the browser re-run that filter over
            the whole surface every frame — and this surface is the height of
            the entire document. Desktop GPUs shrug; phones stutter badly.
            Touch devices therefore get the bare radial gradients, which are
            soft enough on their own that at 16% opacity the difference is
            barely visible. */}
        <div
          className="absolute inset-0"
          style={lite ? undefined : { filter: `url(#${gooId}) blur(30px)` }}
        >
          {(lite ? BUBBLES.slice(0, 4) : BUBBLES).map((b, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: `${b.size}vh`,
                height: `${b.size}vh`,
                top: b.top,
                left: b.left,
              }}
            >
              {/* Orbit. Each transform lives on its own element so they compose
                  instead of overwriting one another. */}
              <motion.div
                className="h-full w-full"
                style={{ transformOrigin: b.origin }}
                animate={reducedMotion ? undefined : { rotate: b.reverse ? -360 : 360 }}
                transition={{ duration: b.orbit, repeat: Infinity, ease: "linear" }}
              >
                {/* Wobble and breathe, so the orbit doesn't read as a rigid wheel. */}
                <motion.div
                  className="h-full w-full"
                  animate={
                    reducedMotion || lite
                      ? undefined
                      : {
                          x: [0, b.drift[0], 0],
                          y: [0, b.drift[1], 0],
                          scale: [1, 1.14, 1],
                        }
                  }
                  transition={{
                    x: { duration: b.driftDuration, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: b.driftDuration, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: b.breathe, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <div
                    className="h-full w-full rounded-full mix-blend-multiply"
                    style={fill(colors[b.color])}
                  />
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>

        {children}
      </div>

      {/* The pointer bubble is the one thing that genuinely belongs to the
          viewport rather than the document, so it gets its own fixed layer. */}
      {showPointerBubble && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          style={{ opacity: intensity }}
        >
          <div style={{ filter: "blur(40px)" }}>
            <motion.div
              className="absolute inset-0 rounded-full mix-blend-multiply"
              style={{ ...fill(colors.sixth), x: springX, y: springY }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export { BubbleBackground, type BubbleBackgroundProps };
export default BubbleBackground;
