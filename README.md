# Zeina Ghannam — Portfolio

Personal portfolio site. Built with Next.js 16 (App Router), React 19, TypeScript
and Tailwind CSS v4.

Live at **[zeina-portfolio-psi.vercel.app](https://zeina-portfolio-psi.vercel.app)**.

## Running it

```bash
npm install
npm run dev
```

Then open [localhost:3000](http://localhost:3000).

## Structure

| Path | What's in it |
|---|---|
| `app/` | Routes — home, about, experience, projects, and two case studies |
| `components/ui/` | All components, including the animated hero, phone carousel and page-transition curtain |
| `lib/analytics.ts` | Mixpanel setup and the typed event list |
| `public/` | Images, demo recordings, CV |

## Analytics

Mixpanel, via `mixpanel-browser`. The SDK initialises **opted out** and sends
nothing until a visitor accepts the consent banner, since visitors may be in the
EU/UK or California.

Set the project token before running:

```bash
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

Locally that goes in `.env.local`; in production it's a Vercel environment
variable. Without it, tracking is disabled and the site runs normally.

See `AGENTS.md` for the event list and the naming rules to follow when adding
tracking.
