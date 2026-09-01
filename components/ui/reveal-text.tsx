"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

interface RevealTextProps {
  /** Plain text only — it gets split on whitespace, so markup won't survive. */
  text: string;
  className?: string;
  /** Seconds before the first line moves. */
  delay?: number;
  /** Seconds between one line and the next. */
  stagger?: number;
}

/**
 * Wipes text upward one rendered line at a time as it scrolls into view.
 *
 * Lines are measured rather than guessed: the text is laid out in an offscreen
 * probe at the element's real width and grouped by the offsetTop of each word,
 * so the split follows however the text actually wraps at this viewport.
 */
export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.09,
}: RevealTextProps) {
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const [lines, setLines] = React.useState<string[] | null>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const inView = useInView(hostRef, { once: true, margin: "0px 0px -12% 0px" });

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
      const width = host.clientWidth;
      if (!width) return;
      const cs = getComputedStyle(host);

      const probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = [
        "position:absolute",
        "visibility:hidden",
        "pointer-events:none",
        "left:-99999px",
        "top:0",
        `width:${width}px`,
        `font-family:${cs.fontFamily}`,
        `font-size:${cs.fontSize}`,
        `font-weight:${cs.fontWeight}`,
        `font-style:${cs.fontStyle}`,
        `line-height:${cs.lineHeight}`,
        `letter-spacing:${cs.letterSpacing}`,
        "white-space:normal",
      ].join(";");

      const words = text.split(/\s+/).filter(Boolean);
      const spans = words.map((w) => {
        const s = document.createElement("span");
        s.textContent = w;
        s.style.display = "inline-block";
        probe.appendChild(s);
        probe.appendChild(document.createTextNode(" "));
        return s;
      });

      document.body.appendChild(probe);
      const groups: string[] = [];
      let current: string[] = [];
      let top: number | null = null;
      spans.forEach((s, i) => {
        const t = s.offsetTop;
        if (top === null) top = t;
        if (Math.abs(t - top) > 2) {
          groups.push(current.join(" "));
          current = [];
          top = t;
        }
        current.push(words[i]);
      });
      if (current.length) groups.push(current.join(" "));
      document.body.removeChild(probe);

      setLines(groups.length ? groups : [text]);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, [text]);

  return (
    <span ref={hostRef} className={className} style={{ display: "block" }}>
      {lines === null ? (
        // Reserve the right height before measuring, so nothing jumps.
        <span style={{ visibility: "hidden" }}>{text}</span>
      ) : (
        lines.map((line, i) => (
          <span key={i} style={{ display: "block", overflow: "hidden" }}>
            <motion.span
              style={{ display: "block", willChange: "transform" }}
              initial={reducedMotion ? false : { y: "110%" }}
              animate={inView || reducedMotion ? { y: 0 } : { y: "110%" }}
              transition={{
                duration: 0.85,
                delay: delay + i * stagger,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {line}
            </motion.span>
          </span>
        ))
      )}
    </span>
  );
}
