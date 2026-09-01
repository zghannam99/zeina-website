import os from "node:os";
import type { NextConfig } from "next";

// Next 16 refuses cross-origin requests for dev resources — the JS chunks, the
// HMR socket — so `next dev` opened from a phone on the same network serves the
// HTML and then nothing else: no hydration, no animation, no hero cards.
// Listing this machine's own LAN addresses is what unblocks it.
//
// Derived rather than hardcoded, so it survives the router handing out a new
// lease. Dev only — `next build` and production ignore it entirely.
const lanOrigins = Object.values(os.networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter((address) => address.family === "IPv4" && !address.internal)
  .map((address) => address.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanOrigins,
};

export default nextConfig;
