"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BubbleBackground } from "@/components/ui/bubble-background";
import { track } from "@/lib/analytics";

interface NextPageRevealProps {
  /** Where the reader goes next. */
  href: string;
  /** The next page's name, set large in the panel. */
  label: string;
  /** Small line above the name. */
  eyebrow?: string;
}

/** Quiet time, in ms, that stands for "the scrolling has stopped". */
const SETTLE_MS = 140;
/** Pixels of the track given up to rounding — see the note in `measure`. */
const SLACK = 2;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * A curtain that uncovers the next page as the reader reaches the bottom.
 *
 * The reveal is entirely CSS. This wrapper sits in normal flow at the end of
 * the page and carries a `clip-path`, which clips its whole subtree — including
 * position:fixed descendants — without becoming their containing block. So the
 * panel inside stays pinned to the viewport while the window it is seen through
 * grows, and it reads as the next page lying underneath this one.
 *
 * The wrapper is 175lvh: the first screen of that uncovers the panel, and the
 * remaining 75 is the curtain's own scroll track — real page scrolling, with
 * somewhere to actually go, which the progress bar simply reports. Everything
 * follows from that. The bar moves with the scroll because it *is* the scroll
 * position; it holds still when the reader holds still, because a position does
 * not decay; and it reaches the end exactly as the document does.
 *
 * This replaced a version that counted wheel and touch deltas *past* the end of
 * the page. On a trackpad that reads fine, which is why it survived. On a phone
 * it never could: with the rubber-band suppressed there is no scrolling left to
 * measure, so the bar was being driven by raw finger deltas against a page that
 * was not moving, and a pause wiped the progress rather than holding it.
 */
export function NextPageReveal({ href, label, eyebrow = "Next" }: NextPageRevealProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // The one piece of state worth re-rendering for: it flips once.
  const [ready, setReady] = React.useState(false);
  const readyRef = React.useRef(false);
  const navigatedRef = React.useRef(false);

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let frame = 0;
    let touching = false;
    let armed = false;
    let quiet = 0;

    const commit = () => {
      if (navigatedRef.current) return;
      // The site menu can be open over a page that is already at its end.
      // Scrolling then belongs to the menu, not to the curtain — without this,
      // dismissing it with a scroll would carry the reader onward.
      if (document.querySelector('[aria-modal="true"]')) return;
      navigatedRef.current = true;
      window.clearTimeout(quiet);
      track("next_page_revealed", { destination: href, method: "scroll" });
      router.push(href);
    };

    /** Hands over once the gesture behind the scroll has finished, never in the
     *  middle of one. The next page, unlike this one, has somewhere to scroll:
     *  navigate while a finger is still travelling and the rest of that gesture
     *  is spent on the new page, dropping the reader at the end of something
     *  they have not read. A finger still down waits for touchend; anything
     *  else waits for the scrolling to go quiet. */
    const settle = () => {
      window.clearTimeout(quiet);
      if (touching) return;
      quiet = window.setTimeout(commit, SETTLE_MS);
    };

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();

      // The panel is fully uncovered once the curtain's top edge reaches the
      // top of the screen; everything past that is the track.
      const full = rect.top <= 1;
      if (full !== readyRef.current) {
        readyRef.current = full;
        setReady(full);
      }

      // -rect.top is how far into the wrapper the reader has scrolled, and the
      // track is whatever of it does not fit on screen. At the foot of the
      // document those are equal — no matter what iOS is doing with its
      // toolbars, since the viewport term cancels.
      //
      // Short by SLACK so the track ends a couple of pixels before the document
      // does. rect.top is fractional while offsetHeight and innerHeight are
      // whole, so the honest sum lands on 0.999 at the bottom and the hand-over
      // would simply never arm. Two pixels early is invisible and always true.
      const travel = Math.max(1, el.offsetHeight - window.innerHeight - SLACK);
      const progress = clamp01(-rect.top / travel);

      // Written straight to the DOM: this runs on every scroll frame, and
      // re-rendering the tree that often is both wasteful and janky.
      if (barRef.current) barRef.current.style.width = `${progress * 100}%`;

      if (progress >= 1) {
        armed = true;
        settle();
      } else if (armed) {
        // Scrolled back off the end — the reader changed their mind.
        armed = false;
        window.clearTimeout(quiet);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onTouchStart = () => {
      touching = true;
    };
    const onTouchEnd = () => {
      touching = false;
      if (armed) commit();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (frame) cancelAnimationFrame(frame);
      // A pending hand-over must not fire into a page the reader has since left
      // by some other route.
      window.clearTimeout(quiet);
    };
  }, [href, router]);

  return (
    <div
      ref={wrapperRef}
      // One screen to uncover the panel, then three quarters of one more as the
      // track the progress bar measures.
      //
      // lvh, not svh, and not vh either. This box has to reach the top of the
      // screen for the panel to count as open, and sized in svh its top sits
      // below that for as long as iOS keeps its toolbars collapsed — so the
      // curtain could not finish until the chrome happened to snap back, which
      // is a lurch. lvh is never shorter than the viewport, and unlike dvh it
      // does not resize mid-scroll while the toolbars animate.
      className="relative h-[175lvh] w-full"
      // The clip is what makes this work — see the note above.
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div className="fixed inset-0 overflow-hidden border-t border-[#e7ded2] bg-[#f7f3ee]">
        {/* The panel reads as the next page lying under this one, so it carries
            the same drifting bubbles every page has. Without them it was a flat
            cream slab between two pages that both breathe, which is the moment
            the illusion broke. Not `interactive`: the pointer bubble mounts its
            own viewport-fixed layer, which has no business inside a curtain. */}
        <BubbleBackground />
        <Link
          href={href}
          onClick={() => track("next_page_revealed", { destination: href, method: "click" })}
          className="group relative z-10 flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center"
        >
          <span className="font-mono text-[10px] font-medium tracking-[0.24em] text-[#8a8179] uppercase">
            {eyebrow}
          </span>

          <span className="font-serif text-[3rem] leading-[0.95] tracking-[-0.02em] text-[#2b2622] transition-colors duration-300 group-hover:text-[#b60d06] md:text-[6rem]">
            {label}
          </span>

          {/* Where the reader is along the track, so that carrying on reads as
              progress towards something rather than jamming against the end. */}
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
              <div ref={barRef} className="h-full rounded-full bg-[#b60d06]" style={{ width: 0 }} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default NextPageReveal;
