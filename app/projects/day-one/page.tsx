import type { Metadata } from "next";
import Link from "next/link";

import { DriftingShapes } from "@/components/ui/drifting-shapes";
import { FillText } from "@/components/ui/motion-fill-text";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { NextPageReveal } from "@/components/ui/next-page-reveal";

export const metadata: Metadata = {
  title: "day one — Zeina Ghannam",
  description:
    "A tool that helps people with too many goals decide which task to act on, based on their own motivation profile.",
};

const P = "text-base leading-[1.75] text-[#2b2622] md:text-lg";
const LEDE = "text-lg leading-[1.7] text-[#2b2622] md:text-xl";
const NOTE = "text-sm leading-[1.6] text-[#8a8179]";

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-baseline gap-3">
          <span aria-hidden="true" className="text-[#b60d06]">
            &mdash;
          </span>
          <span className={P}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Numbered({ items }: { items: string[] }) {
  const numerals = ["i", "ii", "iii", "iv", "v", "vi"];
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div
          key={item}
          className="flex items-baseline gap-5 border-t border-[#e7ded2] py-4 last:border-b"
        >
          <span className="w-8 shrink-0 font-serif text-xl text-[#cdbfae]">
            {numerals[i]}
          </span>
          <p className={P}>{item}</p>
        </div>
      ))}
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-[#e7ded2] bg-[#fffdfa] p-6">
      <p className="mb-2 font-medium text-[#2b2622]">{title}</p>
      <p className="text-[15px] leading-[1.65] text-[#2b2622]">{body}</p>
    </div>
  );
}

