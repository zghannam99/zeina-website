"use client";

import mixpanel from "mixpanel-browser";

/**
 * Every event this site can send.
 *
 * A closed set on purpose. Mixpanel names are case-sensitive and building them
 * at runtime produces thousands of near-duplicates that can never be merged, so
 * the union type below is the only thing `track` accepts — a typo is a build
 * error rather than a permanently polluted Lexicon.
 *
 * Names are snake_case, past-tense verb + noun, per the Mixpanel conventions.
 */
export type AnalyticsEvent =
  /** A page came into view. Fired on first load and on every client navigation. */
  | "page_viewed"
  /** Value moment: the CV was downloaded. */
  | "cv_downloaded"
  /** Value moment: a way of contacting Zeina was opened. */
  | "contact_initiated"
  /** One of the numbered cards on the home page was opened. */
  | "home_card_clicked"
  /** A case study was opened, from the carousel or its phone. */
  | "case_study_opened"
  /** The slide-out menu was opened. */
  | "menu_opened"
  /** A destination in the slide-out menu was chosen. */
  | "menu_navigated"
  /** The scroll curtain at the foot of a page carried the reader onward. */
  | "next_page_revealed"
  /** A project was brought into focus in the phone carousel. */
  | "project_viewed"
  /** The visitor answered the cookie banner. */
  | "consent_updated";

/** Flat, snake_case, and never null — Mixpanel prefers a missing property to an empty one. */
export type AnalyticsProperties = Record<string, string | number | boolean>;

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const CONSENT_KEY = "zg-analytics-consent";

let initialised = false;

/** "granted" | "denied" | null when the visitor has not answered yet. */
export type ConsentState = "granted" | "denied" | null;

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Private browsing, or storage blocked entirely. Treat as unanswered, which
    // keeps tracking off — the conservative side of the fail-safe.
    return null;
  }
}

function writeConsent(state: Exclude<ConsentState, null>) {
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* nothing to do — the session simply won't be remembered */
  }
}

/**
 * Boots the SDK opted OUT.
 *
 * `opt_out_tracking_by_default` means the library loads but sends nothing until
 * `opt_in_tracking()` is called. That ordering is the point: for an EU/UK or
 * California visitor, an event fired before consent is a compliance breach that
 * has to be cleaned up afterwards, so nothing may leave the browser until they
 * have actually accepted.
 */
export function initAnalytics(): boolean {
  if (initialised || typeof window === "undefined") return initialised;
  if (!TOKEN) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[analytics] NEXT_PUBLIC_MIXPANEL_TOKEN is not set — tracking is disabled."
      );
    }
    return false;
  }

  mixpanel.init(TOKEN, {
    opt_out_tracking_by_default: true,
    debug: process.env.NODE_ENV !== "production",
    // Explicit rather than automatic: the site is a client-side router, and
    // pageviews are sent from the provider so every route change is one event
    // with consistent properties.
    track_pageview: false,
    persistence: "localStorage",
  });
  initialised = true;

  // A returning visitor who already accepted should not be asked again.
  if (readConsent() === "granted") mixpanel.opt_in_tracking();

  return true;
}

export function grantConsent() {
  if (!initAnalytics()) return;
  writeConsent("granted");
  mixpanel.opt_in_tracking();
  track("consent_updated", { consent_state: "granted" });
}

export function denyConsent() {
  writeConsent("denied");
  // Turns tracking off and clears anything the library had stored locally.
  if (initialised) mixpanel.opt_out_tracking();
}

/**
 * Sends an event, but only when the visitor has opted in.
 *
 * The guard is belt-and-braces — the SDK already drops events while opted out —
 * but it means a stray call added later can't quietly become a breach.
 */
export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
  if (!initialised || typeof window === "undefined") return;
  if (!mixpanel.has_opted_in_tracking()) return;
  mixpanel.track(event, properties);
}
