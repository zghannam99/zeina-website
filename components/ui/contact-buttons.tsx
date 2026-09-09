"use client";

import * as React from "react";
import { ArrowUpRight, Download } from "lucide-react";

import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKEDIN_URL = "https://www.linkedin.com/in/zeina-ghannam/";
const EMAIL = "zoozooz89@hotmail.com";
/** Lowercase and hyphenated, like the CV already in public/. The file arrived
 *  as "Zeina-Ghannam-CV HP.docx.pdf" — a space needs escaping in a URL and the
 *  capitals only resolve on a case-insensitive filesystem, which is how the
 *  gallery images ended up 404ing in production. */
const CV_URL = "/zeina-ghannam-cv-hp.pdf";

/** The pill shape and the padding swap that slides the badge across on hover. */
const PILL =
  "group relative h-12 w-fit overflow-hidden rounded-full p-1 ps-6 pe-14 text-sm font-medium transition-all duration-500 hover:ps-14 hover:pe-6";

function SlidingBadge({
  className,
  children = <ArrowUpRight size={16} />,
  /** The arrow turns to point where it is going. A download arrow already
   *  points the right way, so it travels without spinning. */
  rotate = true,
}: {
  className?: string;
  children?: React.ReactNode;
  rotate?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute right-1 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 group-hover:right-[calc(100%-44px)]",
        rotate && "group-hover:rotate-45",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ContactButtons() {
  return (
    // Two rows: the two ways of reaching her, then the thing to take away.
    <div className="mt-10 flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="bare" className={cn(PILL, "bg-[#0a66c2] text-white hover:bg-[#004182]")}>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("contact_initiated", { method: "linkedin" })}
          >
            <span className="relative z-10 transition-all duration-500">
              Connect with me on LinkedIn
            </span>
            <SlidingBadge className="bg-white text-[#0a66c2]" />
          </a>
        </Button>

        <Button
          asChild
          size="bare"
          variant="surface"
          className={cn(PILL, "hover:bg-white")}
        >
          <a
            href={`mailto:${EMAIL}`}
            onClick={() => track("contact_initiated", { method: "email" })}
          >
            <span className="relative z-10 transition-all duration-500">Email me</span>
            <SlidingBadge className="bg-[#2b2622] text-white" />
          </a>
        </Button>
      </div>

      {/* Same accent and badge as the CV button on Experience, so the one thing
          a visitor can take away looks the same wherever they meet it. */}
      <Button
        asChild
        size="bare"
        className={cn(PILL, "bg-[#b60d06] text-white hover:bg-[#8a0a04]")}
      >
        <a
          href={CV_URL}
          download="Zeina-Ghannam-CV.pdf"
          onClick={() => track("cv_downloaded", { source: "home_contact" })}
        >
          <span className="relative z-10 transition-all duration-500">Download my CV</span>
          <SlidingBadge className="bg-white text-[#b60d06]" rotate={false}>
            <Download size={16} />
          </SlidingBadge>
        </a>
      </Button>
    </div>
  );
}
