"use client";

import React from "react";
import Image from "next/image";

// The handset and its coiled cord are now a single edited image with a
// transparent background, trimmed to its artwork: 1998x311. The handset itself
// occupies the rightmost ~42%, so the image is sized so that works out to
// roughly half the viewport width.
const SRC = "/images/contact/phone.png";
const NATURAL_W = 1998;
const NATURAL_H = 311;

interface FlyingPhoneProps {
  /** Width of the whole image (cord included), in vw. */
  widthVw?: number;
}

export function FlyingPhone({ widthVw = 130 }: FlyingPhoneProps) {
  return (
    <div className="shrink-0" style={{ width: `${widthVw}vw` }}>
      <Image
        src={SRC}
        alt=""
        width={NATURAL_W}
        height={NATURAL_H}
        sizes={`${widthVw}vw`}
        className="block h-auto w-full max-w-none"
        priority={false}
      />
    </div>
  );
}