const DATA: TimelineEntry[] = [
  {
    title: "Overview",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <p className={LEDE}>
          &lsquo;day one&rsquo; is a tool designed to help users with too many goals and New
          Year&rsquo;s resolutions to make better decisions about which tasks to prioritize.
        </p>
        <p className={P}>
          The product addresses a common gap in existing productivity tools: while most
          tools focus on task organization, they do not take into account the user&rsquo;s
          unique motivation and procrastination styles.
        </p>
        <p className={NOTE}>Built on Glide · Role: Product · Status: in progress</p>
      </div>
    ),
  },
  {
    title: "Problem",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <p className={LEDE}>
          Through initial exploration, I identified that people often struggle to choose
          which tasks to act on due to competing motivations.
        </p>
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8179]">
            This results in
          </p>
          <Numbered
            items={[
              "Procrastination despite clear goals",
              "Bias toward low-effort or high-reward tasks",
              "Inconsistent progress on long-term priorities",
            ]}
          />
        </div>
      </div>
    ),
  },
  {
    title: "Research & Insights",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8179]">
            To better understand this problem, I conducted
          </p>
          <Bullets
            items={[
              "Informal user interviews and discussions",
              "Behavioral pattern analysis of task-selection habits",
              "Exploration of motivation frameworks and decision-making models",
            ]}
          />
        </div>

        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8179]">
            Four dominant motivation types emerged
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card title="Reward-driven" body="Dopamine and interest-focused" />
            <Card title="Ease-driven" body="Low-effort preference" />
            <Card title="Deadline-driven" body="Urgency-focused" />
            <Card title="Importance-driven" body="Impact-focused" />
          </div>
        </div>

        <p className="font-serif text-[1.5rem] leading-[1.35] text-[#b60d06] md:text-[1.9rem]">
          Users typically exhibit a mix of these motivations, influencing how they
          prioritize tasks.
        </p>
      </div>
    ),
  },
  {
    title: "Product Concept",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <p className={LEDE}>
          Based on these insights, I designed a product framework that:
        </p>
        <Numbered
          items={[
            "Diagnoses a user's motivation profile through a short assessment",
            "Assigns weighted motivation types (e.g. 40% reward-driven, 30% importance-driven, 30% ease-driven)",
            "Generates a prioritized recommendation based on both user goals and motivation patterns",
          ]}
        />
      </div>
    ),
  },
  {
    title: "Key Features",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <p className={NOTE}>Early definition</p>
        <div className="flex flex-col gap-3">
          <Card
            title="Motivation Profiling Quiz"
            body="Determines dominant behavioral drivers behind task selection"
          />
          <Card
            title="Smart Task Recommendation Engine"
            body="Suggests tasks based on each user's balance of urgency, reward, ease, and importance"
          />
          <Card
            title="Decision Support Interface"
            body={`Guides users in choosing "what to do next" rather than just listing tasks`}
          />
        </div>
      </div>
    ),
  },
  {
    title: "MVP Development",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <p className={LEDE}>
          To move from concept to tangible product logic, I am building an early MVP using
          Glide Apps.
        </p>
        <p className={P}>
          The goal of this phase was to test and operationalize the decision logic behind
          the product.
        </p>

        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8179]">
            What I implemented
          </p>
          <div className="flex flex-col gap-3">
            <Card
              title="Motivation Profiling Structure"
              body="Users are assigned weighted motivation types, which are stored and used as core inputs into the system."
            />
            <Card
              title="Task Scoring Framework"
              body="Each task is evaluated across key dimensions (urgency, reward, ease, importance), translating qualitative attributes into structured data."
            />
            <Card
              title="Priority Calculation Logic"
              body="A scoring mechanism that combines user motivation weights with task attribute scores, producing a dynamic priority score for each task."
            />
            <Card
              title="Recommendation Output"
              body="Tasks are surfaced based on their computed priority, enabling the user to quickly identify what to work on next."
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Current Stage",
    content: (
      <div className="flex max-w-[680px] flex-col gap-8">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-[rgba(182,13,6,0.08)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#b60d06]">
            Completed
          </p>
          <Bullets
            items={[
              "Problem definition and validation",
              "Behavioral research and insight synthesis",
              "Product concept and system design",
              "Initial MVP logic built in Glide",
            ]}
          />
        </div>

        <div>
          <p className="mb-4 inline-flex rounded-full border border-[#e0d6c8] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#a39a90]">
            In progress
          </p>
          <Bullets
            items={[
              "Refining scoring logic and weighting system",
              "Improving usability of the decision interface",
              "Structuring data models more efficiently within Glide",
            ]}
          />
        </div>
      </div>
    ),
  },
  {
    title: "Next Steps",
    content: (
      <div className="flex max-w-[680px] flex-col gap-6">
        <Bullets items={["Develop low-fidelity UX prototypes"]} />

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8179]">
            Conduct user testing to validate
          </p>
          <Bullets
            items={["Usefulness of recommendations", "Accuracy of prioritization logic"]}
          />
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8179]">
            Iterate on
          </p>
          <Bullets
            items={[
              "Input friction (reducing manual scoring)",
              "Recommendation clarity and trust",
            ]}
          />
        </div>

        <p className="font-serif text-[1.5rem] leading-[1.35] text-[#2b2622] md:text-[1.9rem]">
          Explore pathways toward{" "}
          <em className="italic text-[#b60d06]">
            a more automated and scalable MVP.
          </em>
        </p>
      </div>
    ),
  },
];

export default function DayOnePage() {
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

          <h1 className="mb-4">
            <FillText
              text="day one"
              className="font-serif text-[3.2rem] leading-[0.98] tracking-[-0.02em] md:text-[6.5rem]"
              trackClassName="text-[#e3d9cc]"
              fillClassName="text-[#2b2622]"
            />
          </h1>

          <span className="inline-flex rounded-full border border-[#e0d6c8] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#a39a90]">
            In progress
          </span>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/day-one/intro-pic.jpg"
            alt="A cork vision board covered in pinned photographs of goals — travel, family, graduation, fitness and work"
            width={1198}
            height={688}
            className="mt-10 aspect-[1198/688] w-full rounded-[20px] object-cover"
          />

          {/* The logo animation sits on solid white. multiply drops that white
              into the warm paper without re-encoding 84 frames. */}
          <div className="mt-12 flex justify-center md:mt-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/day-one/logo.webp"
              alt="day one"
              className="w-full max-w-[360px] mix-blend-multiply"
            />
          </div>
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
      <NextPageReveal href="/projects" label="Projects" />

    </main>
  );
}
