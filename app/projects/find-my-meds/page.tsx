import type { Metadata } from "next";
import Link from "next/link";

import { DriftingShapes } from "@/components/ui/drifting-shapes";
import { FillText } from "@/components/ui/motion-fill-text";
import { PhoneFrame } from "@/components/ui/phone-frame";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { NextPageReveal } from "@/components/ui/next-page-reveal";

export const metadata: Metadata = {
  title: "Find My Meds — Zeina Ghannam",
  description:
    "A household medication inventory app that stops you from buying what you already own. Built on Glide, measured, then rebuilt on Lovable.",
};

const P = "text-base leading-[1.75] text-[#2b2622] md:text-lg";
const LEDE = "text-lg leading-[1.7] text-[#2b2622] md:text-xl";
const NOTE = "text-sm leading-[1.6] text-[#8a8179]";
const EYEBROW =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8179]";
const PULL =
  "font-serif text-[1.5rem] leading-[1.35] text-[#b60d06] md:text-[1.9rem]";

/** The logo animation — a square video, so it is not framed as a phone. */
function LogoDemo() {
  return (
    <figure className="flex flex-col items-start gap-3">
      <video
        src="/find-my-meds/find-my-meds-logo-animation.mp4"
        width={1080}
        height={1080}
        aria-label="Find My Meds logo animation"
        className="w-full max-w-[380px] rounded-2xl"
        autoPlay
        loop
        muted
        playsInline
      />
      <figcaption>
        <span className="text-[11px] font-medium tracking-[0.18em] text-[#b60d06] uppercase">
          The app
        </span>
      </figcaption>
    </figure>
  );
}

/** The stage label above each timeline section. */
function Stage({ n, label }: { n: string; label: string }) {
  return (
    <p className={EYEBROW}>
      <span className="text-[#b60d06]">{n}</span> &middot; {label}
    </p>
  );
}

/** One row of a two-column feature table. */
function Feature({ name, does, why }: { name: string; does: string; why?: string }) {
  return (
    <div className="grid gap-2 border-b border-[#e7ded2] py-5 md:grid-cols-[1fr_1.2fr] md:gap-8">
      <p className="font-medium text-[#2b2622]">{name}</p>
      <div className="flex flex-col gap-1.5">
        <p className="text-[15px] leading-[1.6] text-[#2b2622]">{does}</p>
        {why ? <p className="text-[14px] leading-[1.6] text-[#8a8179]">{why}</p> : null}
      </div>
    </div>
  );
}

