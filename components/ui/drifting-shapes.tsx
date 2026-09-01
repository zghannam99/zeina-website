"use client";

import * as React from "react";
import { motion } from "framer-motion";

type Shape = {
  size: number;
  top: string;
  left: string;
  color: string;
  drift: [number, number];
  duration: number;
  delay: number;
};

// Soft washes rather than hard circles — heavily blurred so they read as light
// in the paper rather than objects on top of it.
const SHAPES: Shape[] = [
  { size: 420, top: "4%", left: "-8%", color: "rgba(182,13,6,0.07)", drift: [40, -30], duration: 19, delay: 0 },
  { size: 300, top: "22%", left: "82%", color: "rgba(226,74,43,0.08)", drift: [-34, 26], duration: 23, delay: 1.5 },
  { size: 360, top: "52%", left: "-6%", color: "rgba(255,138,61,0.07)", drift: [30, 34], duration: 21, delay: 3 },
  { size: 260, top: "70%", left: "78%", color: "rgba(182,13,6,0.06)", drift: [-26, -30], duration: 25, delay: 0.8 },
  { size: 200, top: "88%", left: "34%", color: "rgba(107,10,46,0.05)", drift: [28, -22], duration: 17, delay: 2.2 },
];

/** Slow-moving background wash. Purely decorative, and still under reduced motion. */
export function DriftingShapes() {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {SHAPES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            background: s.color,
            filter: "blur(60px)",
          }}
          animate={
            reducedMotion
              ? undefined
              : { x: [0, s.drift[0], 0], y: [0, s.drift[1], 0] }
          }
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
