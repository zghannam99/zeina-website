"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
  type MotionValue,
} from "framer-motion";
import { HandDrawnCircle } from "@/components/ui/hand-drawn-circle";

/** One card in the hero. `href` is optional — set it once the sub-page exists
 *  and the card becomes a link; until then it's a plain image that still flips. */
export type HeroCard = {
  src: string;
  /** Shown on the back of the card. Falls back to "View". */
  label?: string;
  /** e.g. "/work/typography" — omit while the page doesn't exist yet. */
  href?: string;
};

// --- Card dimensions ---
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

// --- Scroll choreography ---
// The hero holds the wheel until MORPH_END, keeps holding through the arc
// shuffle, then releases the page at RELEASE_AT. Tune these to taste.
const MORPH_END = 520; // circle has fully become the arc
// Past this the page scrolls normally. Kept close behind MORPH_END: the stretch
// after the arc forms only drifts the fan a few degrees, so a long tail here
// just reads as the page refusing to scroll. 700 units for ~12° of drift was
// most of a second of wheeling against a page that looked finished.
const RELEASE_AT = 780;

// --- Intro timeline ---
// introT runs 0 → 1 → 2: scattered, then a line, then the circle. It is a
// motion value rather than React state so the intro and the scroll morph are
// the same pipeline, with no re-render between them.
//
// One continuous keyframed run, not two timed animations — the line is a point
// the motion passes through, not a stop it waits at.
const INTRO_DELAY = 0.35; // s of scattered cards before anything moves
const INTRO_DURATION = 2.6; // s for the whole scatter → line → circle run
const LINE_AT_FRACTION = 0.42; // where in that run the line is reached
/** When the pen loop starts drawing. Slightly before the circle finishes
 *  closing, so the two gestures overlap rather than queue. */
const LOOP_DELAY = INTRO_DELAY + INTRO_DURATION - 0.4;

// --- Images ---
// Source files live in `public/images/hero/` at 600x800. They're PNGs, but
// next/image re-encodes them to WebP/AVIF at display size on request, so the
// browser never downloads the full-weight originals.
//
// Add `label` for the text on the back of the card, and `href` once the
// sub-page exists — a card with an href becomes a link automatically.
//   { src: "/images/hero/1.png", label: "Typography", href: "/work/typography" }
//
// TOTAL_IMAGES follows this array, so adding or removing entries just works.
const HERO_IMAGES: HeroCard[] = [
  { src: "/images/hero/1.png" },
  { src: "/images/hero/2.png" },
  { src: "/images/hero/3.png" },
  { src: "/images/hero/4.png" },
  { src: "/images/hero/5.png" },
  { src: "/images/hero/6.png" },
  { src: "/images/hero/7.png" },
  { src: "/images/hero/8.png" },
  { src: "/images/hero/9.png" },
  { src: "/images/hero/10.png" },
  { src: "/images/hero/11.png" },
  { src: "/images/hero/12.png" },
];

const TOTAL_IMAGES = HERO_IMAGES.length;

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type Pose = { x: number; y: number; rotation: number; scale: number; opacity: number };
type Scatter = { x: number; y: number; rotation: number };
type Size = { width: number; height: number };

/** A card's target positions, to the extent they depend only on the container
 *  size — so they are worked out once per resize instead of twelve times per
 *  animation frame. */
type CardLayout = {
  lineX: number;
  circleX: number;
  circleY: number;
  circleRot: number;
  /** Position on the fan, before the shuffle rotation is applied. */
  arcAngle: number;
};

type ArcGeometry = {
  cardScale: number;
  arcRadius: number;
  arcCenterY: number;
  maxRotation: number;
};

type Layout = { cards: CardLayout[]; arc: ArcGeometry };

/** Before the container has been measured there is nowhere sensible to put
 *  anything — mount the cards but keep them invisible rather than blocking the
 *  render on a measurement that may arrive late. Shared, so the per-frame path
 *  allocates nothing in this case. */
const HIDDEN_POSE: Pose = { x: 0, y: 0, rotation: 0, scale: 0.6, opacity: 0 };

/** All the size-dependent geometry, computed once and memoised against the
 *  container. This used to live inside poseFor, which meant re-deriving the arc
 *  radius, spread and every card's circle position from scratch for all twelve
 *  cards on every frame, only to arrive at the same numbers as the frame
 *  before. */
