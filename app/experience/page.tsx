import type { ReactNode } from "react";
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
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experience — Zeina Ghannam",
  description:
    "Product management with BeReal, and six years before it — 0-to-1 internal product definition, FMCG go-to-market and pricing, health program strategy, and a shipped app of my own.",
};

const TRAIL_SRCS = ["/trail/1.png", "/trail/2.png", "/trail/3.png", "/trail/4.png", "/trail/5.png", "/trail/6.png"];

const trailItems = TRAIL_SRCS.map((src) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img key={src} src={src} alt="" draggable={false} />
));

const PILL =
  "group relative h-12 w-fit overflow-hidden rounded-full p-1 ps-6 pe-14 text-sm font-medium transition-all duration-500 hover:ps-14 hover:pe-6";

/** Named as the marks themselves are. Files are 700x900 on the page cream;
 *  the square frame crops to their middle, which every logo sits well inside. */
const PROGRAMS: GalleryItem[] = [
  { image: "/experience/1.png", text: "Claude Code" },
  { image: "/experience/2.png", text: "Mixpanel" },
  { image: "/experience/3.png", text: "SQLite" },
  { image: "/experience/4.png", text: "Asana" },
  { image: "/experience/5.png", text: "Canva" },
  { image: "/experience/6.png", text: "Glide" },
  { image: "/experience/7.png", text: "Claude Design" },
  { image: "/experience/8.png", text: "Lovable" },
  { image: "/experience/9.png", text: "IBM SPSS" },
  { image: "/experience/10.png", text: "Power BI" },
];

/** The six years, as four things that happened rather than four job titles.
 *  Bodies are JSX because two of them carry a rolling figure and a link. */
const SIX_YEARS: {
  numeral: string;
  heading: string;
  body: ReactNode;
  skills: string;
}[] = [
  {
    numeral: "i",
    heading: "Owned the business side of a 0-to-1 internal product.",
    body: (
      <>
        At a financial institution, I led the business definition of a new internal B2B
        tool that replaced manual KPI collection with an automated tracker &mdash; routed
        requests, reminders, role-based access, and executive reporting for leadership and
        the board of directors. I coordinated directly with engineering and
        data-visualization teams to build it.
      </>
    ),
    skills: "0-to-1 product definition and cross-functional delivery with a technical team.",
  },
  {
    numeral: "ii",
    heading: "Advised FMCG clients on how to bring new products to market.",
    body: (
      <>
        As a consultant, I worked with fast-moving consumer goods companies on go-to-market
        and pricing strategy for product launches &mdash; setting pricing in line with
        their intended brand positioning and building competitor analyses to find where
        they could stand apart.
      </>
    ),
    skills: "Commercial strategy, competitive analysis, and pricing — the business side of product.",
  },
  {
    numeral: "iii",
    heading: "Redirected the strategy of a 4,000-user health program.",
    body: (
      <>
        In a program delivering health services to 4,000 users, my field research and needs
        assessments surfaced a user segment the strategy had missed. I proposed and drove an
        expansion of the program&rsquo;s scope to reach them, backing the decision with both
        qualitative and quantitative evidence.
      </>
    ),
    skills: "User discovery that changed direction, and evidence-based decision-making at scale.",
  },
  {
    numeral: "iv",
    heading: "Found a problem, built an app to solve it, and shipped it.",
    body: (
      <>
        People kept reordering medications they already owned &mdash; their cabinets were
        disorganized, so they couldn&rsquo;t see their own stock. I built and shipped a web
        app that makes household medication visible before someone is about to purchase the
        new medication. So far, the app has helped users avoid purchasing{" "}
        <CountUp to={90.9} decimals={1} suffix="%" className="font-medium text-[#b60d06]" />{" "}
        of the medications they considered purchasing.{" "}
        <Link
          href="/projects/find-my-meds"
          className="italic underline decoration-[#cdbfae] underline-offset-4 transition-colors hover:text-[#b60d06] hover:decoration-[#b60d06]"
        >
          (Full case study.)
        </Link>
      </>
    ),
    skills:
      "End-to-end product ownership: problem discovery, design, build, and measurable behavior change.",
  },
];

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
              <RevealText
                text="Right now, I'm working on a project with social media app BeReal, where I work as a product manager, mapping the end-to-end user journey, benchmarking BeReal against its competitors, and designing and prototyping a new feature to solve a specific problem — then validating it through focus group testing."
                accent="BeReal"
                accentClassName="text-[#b60d06]"
              />
            </p>
            <p className="mt-8 text-lg leading-[1.75] text-[#2b2622] md:text-xl">
              Before BeReal, six years across several industries gave me the foundation I
              now bring to product &mdash; discovering real problems, deciding what to
              build, and delivering it with the right teams.
            </p>
          </div>

          {/* Six years */}
          <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-[150px_1fr] md:gap-14">
            <p className="pt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8179]">
              During those six years, I:
            </p>
            <div className="flex max-w-[700px] flex-col">
              {SIX_YEARS.map((item) => (
                <div
                  key={item.numeral}
                  className="flex items-baseline gap-6 border-b border-[#e7ded2] py-7"
                >
                  <span className="w-11 flex-shrink-0 font-serif text-2xl text-[#cdbfae]">
                    {item.numeral}
                  </span>
                  <div>
                    <h3 className="text-base font-medium leading-[1.45] text-[#2b2622] md:text-lg">
                      {item.heading}
                    </h3>
                    <p className="mt-3 text-base leading-[1.6] text-[#2b2622] md:text-lg">
                      {item.body}
                    </p>
                    {/* What the story is evidence of, called out rather than left
                        for the reader to infer. */}
                    <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a8179]">
                        Skills used
                      </span>
                      <span aria-hidden="true" className="text-[#cdbfae]">
                        &rarr;
                      </span>
                      <span className="text-[15px] font-medium leading-[1.5] text-[#b60d06]">
                        {item.skills}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div className="mt-16 md:mt-24">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a8179]">
              Swipe to see the programs I use
            </p>
            {/* Drag it. The height is the only thing sizing the tiles — they
                come out at 0.53 of it — so the two steps keep them from
                swallowing a phone screen. */}
            <div className="mt-8 h-[340px] w-full md:h-[420px]">
              <CircularGallery items={PROGRAMS} />
            </div>
          </div>

          {/* CV */}
          <div className="mt-16 border-t border-[#e7ded2] pt-12 md:mt-24">
            <p className="mb-8 text-lg leading-[1.75] text-[#8a8179]">
              For more info on my experience, you can download my CV from below.
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
