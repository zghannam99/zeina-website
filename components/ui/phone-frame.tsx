"use client";

import * as React from "react";

interface PhoneFrameProps {
  /** Screen recording to play inside the frame. */
  src: string;
  /** Caption under the frame, and the video's accessible name. */
  caption: string;
  /** Optional second line under the caption. */
  sub?: string;
  /** Frame width in px. @default 260 */
  width?: number;
}

/** The recordings are full iPhone screens (1180x2556 before transcoding). */
const SCREEN_RATIO = 960 / 444;

/**
 * A screen recording inside an iPhone frame.
 *
 * The bezel proportions match the phones on the projects page, so the case
 * study and the carousel read as the same device rather than two takes on one.
 *
 * Playback is tied to visibility: these are half-minute walkthroughs, and three
 * of them looping at once off-screen is a lot of decoding for something nobody
 * is looking at. Nothing is fetched until the frame is near the viewport
 * either, which matters — they are the heaviest assets on the site.
 */
export function PhoneFrame({ src, caption, sub, width = 260 }: PhoneFrameProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() rejects if the browser declines autoplay; there is nothing
          // to do about it here and an unhandled rejection would surface as an
          // error in the console.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const bezel = Math.max(9, Math.round(width * 0.038));
  const screenW = width - bezel * 2;
  const screenH = Math.round(screenW * SCREEN_RATIO);

  return (
    <figure className="flex flex-col items-start gap-4">
      <div
        className="relative shrink-0 rounded-[13%] bg-[#241f1b] ring-1 ring-black/10 shadow-[0_26px_60px_rgba(43,38,34,0.26)]"
        style={{ width, height: screenH + bezel * 2, padding: bezel }}
      >
        <div
          className="relative overflow-hidden rounded-[11%] bg-[#efe8df]"
          style={{ width: screenW, height: screenH }}
        >
          <video
            ref={videoRef}
            src={src}
            width={444}
            height={960}
            aria-label={caption}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            // Deliberately not `autoplay`: the observer above starts it, so a
            // reader who never scrolls this far never downloads it.
            preload="none"
            controls={reduceMotion}
          />

          {/* Dynamic Island, matching the projects page phones. */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#241f1b]"
            style={{
              top: Math.round(screenH * 0.014),
              width: Math.round(screenW * 0.3),
              height: Math.round(screenW * 0.088),
            }}
          />
        </div>
      </div>

      <figcaption className="flex flex-col gap-1">
        <span className="text-[11px] font-medium tracking-[0.18em] text-[#b60d06] uppercase">
          {caption}
        </span>
        {sub && <span className="text-sm leading-[1.6] text-[#8a8179]">{sub}</span>}
      </figcaption>
    </figure>
  );
}

export default PhoneFrame;
