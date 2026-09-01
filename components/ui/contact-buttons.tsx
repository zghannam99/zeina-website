"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKEDIN_URL = "https://www.linkedin.com/in/zeina-ghannam/";
const EMAIL = "zoozooz89@hotmail.com";

/** The pill shape and the padding swap that slides the badge across on hover. */
const PILL =
  "group relative h-12 w-fit overflow-hidden rounded-full p-1 ps-6 pe-14 text-sm font-medium transition-all duration-500 hover:ps-14 hover:pe-6";

function SlidingBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute right-1 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45",
        className
      )}
    >
      <ArrowUpRight size={16} />
    </span>
  );
}

export function ContactButtons() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
  );
}
