"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollFlyInProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Static content held in the centre while the flyer passes. */
  children: React.ReactNode;
  /** The element that flies across — measured, so it can be any width. */
  flyer: React.ReactNode;
  /** Classes on the flyer wrapper — use to shift its path up or down. */
  flyerClassName?: string;
  /**
   * Where the flyer's right edge comes to rest, as a fraction of the viewport.
   * The flyer is wider than the screen, so anything below 1 still leaves the
   * cord running off the left edge — which is what makes it span the screen.
   */
  restRight?: number;
}

// The flight opens almost as soon as the section starts rising into view, so
// the handset is already well onto the screen through the stretch where the
// cards are leaving and the heading has not yet arrived — the long empty gap
// that otherwise reads as dead scrolling.
//
// Opening this early costs nothing in overlap. The flyer is centred in the
// sticky panel and then lifted, which parks it a little BELOW the section's
// own top edge, while the cards — vertically centred in their min-h-screen
// section — stop well ABOVE it. The two can never meet, at any progress.
//
// Easing matters as much as the opening: travelled linearly the handset is
// still a sliver a third of the way in, so it eases out — most of the distance
// covered early, then a long decelerating settle.
const FADE_IN: [number, number] = [0.04, 0.1];
// Ends at exactly 1 — the section is the last thing on the page, so progress 1
// is the final pixel of scroll. The cord finishes landing and the page ends
// together, with no dead scrolling left over afterwards.
const FLIGHT: [number, number] = [0.05, 1];

/** Cubic ease-out: fast arrival, long settle. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Maps `v` from [a,b] onto [0,1], clamped. */
const range = (v: number, [a, b]: [number, number]) => clamp01((v - a) / (b - a));

const ScrollFlyIn = React.forwardRef<HTMLDivElement, ScrollFlyInProps>(
  (
    { children, flyer, flyerClassName, className, restRight = 0.94, ...props },
    ref
  ) => {
    const targetRef = React.useRef<HTMLDivElement>(null);
    const layerRef = React.useRef<HTMLDivElement>(null);
    const flyerRef = React.useRef<HTMLDivElement>(null);

    // Written straight to the DOM from a rAF rather than through React state:
    // this runs on every scroll frame, and re-rendering the tree that often is
    // both wasteful and janky.
    React.useEffect(() => {
      const section = targetRef.current;
      const layer = layerRef.current;
      const flyerEl = flyerRef.current;
      if (!section || !layer || !flyerEl) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      let frame = 0;

      const apply = () => {
        frame = 0;
        const viewport = window.innerWidth;
        const flyerWidth = flyerEl.offsetWidth;
        if (!viewport || !flyerWidth) return;

        // The flyer is centred by the flex layer, so every offset below is
        // measured from that centred position.
        const centredLeft = (viewport - flyerWidth) / 2;
        // Fully clear of the left edge, plus a little slack.
        const startX = -(viewport + flyerWidth) / 2 - 40;
        // Right edge parked at `restRight` of the viewport.
        const restX = viewport * restRight - flyerWidth - centredLeft;

        if (reduce.matches) {
          // Park it rather than hide it — a reader who prefers reduced motion
          // should still get the picture, just without the flight.
          layer.style.transform = `translate3d(${restX}px, 0, 0)`;
          layer.style.opacity = "1";
          return;
        }

        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the section's top meets the bottom of the screen, 1 when its
        // bottom does — so progress hits 1 exactly as the reader reaches the
        // end of the page, and the clamp holds it there.
        const progress = clamp01((vh - rect.top) / rect.height);

        const x = startX + (restX - startX) * easeOut(range(progress, FLIGHT));
        layer.style.transform = `translate3d(${x}px, 0, 0)`;
        layer.style.opacity = String(range(progress, FADE_IN));
      };

      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(apply);
      };

      apply();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      reduce.addEventListener("change", schedule);
      // The flyer is sized in vw and holds an image that may still be loading,
      // so its width is not final at mount.
      const ro = new ResizeObserver(schedule);
      ro.observe(flyerEl);

      return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        reduce.removeEventListener("change", schedule);
        ro.disconnect();
      };
      // FADE_IN and FLIGHT are module constants, so this list is stable for the
      // life of the page. They are named anyway because Fast Refresh gives the
      // re-evaluated module fresh array identities: without them a timing edit
      // leaves the old listener bound and the change appears to do nothing.
      // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate, see above
    }, [restRight, FADE_IN, FLIGHT]);

    return (
      <div ref={targetRef} className={cn("relative h-[200svh]", className)} {...props}>
        {/* overflow-hidden clips the flyer to the viewport. Without it, an
            element wider than the screen translated past the edge forces a
            horizontal scrollbar on the whole page. */}
        <div
          ref={ref}
          className="sticky top-0 flex h-svh items-center justify-center overflow-hidden"
        >
          <div className="z-10 text-center">{children}</div>

          <div
            ref={layerRef}
            aria-hidden="true"
            style={{ opacity: 0, willChange: "transform, opacity" }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            {/* shrink-0 matters: as a flex item this would otherwise be squeezed
                to the container's width, and every position above is derived
                from its measured width. */}
            <div ref={flyerRef} className={cn("flex shrink-0 items-center", flyerClassName)}>
              {flyer}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ScrollFlyIn.displayName = "ScrollFlyIn";

export { ScrollFlyIn };
