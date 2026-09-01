<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:mixpanel-analytics -->

# Analytics — Mixpanel

This project uses **Mixpanel** (`mixpanel-browser`) for product analytics. Read this
before adding, renaming, or removing any tracking.

## Where things live

| Concern | File |
|---|---|
| SDK init, consent gate, `track()` | `lib/analytics.ts` |
| Provider, pageviews, consent banner | `components/ui/analytics-provider.tsx` |
| Anchor that reports its own click (for server components) | `components/ui/tracked-anchor.tsx` |
| Token | `NEXT_PUBLIC_MIXPANEL_TOKEN` in `.env.local` (and Vercel env vars) |

## Consent is not optional

Visitors may be in the EU/UK or California, so the SDK is initialised with
`opt_out_tracking_by_default: true` and sends **nothing** until the visitor accepts
the banner. `track()` additionally checks `has_opted_in_tracking()` before every
call. Do not add a tracking call that bypasses `lib/analytics.ts`, and never move
initialisation ahead of consent — events fired before consent are a compliance
breach that requires deleting the data.

## Adding an event

1. Add the name to the `AnalyticsEvent` union in `lib/analytics.ts`. The union is
   the only thing `track()` accepts, so a typo is a build error rather than a
   permanently polluted Lexicon.
2. Call `track("your_event", { ...properties })` from a client component, or use
   `<TrackedAnchor>` from a server component.

## Naming rules (Mixpanel is case-sensitive)

- Events: `snake_case`, past-tense verb + noun — `cv_downloaded`, not `Download CV`
- Properties: `snake_case`; booleans prefixed `is_`; no abbreviations
- Never build an event or property name at runtime
- Send numbers as numbers, never as quoted strings
- Omit a property entirely when it has no value — never send `null` or `""`
- No `$` or `mp_` prefixes on custom names
- One event, one meaning — don't reuse a name for two different actions

## Events currently sent

| Event | Fires when | Key properties |
|---|---|---|
| `page_viewed` | Every route, including client navigations | `path` |
| `cv_downloaded` | **Value moment** — CV download on Experience | `source` |
| `contact_initiated` | **Value moment** — LinkedIn or email opened | `method` |
| `home_card_clicked` | A numbered home page card is opened | `destination`, `title` |
| `case_study_opened` | A case study is opened from the carousel | `project`, `destination`, `surface` |
| `project_viewed` | A project is brought into focus in the carousel | `project`, `position` |
| `menu_opened` | Slide-out menu opened | `from_path` |
| `menu_navigated` | A menu destination is chosen | `destination`, `label`, `from_path` |
| `next_page_revealed` | Scroll curtain carries the reader onward | `destination`, `method` |
| `consent_updated` | Visitor answers the banner | `consent_state` |

## Identity

The site has no accounts, so every visitor is anonymous. There is deliberately no
`identify()`, no `reset()`, and no `people.set()` — Mixpanel guidance is not to
create user profiles for anonymous users. If auth is ever added, wire
`identify(user.id)` on login *and* on every re-open while logged in, and
`reset()` on logout.

<!-- END:mixpanel-analytics -->
