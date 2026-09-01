"use client";

import * as React from "react";
import Link from "next/link";

import { track } from "@/lib/analytics";

export type LedgerCardData = {
  /** "01", "02", "03" — decorative, hangs outside the card's corner. */
  numeral: string;
  title: string;
  /** Small uppercase mono metadata, bottom-left of the card. */
  meta: string;
  href: string;
  /** Optional photo. Without one the placeholder tone shows. */
  photo?: string;
  photoAlt?: string;
};

interface LedgerCardProps extends LedgerCardData {
  /** Applies the hover visual without a pointer — used for touch. */
  lifted?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

// Exact values from the design. `--s` scales the whole card proportionally at
// larger breakpoints; the hover translate is deliberately NOT scaled, since the
// design specifies it per breakpoint.
const ACCENT = "oklch(0.45 0.17 28)";
const BONE = "oklch(0.99 0.006 80)";
const INK = "oklch(0.24 0.01 60)";
const META = "oklch(0.5 0.01 60)";
const PLACEHOLDER = "oklch(0.93 0.012 72)";

export function LedgerCard({
  numeral,
  title,
  meta,
  href,
  photo,
  photoAlt,
  lifted = false,
  onHoverChange,
}: LedgerCardProps) {
  return (
    <div
      className="relative [--s:1] sm:[--s:1.32] lg:[--s:1.48]"
      style={{
        width: "calc(152px * var(--s))",
        height: "calc(276px * var(--s))",
      }}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {/* 1 — Sleeve: static, behind, peeks from the lower-left. Never a hover
             target: the opaque card covers it, so a hover here could not fire. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          transform: "skewY(-9deg) translate(-7px, 7px)",
          background: ACCENT,
          borderRadius: "8px",
        }}
      />

      {/* 2 — Card: the only thing that moves, and the only hit target. */}
      <Link
        href={href}
        onClick={() => track("home_card_clicked", { destination: href, title })}
        data-lifted={lifted ? "true" : undefined}
        className="ledger-card absolute inset-0 flex flex-col outline-none"
        style={{
          background: BONE,
          border: `1px solid oklch(0.24 0.01 60 / 0.12)`,
          borderRadius: "8px",
          padding: "calc(14px * var(--s)) calc(14px * var(--s)) calc(16px * var(--s))",
          boxSizing: "border-box",
          gap: "calc(10px * var(--s))",
        }}
      >
        {/* Photo */}
        <div
          style={{
            flex: "0 0 calc(128px * var(--s))",
            borderRadius: "calc(5px * var(--s))",
            overflow: "hidden",
            background: PLACEHOLDER,
          }}
        >
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={photoAlt ?? ""}
              className="h-full w-full"
              style={{ objectFit: "cover" }}
            />
          )}
        </div>

        {/* Text */}
        <div
          className="flex flex-col justify-end"
          style={{ flex: "1 1 auto", minHeight: 0, gap: "calc(8px * var(--s))" }}
        >
          <span
            style={{
              fontFamily: "var(--font-outfit), system-ui, sans-serif",
              fontSize: "calc(21px * var(--s))",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: INK,
            }}
          >
            {title}
          </span>

          <div style={{ height: "1px", background: "oklch(0.24 0.01 60 / 0.14)" }} />

          <div className="flex items-center justify-between" style={{ gap: "8px" }}>
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap uppercase"
              style={{
                fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
                fontSize: "calc(9.5px * var(--s))",
                letterSpacing: "0.08em",
                color: META,
              }}
            >
              {meta}
            </span>
            <span
              aria-hidden="true"
              style={{
                fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
                fontSize: "calc(12px * var(--s))",
                color: ACCENT,
                lineHeight: 1,
              }}
            >
              ↗
            </span>
          </div>
        </div>
      </Link>

      {/* 3 — Numeral: in front, hanging outside the top-left corner. Decorative. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute select-none"
        style={{
          left: "calc(-14px * var(--s))",
          top: "calc(-26px * var(--s))",
          fontFamily: "var(--font-outfit), system-ui, sans-serif",
          fontSize: "calc(62px * var(--s))",
          fontWeight: 600,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `1.5px ${ACCENT}`,
        }}
      >
        {numeral}
      </span>
    </div>
  );
}
