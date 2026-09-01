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
    "A household medication inventory app that stops you from buying what you already own. Built on Glide.",
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

/** One row of the My Cabinet feature table. */
function Feature({ name, does, why }: { name: string; does: string; why: string }) {
  return (
    <div className="grid gap-2 border-b border-[#e7ded2] py-5 md:grid-cols-[1fr_1.2fr] md:gap-8">
      <p className="font-medium text-[#2b2622]">{name}</p>
      <div className="flex flex-col gap-1.5">
        <p className="text-[15px] leading-[1.6] text-[#2b2622]">{does}</p>
        <p className="text-[14px] leading-[1.6] text-[#8a8179]">{why}</p>
      </div>
    </div>
  );
}

/** A cut feature, with the reason it was cut. */
function Cut({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-[#e0d6c8] pl-5">
      <p className="mb-2 font-medium text-[#2b2622]">{title}</p>
      <p className="text-[15px] leading-[1.7] text-[#2b2622]">{body}</p>
    </div>
  );
}

/** A numbered item in the running costs / pipeline lists. */
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

const DATA: TimelineEntry[] = [
  {
    title: "Overview",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <p className={LEDE}>
          A household medication inventory app that stops you from buying what you
          already own.
        </p>
        <p className={NOTE}>
          Built on Glide · Role: Product (problem definition, scoping, feature design,
          build, instrumentation)
        </p>
        <LogoDemo />
      </div>
    ),
  },
  {
    title: "The problem",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
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

        <p className={PULL}>
          The underlying issue was that the cabinet had no searchable state. Any solution
          had to make <em className="italic">checking</em> faster than{" "}
          <em className="italic">re-ordering</em>, or people would keep re-ordering.
        </p>
      </div>
    ),
  },
  {
    title: "Who it's for",
    content: (
      <div className="max-w-[680px]">
        <p className={LEDE}>
          Households that manage medication for more than one person &mdash; where
          multiple people buy, multiple prescriptions are active, and no single person
          holds the full picture in their head.
        </p>
      </div>
    ),
  },
  {
    title: "The solution",
    content: (
      <div className="flex max-w-[680px] flex-col gap-12">
        <p className={LEDE}>
          Two screens, each mapped to one of the two moments where the problem actually
          is: <span className="font-medium">at home</span> and{" "}
          <span className="font-medium">at the doctor&rsquo;s office</span>.
        </p>

        {/* Screen 1 */}
        <div className="flex flex-col gap-6">
          <div>
            <p className={`mb-2 ${EYEBROW}`}>Screen 1</p>
            <h3 className="font-serif text-[1.8rem] leading-none text-[#2b2622] md:text-[2.2rem]">
              My Cabinet
            </h3>
            <p className={`mt-3 ${P}`}>The searchable inventory.</p>
          </div>

          <div className="flex flex-col">
            <Feature
              name="Search by illness or medication name"
              does="Finds medication whether the user knows the drug name or only the symptom"
              why="Users often think in symptoms (sore throat), not brand names"
            />
            <Feature
              name="Filter by medication type"
              does="Narrows by category — antibiotic, antihistamine, etc."
              why="Supports browsing when the user doesn't know what they're looking for"
            />
            <Feature
              name="Remaining quantity"
              does="Shows exact pills / sachets / servings left"
              why="A user may know they own something without knowing whether there's enough left to matter"
            />
            <Feature
              name="Stock-aware input validation"
              does="Blocks entry of a quantity higher than stock, with a 'not enough stock' message"
              why="Prevents the inventory drifting out of sync with reality — the failure that kills every tracking tool"
            />
            <Feature
              name="Expiry date + 30-day warning"
              does="Displays expiry, and pops an 'expiration date nearing' alert within a month"
              why="Turns expiry from a discovery into a prompt, while the medication is still usable"
            />
            <Feature
              name="Location photo"
              does="A picture of where the medication is stored"
              why="Knowing you own it isn't enough if you still can't find it"
            />
            <Feature
              name="Active ingredients"
              does="Lists the ingredients behind the brand name"
              why="Enables substitution reasoning (see Screen 2)"
            />
            <Feature
              name="Add new medication"
              does="Users log new purchases as they come in"
              why="Without a low-friction input path, the inventory decays"
            />
          </div>

          <div className="flex flex-wrap gap-10 pt-2">
            <PhoneFrame
              src="/find-my-meds/X1.mp4"
              caption="Searching for medication"
            />
            <PhoneFrame
              src="/find-my-meds/X2.mp4"
              caption="Individual medication view"
            />
          </div>
        </div>

        {/* Screen 2 */}
        <div className="flex flex-col gap-6">
          <div>
            <p className={`mb-2 ${EYEBROW}`}>Screen 2</p>
            <h3 className="font-serif text-[1.8rem] leading-none text-[#2b2622] md:text-[2.2rem]">
              My Prescriptions
            </h3>
            <p className={`mt-3 ${P}`}>
              Built for when the user is at the doctor&rsquo;s office.
            </p>
          </div>

          <p className={P}>
            While the doctor is writing the prescription, the user can check what&rsquo;s
            already at home &mdash; including whether they hold a{" "}
            <span className="font-medium">
              different medication with the same active ingredient
            </span>
            . So the user can ask the doctor on the spot{" "}
            <em className="italic">
              &ldquo;I have this at home, can it replace the medication you
              prescribed?&rdquo;
            </em>{" "}
            &mdash; and approval happens before the user leaves the room.
          </p>

          <div className="flex flex-col">
            <p className={`mb-3 ${EYEBROW}`}>Each prescription record also holds</p>
            <ul className="flex flex-col gap-2">
              {[
                "Date of visit",
                "Doctor's name",
                "A photo of the prescription",
                "A voice recording of what the doctor said, for later reference",
              ].map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <span aria-hidden="true" className="text-[#b60d06]">
                    &mdash;
                  </span>
                  <span className={P}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className={P}>
            The recording exists because consultations are dense and verbal &mdash;
            dosage adjustments, warnings, and follow-up instructions sometimes get lost.
          </p>

          <div className="pt-2">
            <PhoneFrame
              src="/find-my-meds/X3.mp4"
              caption="My Prescriptions screen"
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Tradeoffs and constraints",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <p className={LEDE}>
          I cut 3 things. Each cut was made against the same test: &lsquo;does this
          justify the cost, at this project&rsquo;s size?&rsquo;
        </p>

        <div className="flex flex-col gap-7">
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
            body="Ideally the app would take a prescription and automatically find every match and every active-ingredient equivalent already in the cabinet. Glide can't currently support that logic. Instead, the user performs the check manually via search — slower, but it delivers the same outcome at the moment it matters."
          />
        </div>

        <p className={PULL}>
          Each cut removed automation, not capability. Every job the app was built to do
          still gets done &mdash; the user just does one more tap. I chose shipping a
          complete workflow with manual steps over shipping a partial workflow with
          elegant ones.
        </p>
      </div>
    ),
  },
  {
    title: "Measuring it",
    content: (
      <div className="flex max-w-[680px] flex-col gap-10">
        <p className={LEDE}>
          When the app shipped, I listed four things I wanted to measure: duplicate
          purchases avoided, whether expiry warnings changed behaviour, inventory accuracy
          over time, and how often the prescriptions screen changed what the doctor wrote.
        </p>
        <p className={P}>
          This section is what happened when I went to actually build them. Two of the
          four are now instrumented. The other two are scoped and not yet built.
        </p>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>The constraint that shaped everything</p>
          <p className={P}>
            Glide only emits analytics events from actions a user actively triggers
            &mdash; a button tap, an item tap, a form submission. It does not fire events
            when a screen renders, a list filters, or a search box updates.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>What I built</p>
          <ul className="flex flex-col gap-2">
            {[
              "Mixpanel connected to the app through Glide's native integration",
              "Two decision buttons on the medication result screen: 'I already own this — not buying' and 'I found a good replacement'",
              "One event, fired by both buttons, with a property distinguishing which was tapped",
            ].map((item) => (
              <li key={item} className="flex items-baseline gap-3">
                <span aria-hidden="true" className="text-[#b60d06]">
                  &mdash;
                </span>
                <span className={P}>{item}</span>
              </li>
            ))}
          </ul>
          <p className={P}>
            One design decision worth calling out: I sent both buttons as a{" "}
            <em className="italic">single</em> event with a differentiating property,
            rather than two separate events. Two events would mean building every report
            twice and adding them by hand to get one headline number.
          </p>
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

          <div className="flex flex-col">
            <p className={`mb-3 ${EYEBROW}`}>Its limitations</p>
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

        <div className="flex flex-col gap-5">
          <p className={EYEBROW}>Progress update — first 3 weeks</p>
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
          <p className={P}>
            A beginner funnel has been created for now, with plans to improve it
            consistently. Three steps in Mixpanel, built to show not just how often the
            product succeeds but where it fails.
          </p>

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
                The Mixpanel dashboard &mdash; North Star, inventory freshness, and the
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
              the same signature in the data, which is the main gap I want to close next.
            </p>
          </div>

          <p className={PULL}>
            The funnel&rsquo;s most useful output so far has been showing me what I still
            can&rsquo;t see.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>Inventory maintenance</p>
          <p className={P}>
            <span className="font-medium">
              How often, and by whom, medications get added.
            </span>
          </p>
          <p className={P}>
            This is the precondition metric. I flagged inventory decay at launch as the
            failure mode I&rsquo;d watch first, and it&rsquo;s the one thing that makes
            every other number untrustworthy if it slips: a stale cabinet produces
            confidently wrong answers, and the app tells you that you own something that
            isn&rsquo;t there. Tracking add frequency tells me whether the data underneath
            the North Star is still worth anything &mdash; and whether this is a household
            habit or one person&rsquo;s project that three people ignore.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className={EYEBROW}>What this data can and cannot prove</p>
          <p className={P}>
            <span className="font-medium">
              Not measurable from app data: actual purchases prevented.
            </span>{" "}
            Find My Meds never sees a pharmacy transaction, a receipt, or a card charge.
            Every prevention figure the app produces is self-reported. No version of this
            app changes that.
          </p>
          <p className={P}>
            <span className="font-medium">The closest approach</span> is to treat
            self-reported preventions as the operational signal and reconcile them monthly
            against our real pharmacy order history. If an avoided purchase doesn&rsquo;t
            reappear in orders over the following 30 days, it moves from{" "}
            <em className="italic">self-reported</em> to{" "}
            <em className="italic">confirmed</em>. The gap between those two numbers is
            the honest measure of how much to trust the headline.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "In the pipeline",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="font-medium text-[#2b2622]">Guardrail metrics</p>
          <p className={P}>
            The gap I most want to close. If the app says a medication is home and it
            isn&rsquo;t, or it&rsquo;s expired, that still registers as a success. The fix
            is a third button &mdash;{" "}
            <em className="italic">couldn&rsquo;t find it / it was expired</em> &mdash;
            firing a rejection event with a reason property. Two metrics come out of it:
          </p>
          <ul className="flex flex-col gap-2">
            <li className="flex items-baseline gap-3">
              <span aria-hidden="true" className="text-[#b60d06]">
                &mdash;
              </span>
              <span className={P}>
                <span className="font-medium">False positive rate</span> &mdash; how often
                a match fails on contact with the actual cabinet
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span aria-hidden="true" className="text-[#b60d06]">
                &mdash;
              </span>
              <span className={P}>
                <span className="font-medium">Expired-match incidents</span> &mdash; the
                app presenting an expired medication as valid stock. For a medication app
                this is the closest thing to a safety issue.
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-medium text-[#2b2622]">The prescription screen</p>
          <p className={P}>
            I&rsquo;m also going to be building features that will let me track the success
            of the prescription screen. The plan is a dedicated entry point that tags a
            check with its trigger, so I can build a prescription-specific funnel and
            answer one question: of the prescriptions our household received, how many
            were checked against the cabinet first?
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-medium text-[#2b2622]">Price tracker</p>
          <p className={P}>
            I also want to add prices to the different medications later on, so that I can
            track exactly how much was saved.
          </p>
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
