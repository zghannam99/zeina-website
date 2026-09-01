"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { track } from "@/lib/analytics";

interface NextPageRevealProps {
  /** Where the reader goes next. */
  href: string;
  /** The next page's name, set large in the panel. */
  label: string;
  /** Small line above the name. */
  eyebrow?: string;
}

/** Extra downward scrolling, in px, required once the panel is fully open. */
const THRESHOLD = 420;
/** How long a pause before the gesture is forgotten. */
const DECAY_MS = 700;

/**
 * A curtain that uncovers the next page as the reader reaches the bottom.
 *
 * The mechanic is entirely CSS. This wrapper sits in normal flow at the end of
 * the page and carries a `clip-path`, which clips its whole subtree — including
 * position:fixed descendants — without becoming their containing block. So the
 * panel inside stays pinned to the viewport while the window it is seen through
 * grows, and it reads as the next page lying underneath this one.
 *
 * Once it is fully open the page has no scroll left, so further wheel and touch
 * deltas are doing nothing anyway. Those are counted — passively, never
 * preventDefault'd — and a deliberate push past the threshold navigates. The
 * panel is also an ordinary link, so nobody has to discover the gesture.
 */
export function NextPageReveal({ href, label, eyebrow = "Next" }: NextPageRevealProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [ready, setReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // Mirrored in refs because the listeners below are registered once and would
  // otherwise close over the first render's values.
  const readyRef = React.useRef(false);
  const pushRef = React.useRef(0);
  const navigatedRef = React.useRef(false);

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let frame = 0;
    let decay = 0;

    const setPush = (value: number) => {
      pushRef.current = Math.min(THRESHOLD, Math.max(0, value));
      setProgress(pushRef.current / THRESHOLD);
    };

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      // The panel is fully uncovered once the curtain's top edge reaches the
      // top of the screen and there is no page left to scroll.
      const full = rect.top <= 1 && atBottom;
      if (full !== readyRef.current) {
        readyRef.current = full;
        setReady(full);
        if (!full) setPush(0);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const advance = (delta: number) => {
      if (!readyRef.current || navigatedRef.current) return;
      // The site menu can be open over a page that is already scrolled to the
      // bottom. Scrolling then belongs to the menu, not to the curtain — without
      // this, dismissing it with a scroll would fling the reader to the next page.
      if (document.querySelector('[aria-modal="true"]')) return;
      window.clearTimeout(decay);
      // Scrolling back up unwinds the gesture faster than it built up, so a
      // reader who changes their mind is not left hovering near the trigger.
      setPush(pushRef.current + (delta > 0 ? delta : delta * 2));
      if (pushRef.current >= THRESHOLD) {
        navigatedRef.current = true;
        track("next_page_revealed", { destination: href, method: "scroll" });
        router.push(href);
        return;
      }
      decay = window.setTimeout(() => setPush(0), DECAY_MS);
    };

    const onWheel = (e: WheelEvent) => advance(e.deltaY);

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      advance((touchY - y) * 2); // touch deltas are far smaller than wheel ones
      touchY = y;
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(decay);
    };
  }, [href, router]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-screen w-full"
      // The clip is what makes this work — see the note above.
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div className="fixed bottom-0 left-0 h-screen w-full border-t border-[#e7ded2] bg-[#f7f3ee]">
        <Link
          href={href}
          onClick={() => track("next_page_revealed", { destination: href, method: "click" })}
          className="group flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center"
        >
          <span className="font-mono text-[10px] font-medium tracking-[0.24em] text-[#8a8179] uppercase">
            {eyebrow}
          </span>

          <span className="font-serif text-[3rem] leading-[0.95] tracking-[-0.02em] text-[#2b2622] transition-colors duration-300 group-hover:text-[#b60d06] md:text-[6rem]">
            {label}
          </span>

          {/* The gesture's state, so the reader can see that pushing further is
              doing something rather than jamming against the end of the page. */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <span
              className={`font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                ready ? "text-[#b60d06]" : "text-[#8a8179]"
              }`}
            >
              {ready ? "Keep scrolling" : `Scroll to ${label}`}
            </span>
            <div
              aria-hidden="true"
              className={`h-[2px] w-40 overflow-hidden rounded-full bg-[#e7ded2] transition-opacity duration-300 ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="h-full rounded-full bg-[#b60d06]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default NextPageReveal;
