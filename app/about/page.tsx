import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CursorImageTrail } from "@/components/ui/cursor-image-trail";
import { BubbleBackground } from "@/components/ui/bubble-background";
import { RevealText } from "@/components/ui/reveal-text";
import { CountUp } from "@/components/ui/count-up";
import { FillText } from "@/components/ui/motion-fill-text";
import { NextPageReveal } from "@/components/ui/next-page-reveal";

export const metadata: Metadata = {
  title: "About — Zeina Ghannam",
  description:
    "Business management consultant transitioning into product management. Research, strategy, and deciding what's worth building.",
};

// Illustrations that follow the cursor. Sourced from public/trail/, with their
// white backgrounds flood-filled away so they read as objects, not cards.
const TRAIL_SRCS = ["/trail/1.png", "/trail/2.png", "/trail/3.png", "/trail/4.png", "/trail/5.png", "/trail/6.png"];

const trailItems = TRAIL_SRCS.map((src) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img key={src} src={src} alt="" draggable={false} />
));

export default function AboutPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <BubbleBackground interactive />

      <CursorImageTrail items={trailItems} itemSize={75} trailLength={10} spawnDistance={48}>
        <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-20 md:px-14 md:py-28">
          <Link
            href="/"
            className="mb-14 inline-flex items-center gap-2 text-sm text-[#8a8179] transition-colors hover:text-[#b60d06]"
          >
            <span aria-hidden="true">&larr;</span> Back
          </Link>

          {/* Page title — fills left to right on load */}
          <h1 className="mb-14 md:mb-20">
            <FillText
              text="About Me"
              className="font-serif text-[3.4rem] leading-[0.95] tracking-[-0.02em] md:text-[7rem]"
              trackClassName="text-[#e3d9cc]"
              fillClassName="text-[#2b2622]"
            />
          </h1>

          {/* Header */}
          <div className="max-w-[920px]">
            <p className="mb-4 font-serif text-2xl italic text-[#b60d06] md:text-3xl">
              Hi, I&rsquo;m Zeina.
            </p>
            <h2 className="font-serif text-[2.6rem] leading-[1.04] tracking-[-0.015em] text-[#2b2622] md:text-[4.6rem]">
              <RevealText text="A business management consultant transitioning into product management." />
            </h2>
          </div>

          {/* Now */}
          <div className="mt-16 max-w-[700px] md:mt-24">
            <p className="mb-7 text-lg leading-[1.75] text-[#2b2622] md:text-xl">
              Right now, I&rsquo;m working on a project with social media app{" "}
              <em className="font-serif text-xl not-italic text-[#b60d06] md:text-2xl">
                BeReal
              </em>
              , where I&rsquo;m mapping the end-to-end user journey, benchmarking BeReal
              against its competitors, and designing and prototyping a new feature to solve
              a specific problem &mdash; then validating it through focus group testing.
            </p>
            <p className="text-lg leading-[1.75] text-[#2b2622] md:text-xl">
              Prior to that, I spent six years in roles spanning research, project
              management, and strategy.
            </p>
          </div>

          {/* Pull quote */}
          <div className="mt-16 border-y border-[#e7ded2] py-12 md:mt-24 md:py-14">
            <div className="mx-auto max-w-[880px] text-center font-serif text-[1.7rem] leading-[1.28] text-[#b60d06] md:text-[2.5rem]">
              <RevealText
                text="The common thread has been the same: find the real problem through research, decide what's worth doing, and deliver it under real constraints."
                stagger={0.07}
              />
            </div>
          </div>

          {/* In practice */}
          <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-[150px_1fr] md:gap-14">
            <p className="pt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8179]">
              In practice
            </p>
            <div className="flex max-w-[700px] flex-col">
              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">i</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  Field discovery that redirected a program&rsquo;s strategy toward a segment
                  that wasn&rsquo;t being served
                </span>
              </div>
              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">ii</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  Measurement frameworks to prove whether an intervention actually worked
                </span>
              </div>
              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">iii</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  Vendor data verified and found to be off by{" "}
                  <CountUp
                    to={3.4}
                    decimals={1}
                    suffix="×"
                    className="font-medium text-[#b60d06]"
                  />
                </span>
              </div>
              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">iv</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  Built and shipped a medication inventory app of my own that helped
                  users avoid purchasing{" "}
                  <CountUp
                    to={90.9}
                    decimals={1}
                    suffix="%"
                    className="font-medium text-[#b60d06]"
                  />{" "}
                  of the medications they considered purchasing.
                </span>
              </div>
            </div>
          </div>

          {/* Close */}
          <p className="mt-16 max-w-[820px] font-serif text-[1.6rem] leading-[1.3] text-[#2b2622] md:mt-24 md:text-[2.4rem]">
            I care most about the decisions upstream of execution &mdash;{" "}
            <em className="italic text-[#b60d06]">
              what to build, what to leave out, and how you&rsquo;ll know if it worked.
            </em>
          </p>

          <div className="mt-16 border-t border-[#e7ded2] pt-10">
            <Link
              href="/#contact"
              className="group inline-flex items-center gap-2 text-lg text-[#2b2622] transition-colors hover:text-[#b60d06]"
            >
              Get in touch
              <ArrowUpRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>
        </div>
      </CursorImageTrail>
      <NextPageReveal href="/experience" label="Experience" />

    </main>
  );
}
