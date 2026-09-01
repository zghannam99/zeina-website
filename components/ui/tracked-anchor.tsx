"use client";

import * as React from "react";

import { track, type AnalyticsEvent, type AnalyticsProperties } from "@/lib/analytics";

type TrackedAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEvent;
  eventProperties?: AnalyticsProperties;
};

/**
 * A plain anchor that reports its own click.
 *
 * Exists because the pages it is used from are server components and cannot
 * carry an onClick of their own. Forwards its ref and spreads every prop, so it
 * still works as the child of a `<Button asChild>`, which clones it.
 */
export const TrackedAnchor = React.forwardRef<HTMLAnchorElement, TrackedAnchorProps>(
  ({ event, eventProperties, onClick, children, ...props }, ref) => (
    <a
      ref={ref}
      onClick={(e) => {
        track(event, eventProperties);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  )
);
TrackedAnchor.displayName = "TrackedAnchor";

export default TrackedAnchor;
