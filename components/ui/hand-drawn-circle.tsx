"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HandDrawnCircleProps {
  /** The word (or words) to loop around. */
  children: React.ReactNode;
  /** Starts the draw when true. */
  active?: boolean;
  /** Seconds to wait after `active` before the line starts moving. */
  delay?: number;
  /** Skip the draw and show the finished loop — used for reduced motion. */
  instant?: boolean;
  /** Line colour. Defaults to the text colour it sits in. */
  stroke?: string;
  className?: string;
}

// Lifted from the hand-writing-text component. The library's <title> element
// went with it: it was branding, and screen readers announce it.
const LOOP_PATH =
  "M 950 90 C 1250 300, 1050 480, 600 520 C 250 520, 150 480, 150 300 C 150 120, 350 80, 600 80 C 850 80, 950 180, 950 180";

function HandDrawnCircle({
  children,
  active = true,
  delay = 0,
  instant = false,
  stroke = "currentColor",
  className,
}: HandDrawnCircleProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.9,
      transition: {
        pathLength: {
          duration: instant ? 0 : 2.5,
          ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
          delay: instant ? 0 : delay,
        },
        opacity: { duration: instant ? 0 : 0.5, delay: instant ? 0 : delay },
      },
    },
  };

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>

      <motion.svg
        aria-hidden="true"
        viewBox="0 0 1200 600"
        // The loop is drawn for a 1200x600 box, so it has to stretch to fit a
        // single word. preserveAspectRatio="none" lets it, and the stroke is
        // kept honest by vector-effect below.
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[210%] w-[155%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
        initial="hidden"
        animate={active ? "visible" : "hidden"}
      >
        <motion.path
          d={LOOP_PATH}
          fill="none"
          stroke={stroke}
          strokeWidth={5}
          // Without this the non-uniform scale renders the loop's vertical
          // runs far thicker than its horizontal ones.
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw}
        />
      </motion.svg>
    </span>
  );
}

export { HandDrawnCircle };