function computeLayout(size: Size): Layout {
  const isMobile = size.width < 768;

  const gap = Math.min(70, (size.width - IMG_WIDTH - 32) / (TOTAL_IMAGES - 1));
  const minDimension = Math.min(size.width, size.height);
  const circleRadius = Math.min(minDimension * 0.35, 350);

  const cardScale = isMobile ? 1.4 : 1.8;
  const nominalSpread = isMobile ? 100 : 130;
  const halfSpread = ((nominalSpread / 2) * Math.PI) / 180;
  const depthBudget = size.height * (isMobile ? 0.3 : 0.36);
  const widthBudget = size.width / 2 + (isMobile ? 20 : 120);
  const arcRadius = Math.min(
    depthBudget / (1 - Math.cos(halfSpread)),
    widthBudget / Math.sin(halfSpread)
  );

  const cardWidth = IMG_WIDTH * cardScale;
  const densitySpread =
    (((TOTAL_IMAGES - 1) * cardWidth * 0.85) / arcRadius) * (180 / Math.PI);
  const spreadAngle = clamp(densitySpread, isMobile ? 60 : 70, nominalSpread);

  const startAngle = -90 - spreadAngle / 2;
  const step = spreadAngle / (TOTAL_IMAGES - 1);
  const arcApexY = -size.height * 0.08;

  const cards: CardLayout[] = [];
  for (let i = 0; i < TOTAL_IMAGES; i++) {
    const circleAngle = (i / TOTAL_IMAGES) * 360;
    const circleRad = (circleAngle * Math.PI) / 180;
    cards.push({
      lineX: (i - (TOTAL_IMAGES - 1) / 2) * gap,
      circleX: Math.cos(circleRad) * circleRadius,
      circleY: Math.sin(circleRad) * circleRadius,
      circleRot: circleAngle + 90,
      arcAngle: startAngle + i * step,
    });
  }

  return {
    cards,
    arc: {
      cardScale,
      arcRadius,
      arcCenterY: arcApexY + arcRadius,
      maxRotation: isMobile ? 9 : 12,
    },
  };
}

/** Where a card sits, given the intro progress and the scroll morph.
 *  Pure maths — no React, no springs, so it can run straight off the wheel.
 *
 *  Parallax is deliberately not an input: it is the same offset for every card,
 *  so it rides on their shared container instead of being folded in here twelve
 *  times a frame. */
function poseFor(
  layout: CardLayout,
  arc: ArcGeometry,
  scatter: Scatter,
  introT: number,
  morph: number,
  shuffle: number
): Pose {
  // scatter → line → circle
  let baseX: number, baseY: number, baseRot: number, baseScale: number, opacity: number;
  if (introT <= 1) {
    const t = clamp(introT, 0, 1);
    baseX = lerp(scatter.x, layout.lineX, t);
    baseY = lerp(scatter.y, 0, t);
    baseRot = lerp(scatter.rotation, 0, t);
    baseScale = lerp(0.6, 1, t);
    opacity = t;
  } else {
    const t = clamp(introT - 1, 0, 1);
    baseX = lerp(layout.lineX, layout.circleX, t);
    baseY = lerp(0, layout.circleY, t);
    baseRot = lerp(0, layout.circleRot, t);
    baseScale = 1;
    opacity = 1;
  }

  if (morph <= 0) {
    return { x: baseX, y: baseY, rotation: baseRot, scale: baseScale, opacity };
  }

  // --- the fanned arc ---
  const currentArcAngle = layout.arcAngle - clamp(shuffle, 0, 1) * arc.maxRotation;
  const arcRad = (currentArcAngle * Math.PI) / 180;

  return {
    x: lerp(baseX, Math.cos(arcRad) * arc.arcRadius, morph),
    y: lerp(baseY, Math.sin(arcRad) * arc.arcRadius + arc.arcCenterY, morph),
    rotation: lerp(baseRot, currentArcAngle + 90, morph),
    scale: lerp(baseScale, arc.cardScale, morph),
    opacity,
  };
}

interface FlipCardProps {
  card: HeroCard;
  index: number;
  ready: boolean;
  layout: CardLayout;
  arc: ArcGeometry;
  scatter: Scatter;
  introT: MotionValue<number>;
  morph: MotionValue<number>;
  shuffle: MotionValue<number>;
  /** False on touch, where there is no hover to flip the card with. */
  flippable: boolean;
}

