"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { LedgerCard, type LedgerCardData } from "@/components/ui/ledger-card";
import { useMediaQuery } from "@/lib/use-media-query";

type RowCard = LedgerCardData & {
  /** Seconds for one float cycle — staggered so the cards drift out of sync. */
  floatDuration: number;
  floatDelay: number;
};

const CARDS: RowCard[] = [
  {
    numeral: "01",
    title: "About me",
    meta: "Product management",
    href: "/about",
    photo: "/images/cards/about.png",
    floatDuration: 5.0,
    floatDelay: 0,
  },
  {
    numeral: "02",
    title: "Experience",
    meta: "Six years",
    href: "/experience",
    photo: "/images/cards/experience.png",
    floatDuration: 6.2,
    floatDelay: 0.9,
  },
  {
    numeral: "03",
    title: "Projects",
    meta: "Three projects",
    href: "/projects",
    photo: "/images/cards/projects.png",
    floatDuration: 5.5,
    floatDelay: 0.45,
  },
];

/** How far each card drifts, in px. */
const FLOAT_DISTANCE = 14;

interface LedgerCardRowProps {
  /**
   * The design spec calls for no idle motion. Kept on by default because the
   * float was asked for separately; set false for a still row.
   */
  float?: boolean;
}

export function LedgerCardRow({ float = true }: LedgerCardRowProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const noHover = useMediaQuery("(hover: none)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const scrollDriven = noHover && !reducedMotion;
  // Only the scroll-driven mode sets an active card, so a pointer coming back
  // retires the last one by derivation — clearing the state from an effect is
  // what the old version did, and it is a render nobody needed.
  const active = scrollDriven ? activeIndex : null;

  // On touch there is no hover, so a card lifts while it crosses the middle of
  // the screen — the same visual state a pointer produces.
  React.useEffect(() => {
    if (!scrollDriven) return;
    const els = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = els.indexOf(entry.target as HTMLDivElement);
          if (i === -1) continue;
          setActiveIndex((current) => {
            if (entry.isIntersecting) return i;
            return current === i ? null : current;
          });
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [scrollDriven]);

  return (
    // Generous padding and no overflow clipping anywhere above the cards, so the
    // numerals and the lifted state are never cut off.
    <section className="flex min-h-svh items-center justify-center px-6 py-14">
      {/* The spec's 20px gap sits the cards very close. Widened so each card's
          numeral and its lifted state have clear air around them — at the large
          breakpoint the numeral alone hangs ~21px past the card's left edge,
          and hover moves it another 14px. */}
      <div className="flex flex-col items-center justify-center gap-16 py-14 sm:flex-row sm:gap-[56px] lg:gap-[72px]">
        {CARDS.map(({ floatDuration, floatDelay, ...card }, idx) => {
          const isActive = active === idx;
          const isHovered = hoveredIndex === idx;
          const settled = isActive || isHovered || reducedMotion || !float;

          return (
            <motion.div
              key={card.title}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              animate={settled ? { y: 0 } : { y: [0, -FLOAT_DISTANCE, 0] }}
              transition={
                settled
                  ? { duration: 0.45, ease: "easeOut" }
                  : {
                      duration: floatDuration,
                      delay: floatDelay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            >
              <LedgerCard
                {...card}
                lifted={isActive}
                onHoverChange={(h) => setHoveredIndex(h ? idx : (c) => (c === idx ? null : c))}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
