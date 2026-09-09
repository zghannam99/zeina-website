"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";

export interface CursorImageTrailProps {
  items: React.ReactNode[];
  /** Size of each trail item in px. @default 120 */
  itemSize?: number;
  /** Max simultaneous items in the trail. @default 8 */
  trailLength?: number;
  /** Minimum cursor travel (px) before spawning a new item. @default 80 */
  spawnDistance?: number;
  /** Max random rotation applied to each item in degrees. @default 20 */
  rotationRange?: number;
  className?: string;
  children?: React.ReactNode;
}

interface TrailItem {
  id: number;
  x: number;
  y: number;
  rotation: number;
  itemIndex: number;
}

let _id = 0;
const nextId = () => ++_id;

/** The tallest art is about one and a half times as tall as it is wide, and the
 *  items are sized by width alone. Reserving that ratio for all of them means
 *  the footprint is never underestimated for the tall ones. */
const TALLEST_RATIO = 1.5;
/** Breathing room left between an image and the nearest glyph. */
const TEXT_PADDING = 8;

type Box = { left: number; top: number; right: number; bottom: number };

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/**
 * Every line box of every run of text inside `root`, in document coordinates.
 *
 * Line boxes rather than element boxes, because a paragraph's box runs the full
 * width of the column: testing elements would count every ragged line-end and
 * every gap between lines as occupied, and leave the trail almost nowhere to
 * go. A Range over each text node gives one rect per rendered line, which is
 * the actual shape of the words.
 *
 * Document coordinates so the cache survives scrolling — only a relayout can
 * invalidate it, and those are watched for.
 */
function measureTextLines(root: HTMLElement): Box[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });

  const boxes: Box[] = [];
  const range = document.createRange();
  const dx = window.scrollX;
  const dy = window.scrollY;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    range.selectNodeContents(node);
    for (const r of Array.from(range.getClientRects())) {
      if (!r.width || !r.height) continue;
      boxes.push({
        left: r.left + dx - TEXT_PADDING,
        top: r.top + dy - TEXT_PADDING,
        right: r.right + dx + TEXT_PADDING,
        bottom: r.bottom + dy + TEXT_PADDING,
      });
    }
  }
  return boxes;
}

export function CursorImageTrail({
  items,
  itemSize = 120,
  trailLength = 8,
  spawnDistance = 80,
  rotationRange = 20,
  className,
  children,
}: CursorImageTrailProps) {
  const [trail, setTrail] = React.useState<TrailItem[]>([]);
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);
  const itemCounter = React.useRef(0);
  const containerElRef = React.useRef<HTMLDivElement>(null);
  const textBoxes = React.useRef<Box[]>([]);

  // A trail needs a cursor. On touch there isn't one, so the listeners are
  // never attached rather than shipping dead handlers to phones.
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = finePointer && !reducedMotion;

  // The trail sits behind the copy, so an image that lands under a paragraph
  // does not cover it — it just turns the paper it is set on into a
  // photograph, which is the same problem from the reader's side. So the words
  // are measured once and the images keep out of them.
  React.useEffect(() => {
    if (!enabled) return;
    const el = containerElRef.current;
    if (!el) return;

    let live = true;
    const remeasure = () => {
      if (live) textBoxes.current = measureTextLines(el);
    };
    remeasure();

    // Two things move every line on the page shortly after mount: the webfonts
    // swapping in, and RevealText replacing its placeholder with the lines it
    // measured. Neither necessarily changes the container's height, so neither
    // is guaranteed to reach the observer.
    document.fonts?.ready.then(remeasure);
    const settle = window.setTimeout(remeasure, 1500);
    const observer = new ResizeObserver(remeasure);
    observer.observe(el);

    return () => {
      live = false;
      window.clearTimeout(settle);
      observer.disconnect();
    };
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled) return;
    const el = containerElRef.current;
    if (!el) return;

    const onLeave = () => setTrail([]);

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastPos.current) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < spawnDistance) return;
      }
      // Updated even when the spawn is refused below, so crossing a paragraph
      // is one test every `spawnDistance`, not one per mousemove.
      lastPos.current = { x, y };

      const halfWidth = itemSize / 2;
      const halfHeight = (itemSize * TALLEST_RATIO) / 2;
      const footprint: Box = {
        left: e.clientX + window.scrollX - halfWidth,
        right: e.clientX + window.scrollX + halfWidth,
        top: e.clientY + window.scrollY - halfHeight,
        bottom: e.clientY + window.scrollY + halfHeight,
      };
      // The whole footprint, not the cursor: an image is centred on the pointer,
      // so a cursor in clear air can still put a corner across a line.
      if (textBoxes.current.some((box) => overlaps(footprint, box))) return;

      const rotation = (Math.random() * 2 - 1) * rotationRange;
      const itemIndex = itemCounter.current % items.length;
      itemCounter.current += 1;

      setTrail((prev) =>
        [...prev, { id: nextId(), x, y, rotation, itemIndex }].slice(-trailLength)
      );
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, items.length, spawnDistance, rotationRange, trailLength, itemSize]);

  // Held rather than emptied when the trail switches off: clearing it would
  // mean writing state from an effect, and a trail that is not rendered is
  // exactly as invisible as one that is not there.
  const shown = enabled ? trail : [];
  const total = shown.length;

  return (
    <div ref={containerElRef} className={cn("relative", className)}>
      {children}

      <AnimatePresence>
        {shown.map((item, i) => {
          const age = total - 1 - i;
          const scale = 0.6 + 0.4 * (1 - age / trailLength);

          return (
            <motion.div
              key={item.id}
              className="pointer-events-none absolute select-none"
              style={{
                left: item.x,
                top: item.y,
                width: itemSize,
                x: "-50%",
                y: "-50%",
                zIndex: i,
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: item.rotation * 1.5 }}
              animate={{ opacity: 1, scale, rotate: item.rotation }}
              exit={{
                opacity: 0,
                scale: 0.3,
                rotate: item.rotation * 0.5,
                filter: "blur(4px)",
              }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="w-full [&>img]:h-auto [&>img]:w-full [&>svg]:h-auto [&>svg]:w-full">
                {items[item.itemIndex]}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default CursorImageTrail;
