"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";

import { useHydrated, useMediaQuery } from "@/lib/use-media-query";

interface CountUpProps {
  to: number;
  /** Decimal places to show. @default 0 */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Seconds. @default 1.4 */
  duration?: number;
  className?: string;
}

/** Rolls a number up from zero the first time it scrolls into view. */
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const hydrated = useHydrated();

  // Null until the roll actually starts. Everything before that is derived
  // rather than stored, so nothing has to be written back from an effect just
  // to get the number to its starting line.
  const [rolled, setRolled] = React.useState<number | null>(null);

  // The server, and the client through hydration, render the FINAL value: a
  // no-JS or pre-hydration reader sees 3.4x, not 0. Once the client has taken
  // over it drops to zero and waits to be scrolled into view. Under reduced
  // motion it never leaves the final value at all.
  const shown = rolled ?? (hydrated && !reducedMotion ? 0 : to);

  React.useEffect(() => {
    if (!inView || !hydrated || reducedMotion) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setRolled,
    });
    return () => controls.stop();
  }, [inView, hydrated, reducedMotion, to, duration]);

  return (
    <span ref={ref} className={className}>
      {/* The final value is in the DOM for screen readers and search engines,
          while the rolling number is presentational. */}
      <span aria-hidden="true">
        {prefix}
        {shown.toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {to.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
