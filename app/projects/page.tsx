import type { Metadata } from "next";
import Link from "next/link";

import { DriftingShapes } from "@/components/ui/drifting-shapes";
import { FillText } from "@/components/ui/motion-fill-text";
import { PhoneCarousel, type PhoneSlide } from "@/components/ui/phone-carousel";

export const metadata: Metadata = {
  title: "Projects — Zeina Ghannam",
  description: "Find My Meds, day one, and what's next.",
};

const SLIDES: PhoneSlide[] = [
  {
    name: "Find My Meds",
    status: "Completed",
    src: "/mockups/1.svg",
    alt: "Find My Meds app — Know what you have. Find it fast.",
    href: "/projects/find-my-meds",
  },
  {
    name: "day one",
    status: "In progress",
    src: "/mockups/2.svg",
    alt: "day one app — calendar screen",
    href: "/projects/day-one",
  },
  {
    name: "Next project",
    status: "Coming soon",
  },
];

export default function ProjectsPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <DriftingShapes />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-20 md:px-14 md:py-28">
        <Link
          href="/"
          className="mb-14 inline-flex items-center gap-2 text-sm text-[#8a8179] transition-colors hover:text-[#b60d06]"
        >
          <span aria-hidden="true">&larr;</span> Back
        </Link>

        <h1 className="mb-16 md:mb-24">
          <FillText
            text="Projects"
            className="font-serif text-[3.4rem] leading-[0.95] tracking-[-0.02em] md:text-[7rem]"
            trackClassName="text-[#e3d9cc]"
            fillClassName="text-[#2b2622]"
          />
        </h1>

        <PhoneCarousel slides={SLIDES} />
      </div>
    </main>
  );
}
