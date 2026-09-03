"use client";

import * as React from "react";

/**
 * A media query as reactive state.
 *
 * The obvious shape — hold the answer in `useState`, then run an effect on
 * mount to catch up with the browser — writes state from an effect, which
 * schedules a second render on every single mount. `useSyncExternalStore` reads
 * the value during render on the client instead, and falls back to the server
 * snapshot before hydration, so the markup React hydrates against is still the
 * one the server produced.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // There is no viewport on the server. Answering false everywhere keeps the
    // server output identical to the client's first, pre-hydration render.
    () => false
  );
}

/** Never changes, so it never needs to notify. Hoisted so its identity is
 *  stable and React does not resubscribe on every render. */
const neverChanges = () => () => {};

/**
 * False on the server and through hydration, true once the client has taken
 * over — for the case where the first client render must match the server and
 * every one after it should not.
 *
 * No state, so nothing is written from an effect; the two snapshots simply
 * disagree, which is exactly what this is for.
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  );
}