// --- FlipCard ---
function FlipCard({
  card,
  index,
  ready,
  layout,
  arc,
  scatter,
  introT,
  morph,
  shuffle,
  flippable,
}: FlipCardProps) {
  const [hovered, setHovered] = useState(false);

  // One pose per frame, then five cheap reads off it. These are motion values,
  // so framer writes them straight to the element — React never re-renders.
  //
  // Parallax is no longer in this list: it is a spring, so it kept ticking
  // after the cursor stopped and re-ran all twelve poses each time it did.
  const pose = useTransform([introT, morph, shuffle], (v: number[]) =>
    ready ? poseFor(layout, arc, scatter, v[0], v[1], v[2]) : HIDDEN_POSE
  );
  const x = useTransform(pose, (p: Pose) => p.x);
  const y = useTransform(pose, (p: Pose) => p.y);
  const rotate = useTransform(pose, (p: Pose) => p.rotation);
  const scale = useTransform(pose, (p: Pose) => p.scale);
  const opacity = useTransform(pose, (p: Pose) => p.opacity);

  return (
    <motion.div
      style={{
        // The 3D context exists only to flip the card on hover. On a phone that
        // never happens, and a perspective plus preserve-3d on twelve cards —
        // each with a second nested 3D layer and a hidden back face — is a real
        // cost for something the device cannot use.
        ...(flippable
          ? { transformStyle: "preserve-3d" as const, perspective: "1000px" }
          : null),
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        x,
        y,
        rotate,
        scale,
        opacity,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group cursor-pointer"
    >
      <motion.div
        className="relative h-full w-full"
        style={flippable ? { transformStyle: "preserve-3d" } : undefined}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        // Driven by the parent's hover rather than the face's own, so an
        // overlaid link (once a card has an href) doesn't swallow the flip.
        animate={flippable ? { rotateY: hovered ? 180 : 0 } : undefined}
      >
        {/* Front */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl bg-[#e7ded2] shadow-[0_4px_14px_rgba(43,38,34,0.12)]"
          style={flippable ? { backfaceVisibility: "hidden" } : undefined}
        >
          <Image
            src={card.src}
            alt={card.label ?? `Work sample ${index + 1}`}
            fill
            // Cards top out at ~108px wide (60 * 1.8 scale), so a 160px slot
            // covers retina without pulling the full 600x800 original.
            sizes="160px"
            // Cards start scattered off-viewport; lazy loading would stall
            // their arrival, so opt out rather than preload all 12.
            loading="eager"
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[#2b2622]/10 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back — only mounted where a hover can actually reveal it. */}
        {flippable && (
        <div
          className="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[#4a423b] bg-[#2b2622] p-4 shadow-[0_4px_14px_rgba(43,38,34,0.18)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <p className="mb-1 text-[8px] font-semibold uppercase tracking-widest text-[#ff8a3d]">
              View
            </p>
            <p className="text-xs font-medium text-[#fffdfa]">{card.label ?? "Details"}</p>
          </div>
        </div>
        )}
      </motion.div>

      {/* Only a card with a destination becomes a link. Sits above both faces
          so the whole card is clickable; hover still flips via the parent. */}
      {card.href && (
        <Link
          href={card.href}
          aria-label={card.label ?? `Work sample ${index + 1}`}
          className="absolute inset-0 z-10 rounded-xl"
        />
      )}
    </motion.div>
  );
}

// --- Hero ---
export default function IntroAnimation() {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [flippable, setFlippable] = useState(false);
  // No fine pointer means no wheel to borrow — the morph is driven off the
  // page's own scroll instead. See the two effects further down.
  const [touch, setTouch] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualScroll = useMotionValue(0);
  const introT = useMotionValue(0);
  const scrollRef = useRef(0);

  // --- Reduced motion: skip the intro, park the arc, never trap the wheel ---
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => {
      setReducedMotion(mq.matches);
      setFlippable(hoverMq.matches);
      setTouch(!hoverMq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    hoverMq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      hoverMq.removeEventListener("change", apply);
    };
  }, []);

  // --- Container size ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);

    setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => observer.disconnect();
  }, []);

  // Trackpads fire wheel events far faster than the screen refreshes, and each
  // one used to drive the full twelve-card recompute synchronously inside a
  // non-passive listener. The running total is kept up to date immediately —
  // it is only an assignment, and the next event's decisions depend on it —
  // but the motion value is published once per frame, so the cards are laid
  // out at most once per paint.
  const rafRef = useRef(0);
  const setVirtual = useCallback(
    (next: number) => {
      scrollRef.current = clamp(next, 0, RELEASE_AT);
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        virtualScroll.set(scrollRef.current);
      });
    },
    [virtualScroll]
  );

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // --- Driving the morph ---
  // Two mechanisms, because the two input devices are not the same thing. A
  // wheel is a stream of deltas the page can borrow and hand back. A finger IS
  // the scroll, and taking it away costs the compositor fast path, the momentum
  // fling, and — on iOS — the remainder of the gesture, since a touchmove that
  // has been preventDefault'd will not start scrolling again until the finger
  // lifts. That is what made the phone feel like it was catching on something.

  // --- Desktop: trap the wheel, then release ---
  // While the page is at the very top we own the wheel and drive the morph.
  // Once the sequence completes we stop calling preventDefault, so the very
  // same gesture carries on into the rest of the page. Scrolling back to the
  // top re-engages and rewinds.
  useEffect(() => {
    if (reducedMotion) {
      setVirtual(RELEASE_AT);
      return;
    }
    if (touch) return; // the scroll-driven effect below owns it

    /** Takes as much of `delta` as the hero still needs and hands the rest to
     *  the page in the same gesture. Returns true if we consumed any of it.
     *
     *  Passing the remainder on is what makes the handoff seamless: clamping
     *  and swallowing the whole event meant the gesture that completed the arc
     *  scrolled the page by nothing, so it took a second scroll to move on. */
    const consume = (delta: number): boolean => {
      if (window.scrollY > 0) return false; // page has moved on; it owns the wheel
      const v = scrollRef.current;

      if (delta > 0) {
        if (v >= RELEASE_AT) return false; // fully formed — let it through
        const next = v + delta;
        setVirtual(next);
        const overflow = next - RELEASE_AT;
        if (overflow > 0) window.scrollBy(0, overflow);
        return true;
      }

      if (delta < 0) {
        if (v <= 0) return false; // fully rewound — let it through
        setVirtual(v + delta);
        return true;
      }

      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (consume(e.deltaY)) e.preventDefault();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [reducedMotion, touch, setVirtual]);

  // --- Touch: let the browser scroll, and read the morph off where it got to ---
  // The hero is simply a section twice the height of the screen with a sticky
  // panel inside it, so the spare height IS the morph's track. Nothing is
  // preventDefault'd and not one touch listener is registered, which means the
  // page scrolls on the browser's own fast path — momentum, rubber-band and all
  // — and the arc forms as part of that single flick instead of fighting it.
  useEffect(() => {
    if (reducedMotion || !touch) return;
    const wrapper = wrapperRef.current;
    const panel = containerRef.current;
    if (!wrapper || !panel) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      // How far the page scrolls before the sticky panel starts to leave.
      const travel = wrapper.offsetHeight - panel.offsetHeight;
      if (travel <= 0) return;
      const progress = clamp(-wrapper.getBoundingClientRect().top / travel, 0, 1);
      // Written straight through rather than via setVirtual: we are already
      // inside a rAF, and bouncing off a second one would put the cards a frame
      // behind the finger.
      scrollRef.current = progress * RELEASE_AT;
      virtualScroll.set(scrollRef.current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion, touch, virtualScroll]);

  // 0 → circle, 1 → arc. Mapped straight off the wheel with no spring, so the
  // cards stop the instant the scroll does.
  const morph = useTransform(virtualScroll, [0, MORPH_END], [0, 1]);
  // Arc shuffle, after the morph completes.
  const shuffle = useTransform(virtualScroll, [MORPH_END, RELEASE_AT], [0, 1]);

  // --- Mouse parallax ---
  // The one place a spring still belongs: this follows a cursor, not a scroll.
  const mouseX = useMotionValue(0);
  const parallax = useSpring(mouseX, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, reducedMotion]);

  // --- Intro sequence ---
  useEffect(() => {
    if (reducedMotion) {
      introT.set(2);
      return;
    }
    const controls = animate(introT, [0, 1, 2], {
      duration: INTRO_DURATION,
      delay: INTRO_DELAY,
      times: [0, LINE_AT_FRACTION, 1],
      // easeOut into the line so it reads as a line, then straight on into the
      // circle. No hold between the two.
      ease: ["easeOut", "easeInOut"],
    });
    return () => controls.stop();
  }, [introT, reducedMotion]);

  // Headline fades in as the circle closes, and out again as the arc forms.
  const headlineOpacity = useTransform([introT, morph], (v: number[]) => {
    const inFade = clamp((v[0] - 1.15) / 0.7, 0, 1);
    const outFade = clamp(1 - v[1] * 2.2, 0, 1);
    return inFade * outFade;
  });
  const headlineBlur = useTransform(headlineOpacity, (o: number) =>
    o >= 0.999 ? "none" : `blur(${((1 - o) * 8).toFixed(2)}px)`
  );
  const cueOpacity = useTransform(headlineOpacity, (o: number) => o * 0.85);

  const ready = containerSize.width > 0;

  // Recomputed only when the container actually changes size.
  const { cards: cardLayouts, arc } = useMemo(
    () => computeLayout(containerSize),
    [containerSize]
  );

  // Every card took the same parallax offset, scaled by the morph — so it is
  // applied once here instead of inside twelve per-frame pose calculations.
  const parallaxX = useTransform([parallax, morph], (v: number[]) => v[0] * v[1]);

  // Fixed per card, and stable across renders.
  const scatterPositions = useMemo<Scatter[]>(
    () =>
      HERO_IMAGES.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
      })),
    []
  );

  return (
    <div
      ref={wrapperRef}
      // On touch this is taller than the screen and the panel below sticks to
      // the top of it: the spare height is the scroll track the morph is read
      // from. On desktop the wheel is trapped instead, so one screen is all it
      // needs.
      //
      // svh, not vh: iOS grows and shrinks the viewport as its toolbars
      // collapse, and a hero measured in vh re-measures and re-lays-out all
      // twelve cards in the middle of a scroll. svh is the one that holds still.
      className={touch ? "relative h-[200svh] w-full" : "relative h-svh w-full"}
    >
      <div
        ref={containerRef}
        // No background colour of its own: it matched the body exactly, so it was
        // invisible on its own terms and only served to hide whatever sat behind —
        // which is now the bubble layer.
        className={
          touch
            ? "sticky top-0 h-svh w-full overflow-hidden"
            : "relative h-full w-full overflow-hidden"
        }
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          {/* Intro copy — fades out as the arc forms */}
          <div className="pointer-events-none absolute top-1/2 z-0 flex -translate-y-1/2 flex-col items-center justify-center text-center">
            <motion.h1
              style={{ opacity: headlineOpacity, filter: headlineBlur }}
              className="text-[1.6rem] font-normal tracking-tight text-[#2b2622] md:text-4xl"
            >
              See how I{" "}
              {/* Loop starts once the cards have settled into the circle. */}
              <HandDrawnCircle
                active={ready}
                delay={LOOP_DELAY}
                instant={reducedMotion}
                stroke="#b60d06"
              >
                <span className="font-medium">think</span>
              </HandDrawnCircle>
            </motion.h1>
            <motion.p
              style={{ opacity: cueOpacity }}
              className="mt-7 rounded-full bg-[rgba(182,13,6,0.07)] px-3.5 py-[6px] text-[10px] font-medium tracking-[0.2em] text-[#b60d06] md:mt-5 md:px-4 md:py-[7px] md:text-[11px]"
            >
              SCROLL TO EXPLORE
            </motion.p>

            {/* Decorative: the line above already says it. Rides the same fade as
                the cue, so it leaves with the rest of the intro copy as the arc
                forms — the nudge is only honest while there is still something
                to scroll to. */}
            <motion.div
              aria-hidden="true"
              style={{ opacity: cueOpacity }}
              className="text-[#b60d06]"
              animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Sized and weighted to survive a phone screen. At 16px and a
                  hairline stroke this was technically on the page and, at arm's
                  length, invisible. */}
              <ArrowDown size={26} strokeWidth={2} />
            </motion.div>
          </div>

          {/* Cards. The mouse parallax rides on this wrapper — one transform for
              the whole fan, rather than the same offset added to each card. */}
          <motion.div
            style={{ x: parallaxX }}
            className="relative flex h-full w-full items-center justify-center"
          >
            {HERO_IMAGES.map((card, i) => (
              <FlipCard
                key={i}
                card={card}
                index={i}
                ready={ready}
                layout={cardLayouts[i]}
                arc={arc}
                scatter={scatterPositions[i]}
                introT={introT}
                morph={morph}
                shuffle={shuffle}
                flippable={flippable}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
