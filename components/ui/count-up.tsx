"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";

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
  // Starts at the FINAL value so the server-rendered HTML is truthful — a
  // no-JS or pre-hydration reader sees 3.4x, not 0. The client resets it to
  // zero on mount, before it has scrolled into view.
  const [display, setDisplay] = React.useState(() => to.toFixed(decimals));
  const [armed, setArmed] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) setDisplay((0).toFixed(decimals));
    setArmed(true);
  }, [decimals]);

  React.useEffect(() => {
    if (!inView || !armed) return;
    if (reducedMotion) {
      setDisplay(to.toFixed(decimals));
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, armed, to, decimals, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {/* The final value is in the DOM for screen readers and search engines,
          while the rolling number is presentational. */}
      <span aria-hidden="true">
        {prefix}
        {display}
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