/** A cut feature, or a tradeoff, with the reason for it. */
function Cut({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-[#e0d6c8] pl-5">
      <p className="mb-2 font-medium text-[#2b2622]">{title}</p>
      <p className="text-[15px] leading-[1.7] text-[#2b2622]">{body}</p>
    </div>
  );
}

/** A numbered item in the running lists. */
function Numbered({
  numeral,
  children,
}: {
  numeral: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-5 border-t border-[#e7ded2] py-4 last:border-b">
      <span className="w-8 shrink-0 font-serif text-xl text-[#cdbfae]">{numeral}</span>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

/** A single headline figure. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-[#e7ded2] pt-4">
      <span className="font-serif text-[2.4rem] leading-none text-[#b60d06] md:text-[3rem]">
        {value}
      </span>
      <span className={NOTE}>{label}</span>
    </div>
  );
}

/** A bulleted list with the site's red em-dash markers. */
function Dashes({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-baseline gap-3">
          <span aria-hidden="true" className="text-[#b60d06]">
            &mdash;
          </span>
          <span className={P}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The v2 analytics events, in the order a visit tends to produce them. */
const V2_EVENTS = [
  "Screen Viewed",
  "Search",
  "Couldn't Find",
  "Dose Logged",
  "Medicine Added",
  "Barcode Scanned",
  "Prescription Scanned",
  "Shopping Item Added",
  "Shopping Item Ordered",
  "Sent To Pharmacy",
];

const DATA: TimelineEntry[] = [
  {
    title: "Overview",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <p className={LEDE}>
          A household medication inventory app that stops you from buying what you
          already own.
        </p>

        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {[
            {
              label: "Problem",
              body: "My family kept re-buying medicine we already had at home.",
            },
            {
              label: "Role",
              body: "Product: problem definition, scoping, feature design, build, instrumentation.",
            },
            {
              label: "Timeline",
              body: "v1 built on Glide and measured. v2 rebuilt on Lovable, 19–26 November 2026.",
            },
            {
              label: "Result so far",
              body: "90.9% purchase avoidance in v1's first three weeks. v2 tracking went live on 26 November.",
            },
          ].map(({ label, body }) => (
            <div key={label} className="flex flex-col gap-1.5 border-t border-[#e7ded2] pt-4">
              <p className={EYEBROW}>{label}</p>
              <p className="text-[15px] leading-[1.6] text-[#2b2622]">{body}</p>
            </div>
          ))}
        </div>

        <p className={NOTE}>
          The case study follows the product through one full loop: discover, define,
          build, measure, learn &mdash; and build again.
        </p>

        <LogoDemo />
      </div>
    ),
  },
  {
    title: "Discover",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <Stage n="01" label="The problem" />
        <p className={LEDE}>My family kept buying medication we already had.</p>
        <p className={P}>
          The cabinet was full, but nobody knew what was in it, how much was left,
          whether it had expired, or where a specific box had ended up. Checking took
          longer than re-buying, so the default behaviour became: buy it{" "}
          <em className="not-italic font-medium">again</em>.
        </p>

        <div className="flex flex-col">
          <p className={`mb-3 ${EYEBROW}`}>That produced three costs</p>
          <Numbered numeral="i">
            <p className={P}>
              <span className="font-medium">Wasted spend</span> on duplicate purchases
            </p>
          </Numbered>
          <Numbered numeral="ii">
            <p className={P}>
              <span className="font-medium">Wasted stock</span> on medication that
              expired unnoticed at the back of the cabinet
            </p>
          </Numbered>
          <Numbered numeral="iii">
            <p className={P}>
              <span className="font-medium">Wasted appointments</span> &mdash;
              re-purchasing a medication after leaving the doctor with a prescription for
              something already sitting at home, or for a branded drug when an equivalent
              active ingredient was in the cabinet already
            </p>
          </Numbered>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <p className={EYEBROW}>Who it&rsquo;s for</p>
          <p className={P}>
            Households that manage medication for more than one person &mdash; where
            multiple people buy, multiple prescriptions are active, and no single person
            holds the full picture in their head.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Define",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <Stage n="02" label="What success means" />
        <p className={PULL}>
          The cabinet had no searchable state. Any solution had to make{" "}
          <em className="italic">checking</em> faster than{" "}
          <em className="italic">re-ordering</em>, or people would keep re-ordering.
        </p>

        <div className="flex flex-col">
          <p className={`mb-3 ${EYEBROW}`}>Four purchases the product has to prevent</p>
          <Numbered numeral="1">
            <p className={P}>Buying a medicine we already own</p>
          </Numbered>
          <Numbered numeral="2">
            <p className={P}>Buying when the same active ingredient is already at home</p>
          </Numbered>
          <Numbered numeral="3">
            <p className={P}>
              Buying when something for the same symptom is already at home
            </p>
          </Numbered>
          <Numbered numeral="4">
            <p className={P}>
              Buying straight after a doctor&rsquo;s prescription, before checking the
              cabinet
            </p>
          </Numbered>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>North Star metric — avoided purchases</p>
          <p className={P}>
            <span className="font-medium">
              The count of times someone was about to buy a medication, checked the app,
              found something at home, and recorded that they didn&rsquo;t buy.
            </span>
          </p>
          <p className={P}>
            I chose this because it&rsquo;s the only metric that contains all four
            elements of the product&rsquo;s value: purchase intent, a check, a match, and
            an averted purchase.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Build v1",
    content: (
      <div className="flex max-w-[680px] flex-col gap-12">
        <div className="flex flex-col gap-6">
          <Stage n="03" label="The Glide MVP" />
          <p className={LEDE}>
            Two screens, each mapped to one of the two moments where the problem actually
            is: <span className="font-medium">at home</span> and{" "}
            <span className="font-medium">at the doctor&rsquo;s office</span>.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className={`mb-2 ${EYEBROW}`}>Screen 1</p>
            <h3 className="font-serif text-[1.8rem] leading-none text-[#2b2622] md:text-[2.2rem]">
              My Cabinet
            </h3>
          </div>
          <p className={P}>
            A searchable inventory: search by illness or medication name, filter by type,
            exact amount left, stock-aware input that blocks logging more than is there,
            an expiry warning a month ahead, active ingredients, and a photo of where each
            medicine is stored.
          </p>
          <div className="flex flex-col items-start gap-10 pt-2">
            <PhoneFrame src="/find-my-meds/X1.mp4" caption="Searching for medication" />
            <PhoneFrame src="/find-my-meds/X2.mp4" caption="Individual medication view" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className={`mb-2 ${EYEBROW}`}>Screen 2</p>
            <h3 className="font-serif text-[1.8rem] leading-none text-[#2b2622] md:text-[2.2rem]">
              My Prescriptions
            </h3>
          </div>
          <p className={P}>
            While the doctor is writing the prescription, the user can check what&rsquo;s
            already at home &mdash; including a{" "}
            <span className="font-medium">
              different medication with the same active ingredient
            </span>
            . So they can ask on the spot{" "}
            <em className="italic">
              &ldquo;I have this at home, can it replace the medication you
              prescribed?&rdquo;
            </em>{" "}
            &mdash; and approval happens before they leave the room. Each record also
            holds the visit date, the doctor&rsquo;s name, a photo of the prescription and
            a voice recording of what the doctor said.
          </p>
          <div className="pt-2">
            <PhoneFrame src="/find-my-meds/X3.mp4" caption="My Prescriptions screen" />
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <p className={LEDE}>
            I cut 3 things. Each cut was made against the same test: &lsquo;does this
            justify the cost, at this project&rsquo;s size?&rsquo;
          </p>
          <Cut
            title="Barcode scanning — cut after research"
            body="I wanted users to scan a medication box and have quantity, expiry, and details input automatically. After testing and research, I found that pharmaceutical barcodes aren't reliably readable by phone cameras. The feature was killed at the research stage rather than after building it."
          />
          <Cut
            title="Automatic prescription reading (OCR) — cut on cost"
            body="Reading a prescription photo and extracting the medications automatically would have removed the manual entry step. The transcription capability sits behind a more expensive Glide tier. For a project of this scale, the subscription cost outweighed the time it saved."
          />
          <Cut
            title="Automatic cross-matching against inventory — cut on platform capability"
            body="Ideally the app would take a prescription and automatically find every match and every active-ingredient equivalent already in the cabinet. Glide can't support that logic. Instead, the user performs the check manually via search — slower, but it delivers the same outcome at the moment it matters."
          />
          <p className={PULL}>
            Each cut removed automation, not capability. I chose shipping a complete
            workflow with manual steps over shipping a partial workflow with elegant ones.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Measure v1",
    content: (
      <div className="flex max-w-[680px] flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Stage n="04" label="Instrumenting the MVP" />
          <p className={P}>
            Glide only emits analytics events from actions a user actively triggers
            &mdash; a button tap, an item tap, a form submission. It does not fire events
            when a screen renders, a list filters, or a search box updates. So I gave the
            North Star something to tap:
          </p>
          <Dashes
            items={[
              "Mixpanel connected through Glide's native integration",
              "Two decision buttons on the medication screen: 'I already own this — not buying' and 'I found a good replacement'",
              "One event, fired by both buttons, with a property saying which was tapped — so the headline number is one report, not two added by hand",
            ]}
          />
        </div>

        <div className="flex flex-col gap-5">
          <p className={EYEBROW}>Results — first 3 weeks</p>
          <p className={P}>
            Users logged saving a medication purchase across 10 different medications, and
            purchased only 1 new medication they didn&rsquo;t already own or have a
            replacement for.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            <Stat value="90.9%" label="Purchase avoidance rate" />
            <Stat value="74%" label="Avoided because already owned" />
            <Stat value="26%" label="Avoided by finding a replacement" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>The funnel</p>
          <div className="flex flex-col">
            {[
              { step: "1", event: "Session start" },
              { step: "2", event: "Navigation through meds" },
              { step: "3", event: "Purchase saved" },
            ].map(({ step, event }) => (
              <div
                key={step}
                className="flex items-baseline gap-5 border-t border-[#e7ded2] py-4 last:border-b"
              >
                <span className="w-8 shrink-0 font-serif text-xl text-[#cdbfae]">
                  {step}
                </span>
                <span className={P}>{event}</span>
              </div>
            ))}
          </div>

          <figure className="mt-2 flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/find-my-meds/Mixpanel.png"
              alt="Mixpanel dashboard titled Project Success, showing the North Star metric split by already owned versus found replacement, an inventory freshness chart, and the three-step funnel report."
              width={2456}
              height={1458}
              className="w-full rounded-xl border border-[#e7ded2]"
              loading="lazy"
            />
            <figcaption className="flex flex-col gap-1">
              <span className={NOTE}>
                The v1 Mixpanel dashboard &mdash; North Star, inventory freshness, and the
                funnel report.
              </span>
              <a
                href="/find-my-meds/Mixpanel.png"
                target="_blank"
                rel="noreferrer"
                className="group/full inline-flex w-fit items-center gap-1.5 text-[13px] text-[#b60d06] transition-colors hover:text-[#8a0a04]"
              >
                Open full size
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover/full:translate-x-0.5 group-hover/full:-translate-y-0.5"
                >
                  &#8599;
                </span>
              </a>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-3">
            <p className={`mt-2 ${EYEBROW}`}>What the drop-offs mean</p>
            <p className={P}>
              <span className="font-medium">1 &rarr; 2:</span> people open the app and
              don&rsquo;t look for anything. An entry-point problem &mdash; the check
              isn&rsquo;t present at the moment of need.
            </p>
            <p className={P}>
              <span className="font-medium">2 &rarr; 3:</span> people look and either find
              nothing, or find something and buy anyway. Two very different problems with
              the same signature in the data.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <p className={`mb-3 ${EYEBROW}`}>What the North Star couldn&rsquo;t see</p>
          <Numbered numeral="i">
            <p className={P}>
              It undercounts. Any prevention where someone forgot to open the app, or
              opened it and skipped the button, is invisible.
            </p>
          </Numbered>
          <Numbered numeral="ii">
            <p className={P}>
              It weights everything equally. A cheap box of painkillers and an expensive
              chronic medication are one event each.
            </p>
          </Numbered>
        </div>
      </div>
    ),
  },
  {
    title: "Learn",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <Stage n="05" label="Why I rebuilt it" />
        <p className={LEDE}>
          v1 worked. But the numbers and the cuts pointed at the same ceiling: the
          platform, not the people using it.
        </p>
        <div className="flex flex-col">
          <Numbered numeral="i">
            <p className="font-medium text-[#2b2622]">Manual entry was the biggest risk.</p>
            <p className={P}>
              I flagged inventory decay at launch as the failure mode to watch first. Every
              box typed in by hand is a reason for the cabinet to go stale &mdash; and a
              stale cabinet produces confidently wrong answers.
            </p>
          </Numbered>
          <Numbered numeral="ii">
            <p className="font-medium text-[#2b2622]">All three cuts were platform limits.</p>
            <p className={P}>
              A pricing tier, camera reliability and missing logic &mdash; not things the
              household didn&rsquo;t need.
            </p>
          </Numbered>
          <Numbered numeral="iii">
            <p className="font-medium text-[#2b2622]">The metric couldn&rsquo;t weigh savings.</p>
            <p className={P}>
              There were no prices in the app, so the North Star couldn&rsquo;t tell a
              painkiller from a chronic medication.
            </p>
          </Numbered>
          <Numbered numeral="iv">
            <p className="font-medium text-[#2b2622]">
              &ldquo;Couldn&rsquo;t find it&rdquo; went nowhere.
            </p>
            <p className={P}>
              A failed search is a signal that something needs buying, and v1 had no path
              from that signal to the pharmacy.
            </p>
          </Numbered>
        </div>
        <p className={PULL}>
          So I rebuilt it from scratch on Lovable rather than upgrading Glide &mdash; with
          one goal above the rest: less manual entry than v1.
        </p>
      </div>
    ),
  },
  {
    title: "Build v2",
    content: (
      <div className="flex max-w-[680px] flex-col gap-12">
        <div className="flex flex-col gap-6">
          <Stage n="06" label="The Lovable rebuild" />
          <p className={LEDE}>
            Built in one week as a series of small, scoped changes, each shipped with
            tests. Every v2 feature traces back to something v1 taught me.
          </p>
          <div className="flex flex-col border-t border-[#e7ded2]">
            <Feature
              name="+ Add: scan, photograph, or type"
              does="Scan the barcode, take one photo of the box, or type with live suggestions. Matches come from our cabinet first, then a lookup-only catalogue of 27,617 Egyptian medicines, and pre-fill the form."
              why="v1 lesson: manual entry decays the cabinet."
            />
            <Feature
              name="Barcodes that earn trust"
              does="Barcodes pre-filled from open data stay 'unconfirmed' until a family member confirms them. A photo of the box is the fallback when a barcode won't read."
              why="v1 lesson: phone cameras and pharmaceutical barcodes aren't reliable on their own."
            />
            <Feature
              name="Prescription reading"
              does="Photograph a prescription — printed or handwritten, Arabic or English — and one call to the cheapest vision model reads it. Capped at 10 scans per person per day."
              why="v1 lesson: OCR was cut on cost."
            />
            <Feature
              name="Cabinet matching"
              does="Each medicine on the prescription comes back as: we have it, possible replacement (same active ingredient), similar use, expired or empty, or not in the cabinet. Matching runs in my own tested code; the cabinet list is never sent to the AI."
              why="v1 lesson: Glide couldn't support the logic."
            />
            <Feature
              name="Prices on every medicine"
              does="Price is required when a medicine is added, so savings can be counted per dose."
              why="v1 lesson: the North Star weighted every medicine equally."
            />
            <Feature
              name="Shared shopping list"
              does="One live list for the household. Expired, run-out and couldn't-find medicines are added automatically. 'Send to pharmacy' opens WhatsApp with the order written out and marks those items as ordered."
              why="v1 lesson: a failed search had nowhere to go."
            />
          </div>
          <p className={NOTE}>
            Also new: Arabic medicine names in search, similar medicines by active
            ingredient, a same-day paracetamol warning, and a small admin area for
            approving family accounts.
          </p>
        </div>

        {/* v2 screen recordings go here, stacked like the v1 ones:
            <PhoneFrame src="/find-my-meds/v2-add.mp4" caption="Adding a box by barcode" /> */}

        <div className="flex flex-col gap-7">
          <p className={EYEBROW}>Tradeoffs this time</p>
          <Cut
            title="No WhatsApp API — a free link instead"
            body="The pharmacy order opens WhatsApp through a wa.me link rather than a paid API. The app can't confirm the message was actually sent, so it records 'opened WhatsApp', not 'sent'."
          />
          <Cut
            title="The catalogue is lookup-only"
            body="27,617 medicines are there to pre-fill forms, never to appear in search. Find only ever shows what is actually in the cabinet."
          />
          <Cut
            title="Health data stays out of analytics"
            body="No doctor names, illnesses or prescription contents are sent to Mixpanel. Prescription scans report counts only."
          />
        </div>
      </div>
    ),
  },
  {
    title: "Measure v2",
    content: (
      <div className="flex max-w-[680px] flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Stage n="07" label="Launch and measurement" />
          <p className={P}>
            Owning the code removed v1&rsquo;s tap-only limit. Ten events now cover the
            whole loop &mdash; search, find, add, prescription, re-order:
          </p>
          <ul className="flex flex-wrap gap-2">
            {V2_EVENTS.map((event) => (
              <li
                key={event}
                className="rounded-md border border-[#e7ded2] px-3 py-1.5 text-[13px] text-[#2b2622]"
              >
                {event}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>Money saved, measured per dose</p>
          <p className={P}>
            <span className="font-medium">
              Box price &times; amount taken &divide; box size.
            </span>{" "}
            This answers v1&rsquo;s second limitation. The first version counted the full
            box price on every dose; I caught it in review and fixed it before any numbers
            were reported.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>Results</p>
          <p className={P}>
            v2 tracking went live on 26 November 2026. Results, and a comparison with
            v1&rsquo;s baseline, will be added here after the first few weeks.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>What this data can and cannot prove</p>
          <p className={P}>
            <span className="font-medium">
              Not measurable from app data: actual purchases prevented.
            </span>{" "}
            Find My Meds never sees a pharmacy transaction, a receipt, or a card charge.
            Every prevention is self-reported, and money saved is estimated from list
            prices, not what we paid.
          </p>
          <p className={P}>
            <span className="font-medium">The closest approach</span> is to reconcile
            self-reported preventions monthly against our real pharmacy order history. If
            an avoided purchase doesn&rsquo;t reappear in orders over the following 30
            days, it moves from <em className="italic">self-reported</em> to{" "}
            <em className="italic">confirmed</em>. The gap between those two numbers is the
            honest measure of how much to trust the headline.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Next",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <Stage n="08" label="In the pipeline" />
        <div className="flex flex-col gap-4">
          <p className="font-medium text-[#2b2622]">Guardrail metrics</p>
          <p className={P}>
            The gap I most want to close. If the app says a medication is home and it
            isn&rsquo;t, or it&rsquo;s expired, that still registers as a success. The fix
            is a response on every match &mdash;{" "}
            <em className="italic">couldn&rsquo;t find it / it was expired</em> &mdash;
            giving two metrics:
          </p>
          <Dashes
            items={[
              <>
                <span className="font-medium">False positive rate</span> &mdash; how often
                a match fails on contact with the actual cabinet
              </>,
              <>
                <span className="font-medium">Expired-match incidents</span> &mdash; the
                app presenting an expired medication as valid stock. For a medication app
                this is the closest thing to a safety issue.
              </>,
            ]}
          />
        </div>
      </div>
    ),
  },
];

export default function FindMyMedsPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <DriftingShapes />

      <div className="relative z-10">
        <div className="mx-auto max-w-[1100px] px-6 pt-20 md:px-14 md:pt-28">
          <Link
            href="/projects"
            className="mb-14 inline-flex items-center gap-2 text-sm text-[#8a8179] transition-colors hover:text-[#b60d06]"
          >
            <span aria-hidden="true">&larr;</span> Projects
          </Link>

          <h1 className="mb-8">
            <FillText
              text="Find My Meds"
              className="font-serif text-[2.8rem] leading-[0.98] tracking-[-0.02em] md:text-[6rem]"
              trackClassName="text-[#e3d9cc]"
              fillClassName="text-[#2b2622]"
            />
          </h1>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/find-my-meds/cover.jpg"
            alt="Find My Meds"
            className="mt-10 aspect-[2019/1160] w-full rounded-[20px] object-cover"
          />
        </div>

        <Timeline data={DATA} />

        <div className="mx-auto max-w-[1100px] px-6 pb-24 md:px-14">
          <div className="border-t border-[#e7ded2] pt-10">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-lg text-[#2b2622] transition-colors hover:text-[#b60d06]"
            >
              <span aria-hidden="true">&larr;</span> Back to projects
            </Link>
          </div>
        </div>
      </div>

      <NextPageReveal href="/projects/day-one" label="day one" />
    </main>
  );
}
