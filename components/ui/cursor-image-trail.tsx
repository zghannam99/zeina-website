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

  // A trail needs a cursor. On touch there isn't one, so the listeners are
  // never attached rather than shipping dead handlers to phones.
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = finePointer && !reducedMotion;

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
      lastPos.current = { x, y };

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
  }, [enabled, items.length, spawnDistance, rotationRange, trailLength]);

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
