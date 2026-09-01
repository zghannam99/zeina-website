"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

interface FillTextProps {
  text: string;
  /** Typography for both copies — they must match exactly to overlay. */
  className?: string;
  /** Colour of the unfilled text. */
  trackClassName?: string;
  /** Colour of the filling text. */
  fillClassName?: string;
  /** ms between fill steps. @default 240 */
  stepMs?: number;
  /** Largest jump a single step can make, 0–1. @default 0.26 */
  stepMax?: number;
  /** ms before filling starts. @default 350 */
  startDelay?: number;
}

/**
 * Text that fills left-to-right in uneven steps, like a progress bar.
 *
 * Two identical copies are stacked; the top one is revealed by animating a
 * clip-path inset. A spring smooths each step so the fill eases rather than
 * snapping between values.
 */
export function FillText({
  text,
  className,
  trackClassName,
  fillClassName,
  stepMs = 240,
  stepMax = 0.26,
  startDelay = 350,
}: FillTextProps) {
  const progress = useSpring(0, { stiffness: 90, damping: 20, restDelta: 0.001 });
  // The step size is added to the TARGET, not to progress.get(). A spring's
  // current value lags its target, so compounding off it makes the fill creep
  // and stall short of the end.
  const target = React.useRef(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.jump(1);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        target.current = Math.min(1, target.current + Math.random() * stepMax);
        progress.set(target.current);
        if (target.current >= 1 && interval) clearInterval(interval);
      }, stepMs);
    }, startDelay);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [progress, stepMs, stepMax, startDelay]);

  const clipPath = useTransform(
    progress,
    [0, 1],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
  );

  return (
    <span className={cn("relative inline-block", className)}>
      {/* The unfilled copy holds the layout; the filled copy sits on top of it. */}
      <span aria-hidden="true" className={trackClassName}>
        {text}
      </span>
      <motion.span
        style={{ clipPath }}
        className={cn("absolute inset-0", fillClassName)}
      >
        {text}
      </motion.span>
    </span>
  );
}

export default FillText;
