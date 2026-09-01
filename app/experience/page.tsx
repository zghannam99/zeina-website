import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TrackedAnchor } from "@/components/ui/tracked-anchor";
import { CursorImageTrail } from "@/components/ui/cursor-image-trail";
import { BubbleBackground } from "@/components/ui/bubble-background";
import { RevealText } from "@/components/ui/reveal-text";
import { CountUp } from "@/components/ui/count-up";
import { FillText } from "@/components/ui/motion-fill-text";
import { NextPageReveal } from "@/components/ui/next-page-reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experience — Zeina Ghannam",
  description:
    "Six years across research, project management and strategy — field discovery, measurement frameworks, and delivery under real constraints.",
};

const TRAIL_SRCS = ["/trail/1.png", "/trail/2.png", "/trail/3.png", "/trail/4.png", "/trail/5.png", "/trail/6.png"];

const trailItems = TRAIL_SRCS.map((src) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img key={src} src={src} alt="" draggable={false} />
));

const PILL =
  "group relative h-12 w-fit overflow-hidden rounded-full p-1 ps-6 pe-14 text-sm font-medium transition-all duration-500 hover:ps-14 hover:pe-6";

export default function ExperiencePage() {
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
              text="Experience"
              className="font-serif text-[3.4rem] leading-[0.95] tracking-[-0.02em] md:text-[7rem]"
              trackClassName="text-[#e3d9cc]"
              fillClassName="text-[#2b2622]"
            />
          </h1>

          {/* Lead */}
          <div className="max-w-[820px]">
            <p className="font-serif text-[1.9rem] leading-[1.22] text-[#2b2622] md:text-[2.7rem]">
              <RevealText text="I graduated from the University of Sussex in the UK with a degree in Sociology, a degree built entirely around understanding why people actually behave the way they do, and how to prove it rather than assume it." />
            </p>
            <p className="mt-8 text-lg leading-[1.75] text-[#2b2622] md:text-xl">
              That instinct has shaped every role I&rsquo;ve had since: start with research,
              let evidence decide what&rsquo;s worth doing, then execute inside real
              constraints of time, budget, and people.
            </p>
          </div>

          {/* Six years */}
          <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-[150px_1fr] md:gap-14">
            <p className="pt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8179]">
              Over six years
            </p>
            <div className="flex max-w-[700px] flex-col">
              <p className="mb-6 text-lg leading-[1.75] text-[#2b2622] md:text-xl">
                That&rsquo;s taken different shapes.
              </p>

              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">i</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  I&rsquo;ve run field discovery that redirected program strategy toward a
                  segment that we originally weren&rsquo;t planned to serve
                </span>
              </div>
              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">ii</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  I&rsquo;ve designed measurement frameworks to prove &mdash; not assume
                  &mdash; whether an intervention actually worked
                </span>
              </div>
              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">iii</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  I&rsquo;ve caught vendor-reported data that was inflated by{" "}
                  <CountUp
                    to={3.4}
                    decimals={1}
                    suffix="×"
                    className="font-medium text-[#b60d06]"
                  />{" "}
                  before it could shape a client&rsquo;s spend decisions
                </span>
              </div>
              <div className="flex items-baseline gap-6 border-b border-[#e7ded2] py-5">
                <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">iv</span>
                <span className="text-base leading-[1.6] text-[#2b2622] md:text-lg">
                  And I&rsquo;ve managed cross-functional teams and external partners
                  &mdash; government bodies, agencies, engineers, designers &mdash;
                  delivering programs on tight budgets and timelines
                </span>
              </div>
            </div>
          </div>

          {/* Most recently */}
          <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-[150px_1fr] md:gap-14">
            <p className="pt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8179]">
              Most recently
            </p>
            <p className="max-w-[700px] text-lg leading-[1.75] text-[#2b2622] md:text-xl">
              That same approach took product form: a short-term project with{" "}
              <em className="font-serif text-xl not-italic text-[#b60d06] md:text-2xl">
                BeReal
              </em>
              , where I owned the process end-to-end &mdash; mapping the user journey,
              benchmarking competitors, and designing and prototyping a new feature,
              validated through focus group testing.
            </p>
          </div>

          {/* Thesis */}
          <div className="mt-16 border-y border-[#e7ded2] py-12 md:mt-24 md:py-14">
            <div className="mx-auto max-w-[880px] text-center font-serif text-[1.7rem] leading-[1.28] text-[#b60d06] md:text-[2.5rem]">
              <RevealText
                text="What ties it together isn't the industry — I've worked in projects from FMCG to healthcare — it's identifying what's the real problem, what's actually worth building, what should we deliberately leave out, and how will we know if it worked."
                stagger={0.07}
              />
            </div>
          </div>

          <p className="mt-16 max-w-[820px] font-serif text-[1.6rem] leading-[1.3] text-[#2b2622] md:mt-24 md:text-[2.4rem]">
            That&rsquo;s the layer product management lives in, and it&rsquo;s{" "}
            <em className="italic text-[#b60d06]">
              the part of every job I&rsquo;ve had that I&rsquo;ve cared about most.
            </em>
          </p>

          {/* CV */}
          <div className="mt-16 border-t border-[#e7ded2] pt-12 md:mt-24">
            <p className="mb-8 text-lg leading-[1.75] text-[#8a8179]">
              Full role-by-role history is in my CV.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="bare"
                className={cn(PILL, "bg-[#b60d06] text-white hover:bg-[#8a0a04]")}
              >
                <TrackedAnchor
                  href="/zeina-ghannam-cv.pdf"
                  download="Zeina-Ghannam-CV.pdf"
                  event="cv_downloaded"
                  eventProperties={{ source: "experience_page" }}
                >
                  <span className="relative z-10 transition-all duration-500">
                    Download my CV
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#b60d06] transition-all duration-500 group-hover:right-[calc(100%-44px)]"
                  >
                    <Download size={16} />
                  </span>
                </TrackedAnchor>
              </Button>

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
        </div>
      </CursorImageTrail>
      <NextPageReveal href="/projects" label="Projects" />

    </main>
  );
}
