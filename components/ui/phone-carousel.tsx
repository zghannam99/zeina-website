"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type PhoneSlide = {
  name: string;
  /** e.g. "Completed", "In progress", "Coming soon". */
  status: string;
  /** Screen image. Omit for an empty frame. */
  src?: string;
  alt?: string;
  /** Case study page. Omit while the project has no page yet. */
  href?: string;
};

interface PhoneCarouselProps {
  slides: PhoneSlide[];
  /** Which slide is shown first. @default 0 */
  initialIndex?: number;
  /** Degrees of tilt at the edges. @default 11 */
  maxTilt?: number;
  className?: string;
}

// iPhone Pro Max screen is 1320x2868, so the screen is this much taller than wide.
const SCREEN_RATIO = 2868 / 1320;
const GAP = 48;
/** Matches the track's `top-6`. */
const TRACK_TOP = 24;
/** Breathing room under the tallest caption. */
const TRACK_BOTTOM = 8;

/**
 * A phone that leans toward the cursor in 3D.
 *
 * Pointer position is normalised to -0.5..0.5 across the frame and mapped to
 * rotateX/rotateY, springed so it trails the cursor slightly rather than
 * snapping. A sheen tracks the same position so the glass catches the light.
 */
function TiltPhone({
  children,
  maxTilt,
  radius,
}: {
  children: React.ReactNode;
  maxTilt: number;
  radius: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [canTilt, setCanTilt] = React.useState(false);
  const reduceMotion = useReducedMotion();

  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-maxTilt, maxTilt]), spring);

  const sheenX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.22), rgba(255,255,255,0) 55%)`;

  // Hover tilt needs a real pointer. Touch keeps the swipe instead.
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setCanTilt(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const active = canTilt && !reduceMotion;

  const onMove = (e: React.MouseEvent) => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div style={{ perspective: 1100 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          rotateX: active ? rotateX : 0,
          rotateY: active ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {children}
        {active && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: sheen, borderRadius: radius }}
          />
        )}
      </motion.div>
    </div>
  );
}

export function PhoneCarousel({
  slides,
  initialIndex = 0,
  maxTilt = 11,
  className,
}: PhoneCarouselProps) {
  const [active, setActive] = React.useState(initialIndex);
  const [frameWidth, setFrameWidth] = React.useState(280);
  const [slideHeight, setSlideHeight] = React.useState(0);
  const slideRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const draggedRef = React.useRef(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const resize = () => {
      const vw = window.innerWidth;
      setFrameWidth(Math.round(Math.min(280, Math.max(190, vw * 0.62))));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // The track is absolutely positioned, so its clipping parent needs an
  // explicit height — and that height was a hand-counted guess that came up
  // short, clipping the last line of the caption. Measure the columns instead.
  React.useEffect(() => {
    const els = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) return;

    // Local to the effect, so a resize starts the high-water mark over and the
    // frame can shrink back down with the window.
    let peak = 0;
    const measure = () => {
      // offsetHeight, not the bounding rect: inactive columns are scaled down,
      // and it is the unscaled layout height that has to fit.
      const tallest = Math.max(...els.map((el) => el.offsetHeight));
      // Only the active slide shows its link, so the natural height drops by a
      // line whenever a project without a case study takes focus. Tracking the
      // peak keeps the frame still instead of bouncing the controls below it.
      if (tallest > peak) {
        peak = tallest;
        setSlideHeight(tallest);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    els.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [slides.length, frameWidth]);

  const go = React.useCallback(
    (dir: number) => setActive((i) => Math.min(slides.length - 1, Math.max(0, i + dir))),
    [slides.length]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const bezel = Math.max(9, Math.round(frameWidth * 0.038));
  const screenW = frameWidth - bezel * 2;
  const screenH = Math.round(screenW * SCREEN_RATIO);
  const frameH = screenH + bezel * 2;
  const step = frameWidth + GAP;
  // Never below the old fixed height, so nothing collapses on the first paint
  // before the columns have been measured.
  const trackHeight = Math.max(frameH + 130, TRACK_TOP + slideHeight + TRACK_BOTTOM);

  return (
    <div
      className={cn("relative w-full", className)}
      role="group"
      aria-roledescription="carousel"
      aria-label="Projects"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="relative overflow-hidden" style={{ height: trackHeight }}>
        {/* Anchored at the centre line, then shifted so the active frame lands on it. */}
        <motion.div
          className="absolute top-6 left-1/2 flex items-start"
          style={{ gap: GAP }}
          animate={{ x: -(frameWidth / 2 + active * step) }}
          transition={
            reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 26 }
          }
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => {
            draggedRef.current = true;
          }}
          onDragEnd={(_, info) => {
            const thrown = info.offset.x + info.velocity.x * 0.18;
            if (thrown < -step / 3) go(1);
            else if (thrown > step / 3) go(-1);
            window.setTimeout(() => {
              draggedRef.current = false;
            }, 60);
          }}
        >
          {slides.map((slide, i) => {
            const isActive = i === active;
            return (
              <motion.div
                key={slide.name}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="flex flex-shrink-0 flex-col items-center"
                style={{ width: frameWidth }}
                animate={{ scale: isActive ? 1 : 0.84, opacity: isActive ? 1 : 0.5 }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                }
                onClick={() => {
                  if (!draggedRef.current && !isActive) {
                    setActive(i);
                    track("project_viewed", { project: slide.name, position: i + 1 });
                  }
                }}
              >
                <TiltPhone maxTilt={maxTilt} radius="13%">
                  <div
                    className={cn(
                      "relative shrink-0 rounded-[13%] bg-[#241f1b] ring-1 ring-black/10",
                      isActive
                        ? "shadow-[0_26px_60px_rgba(43,38,34,0.26)]"
                        : "cursor-pointer shadow-[0_14px_36px_rgba(43,38,34,0.16)]",
                      isActive && slide.href && "cursor-pointer"
                    )}
                    style={{ width: frameWidth, height: frameH, padding: bezel }}
                  >
                    <div
                      className="relative overflow-hidden rounded-[11%] bg-[#efe8df]"
                      style={{ width: screenW, height: screenH }}
                    >
                      {slide.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slide.src}
                          alt={slide.alt ?? `${slide.name} app screen`}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-[#a39a90]">
                            Coming soon
                          </span>
                        </div>
                      )}

                      {/* Dynamic Island */}
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

                    {/* The phone itself is the link once it's in focus — clicking
                        the app is the obvious gesture, and the text link below is
                        only a visible cue. Guarded so ending a drag on top of a
                        phone doesn't navigate. */}
                    {isActive && slide.href && (
                      <Link
                        href={slide.href}
                        aria-label={`${slide.name} — read the case study`}
                        className="absolute inset-0 z-20 rounded-[13%]"
                        onClick={(e) => {
                          if (draggedRef.current) {
                            e.preventDefault();
                            return;
                          }
                          track("case_study_opened", {
                            project: slide.name,
                            destination: slide.href!,
                            surface: "phone",
                          });
                        }}
                      />
                    )}
                  </div>
                </TiltPhone>

                {/* Caption */}
                <div className="mt-7 flex flex-col items-center gap-2 text-center">
                  <p className="font-serif text-2xl leading-none text-[#2b2622]">{slide.name}</p>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]",
                      slide.src
                        ? "bg-[rgba(182,13,6,0.08)] text-[#b60d06]"
                        : "border border-[#e0d6c8] text-[#a39a90]"
                    )}
                  >
                    {slide.status}
                  </span>

                  {/* Only a project with a page gets a way in — and it needs a
                      visible cue, since the other phones look identical. */}
                  {slide.href && isActive && (
                    <Link
                      href={slide.href}
                      className="group/link mt-2 inline-flex items-center gap-1.5 text-sm text-[#b60d06] transition-colors hover:text-[#8a0a04]"
                      onClick={(e) => {
                        if (draggedRef.current) {
                          e.preventDefault();
                          return;
                        }
                        track("case_study_opened", {
                          project: slide.name,
                          destination: slide.href!,
                          surface: "caption_link",
                        });
                      }}
                    >
                      Read the case study
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={active === 0}
          aria-label="Previous project"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e0d6c8] text-[#2b2622] transition-colors hover:border-[#b60d06] hover:text-[#b60d06] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          {slides.map((slide, i) => (
            <button
              key={slide.name}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${slide.name}`}
              aria-current={i === active}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === active ? "w-7 bg-[#b60d06]" : "w-2 bg-[#d9cec0] hover:bg-[#c0b3a3]"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={active === slides.length - 1}
          aria-label="Next project"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e0d6c8] text-[#2b2622] transition-colors hover:border-[#b60d06] hover:text-[#b60d06] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default PhoneCarousel;
