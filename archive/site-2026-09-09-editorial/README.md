# Danny McGiffin — Machinery of Magic

A static Astro editorial site for Danny’s founder-led consulting practice.
The original reference is `src/assets/workshop.png`, supplied by Danny. The homepage
uses `src/assets/study-editorial.png`, an edited version without the crystal ball,
gears, or technical drawings. Art direction follows print editorial composition:
ivory, near-black forest, Newsreader, brass, generous space, and physical paper.

## Development

- `npm run dev` — local Astro server
- `npm run check` — Astro and TypeScript diagnostics
- `npm run build` — diagnostics and static production build
- `npm run preview` — preview the production output

The existing dependencies and lockfile are retained. No new animation library,
framework, or client-side router was added. The installed pnpm 11 attempts an
automatic dependency reconciliation before scripts; npm scripts work against the
existing installed dependencies without that reconciliation.

## Architecture

- `src/layouts/Editorial.astro`: shared editorial shell, metadata, navigation.
- `src/styles/editorial.css`: typography, responsive composition, motion.
- `src/pages/index.astro`: eight-scene homepage.
- `src/pages/field-notes/proposal-factory.astro`: printable tactical field note.
- `src/content/writing`: existing published articles, retained verbatim.
- `archive/site-2026-09-09`: unpublished pre-redesign source snapshot.

Old offer routes redirect to the conversation or About page. Contact uses the
existing Cal.com destination; no embedded third-party booking script is needed.
The existing untracked `/go/`, `/machinery/`, and `src/office/` experiments were
preserved and excluded from the sitemap. Their separate JavaScript is not loaded
by the editorial homepage. They remain accessible if the whole checkout is built.

## Motion and accessibility

The homepage uses native scrolling and an editorial sequence of dark and paper
sections. The 95 / 5 is a typographic spread; the school result is a fixed,
readable comparison. No animated counters, schematic overlays, or status labels.

Motion is limited to a slight image drift, the Field Notes paper entering the
frame, and quiet link interactions. A desktop sticky number gives the spread a
brief pause. Scroll animations use progressive CSS enhancement; unsupported
browsers retain the complete composition. Reduced-motion preferences disable
animation. Native `details` elements support keyboard, mouse, and touch.

## Content and evidence

The 100 → 15 annual hours metric and quoted testimonial were carried from the
pre-redesign homepage. The school remains anonymous. No additional client outcomes
were introduced. The Proposal Factory is a newly authored practical field note;
the writing index uses actual existing articles, not proposed unpublished titles.

## Deployment

Static output remains `dist/`. Existing Cloudflare assets configuration remains in
`wrangler.jsonc`. `npm run deploy` builds then deploys; deployment is a separate
explicit action. Do not interpret a local build or browser check as live evidence.

The old site's Lighthouse scores apply only to the archived site. Current results
are recorded in `docs/redesign-validation.md`.
