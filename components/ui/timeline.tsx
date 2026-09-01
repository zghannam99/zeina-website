"use client";

import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  heading?: React.ReactNode;
  intro?: React.ReactNode;
}

/** How far the line travels, in px, while a title fills from pale to red. */
const FILL_SPAN = 140;

/**
 * A title that fills red left-to-right as the progress line reaches it.
 *
 * Both the line's tip (progress * height) and the section's offset are measured
 * in the same coordinate space — the timeline container — so the fill starts
 * exactly when the line arrives at that section rather than on a guess.
 */
function TimelineTitle({
  title,
  offset,
  height,
  progress,
  className,
}: {
  title: string;
  offset: number;
  height: number;
  progress: MotionValue<number>;
  className?: string;
}) {
  const fill = useTransform(progress, (p) => {
    if (!height) return 0;
    return Math.min(1, Math.max(0, (p * height - offset) / FILL_SPAN));
  });
  const clipPath = useTransform(fill, (f) => `inset(0 ${((1 - f) * 100).toFixed(2)}% 0 0)`);

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <span aria-hidden="true" className="text-[#cdbfae]">
        {title}
      </span>
      {/* Must wrap exactly as the pale copy does — anything that changes line
          breaking here (nowrap, a different width) makes the two copies
          disagree and the overlap shows as doubled letters. */}
      <motion.span style={{ clipPath }} className="absolute inset-0 text-[#b60d06]">
        {title}
      </motion.span>
    </span>
  );
}

export const Timeline = ({ data, heading, intro }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState(0);
  const [offsets, setOffsets] = useState<number[]>([]);

  // The original measured height once on mount. Sections here contain animated
  // WebP that loads after mount, so the height was read before the media took up
  // space and the progress line stopped short. Observing keeps both the height
  // and each section's offset right through media load, font swap and resize.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      setHeight(el.getBoundingClientRect().height);
      const top = el.getBoundingClientRect().top;
      setOffsets(
        itemRefs.current.map((item) =>
          item ? item.getBoundingClientRect().top - top : 0
        )
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [data.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full font-sans md:px-10" ref={containerRef}>
      {(heading || intro) && (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-10">
          {heading}
          {intro}
        </div>
      )}

      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div
            key={item.title}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="flex justify-start pt-10 md:gap-10 md:pt-40"
          >
            <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f3ee] md:left-3">
                <div className="h-4 w-4 rounded-full border border-[#e0d6c8] bg-[#efe8df] p-2" />
              </div>
              <h3 className="hidden font-serif md:block md:pl-20 md:text-5xl">
                <TimelineTitle
                  title={item.title}
                  offset={offsets[index] ?? 0}
                  height={height}
                  progress={scrollYProgress}
                />
              </h3>
            </div>

            <div className="relative w-full pr-4 pl-20 md:pl-4">
              <h3 className="mb-4 block text-left font-serif text-3xl md:hidden">
                <TimelineTitle
                  title={item.title}
                  offset={offsets[index] ?? 0}
                  height={height}
                  progress={scrollYProgress}
                />
              </h3>
              {/* `content` is authored in a server component and arrives here as
                  a lazy reference. React cannot key-check a lazy when the JSX is
                  created (isValidElement is false for one), so it defers to
                  reconcile time — where this sits in a two-child array beside the
                  <h3> and gets flagged as an unkeyed list child. Giving it a
                  keyed Fragment satisfies that without adding a DOM node. */}
              <React.Fragment key={`${item.title}-content`}>{item.content}</React.Fragment>
            </div>
          </div>
        ))}

        <div
          style={{ height: height + "px" }}
          className="absolute top-0 left-8 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-[#e0d6c8] to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-[#b60d06] via-[#e24a2b] to-transparent from-[0%] via-[10%]"
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
