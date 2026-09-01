"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  denyConsent,
  grantConsent,
  initAnalytics,
  readConsent,
  track,
  type ConsentState,
} from "@/lib/analytics";

/**
 * Boots Mixpanel, records pageviews, and asks for consent.
 *
 * Mounted once from the root layout. The SDK starts opted out, so nothing
 * leaves the browser until the banner is accepted.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  // One piece of state, not two, so mounting costs a single extra render.
  // Consent lives in localStorage, which cannot be read while rendering without
  // desyncing from the server-rendered HTML — so an effect is the right place
  // for it, and this runs exactly once.
  const [status, setStatus] = React.useState<{ ready: boolean; consent: ConsentState }>({
    ready: false,
    consent: null,
  });
  const { ready, consent } = status;

  React.useEffect(() => {
    initAnalytics();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above
    setStatus({ ready: true, consent: readConsent() });
  }, []);

  // One pageview per route. The site is a client-side router, so a load-time
  // listener alone would only ever see the first page.
  React.useEffect(() => {
    if (!ready || consent !== "granted" || !pathname) return;
    track("page_viewed", { path: pathname });
  }, [pathname, consent, ready]);

  const accept = () => {
    grantConsent();
    setStatus({ ready: true, consent: "granted" });
  };

  const decline = () => {
    denyConsent();
    setStatus({ ready: true, consent: "denied" });
  };

  // Nothing renders until the stored answer has been read, so a returning
  // visitor never sees the banner flash before it disappears.
  if (!ready || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed bottom-5 left-1/2 z-[80] w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-[#e7ded2] bg-[#fffdfa] p-5 shadow-[0_18px_50px_rgba(43,38,34,0.18)]"
    >
      <p className="text-sm leading-[1.6] text-[#2b2622]">
        I use analytics to see which work people actually read. Nothing is
        collected unless you agree, and it&rsquo;s never used to identify you.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={accept}
          className="h-10 rounded-full bg-[#b60d06] px-5 text-sm font-medium text-white transition-colors hover:bg-[#8a0a04] focus-visible:ring-2 focus-visible:ring-[#b60d06] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3ee] focus-visible:outline-none"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={decline}
          className="h-10 rounded-full border border-[#e0d6c8] px-5 text-sm font-medium text-[#2b2622] transition-colors hover:border-[#b60d06] hover:text-[#b60d06] focus-visible:ring-2 focus-visible:ring-[#b60d06] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3ee] focus-visible:outline-none"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export default AnalyticsProvider;
