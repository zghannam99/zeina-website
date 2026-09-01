import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { BubbleBackground } from "@/components/ui/bubble-background";
import { LedgerCardRow } from "@/components/ui/ledger-card-row";
import { ScrollFlyIn } from "@/components/ui/scroll-fly-in";
import { FlyingPhone } from "@/components/ui/flying-phone";
import { ContactButtons } from "@/components/ui/contact-buttons";

export default function Home() {
  return (
    // `relative` so the bubble layer, which is absolute, has this to size against.
    <main className="relative flex-1">
      <BubbleBackground interactive />

      <IntroAnimation />
      <LedgerCardRow />

      {/* The phone's path is lifted so it crosses above the heading rather than
          through it. */}
      <ScrollFlyIn
        flyer={<FlyingPhone />}
        flyerClassName="-translate-y-[22vh] md:-translate-y-[26vh]"
      >
        <h2 className="px-4 text-5xl font-normal tracking-tight text-[#2b2622] md:text-7xl">
          Contact <span className="font-medium text-[#b60d06]">me</span>
        </h2>
        <ContactButtons />
      </ScrollFlyIn>
    </main>
  );
}
