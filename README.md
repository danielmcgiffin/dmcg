# Danny McGiffin

The existing Astro marketing site, evolved under the approved September 17 audit.
Newsreader + Geist, forest green + bone, and the existing static-page infrastructure.
Positioning: Independent Tech Advisor. Four offers — Tech Audit, Second Opinion,
AI Opportunity, Data Connection — defined once in `src/lib/content/offers.ts`. One call to action,
“Schedule Our First Chat”, links to Cal with a `src=` placement tag.

## Development

Node.js 24 and npm. `package-lock.json` is the CI lockfile.

- `npm ci` — install dependencies
- `npm run dev -- --host 127.0.0.1` — local Astro server
- `npm run build` — Astro/TypeScript checks and production build
- `npm run preview -- --host 127.0.0.1` — preview `dist/`
- `npm test` — built-site links, metadata, redirect and positioning checks (build first)

Deployment requires an explicit request. The CI workflow builds and tests; it does not deploy.
The restored hosting configuration and analytics integration remain in place.

## Structure

- `src/pages/` — homepage, Work (`/work/`), offers (`/offers/<slug>/`), About, Contact, regional page, writing and research
- `src/lib/content/` — typed content modules; every page and component reads its copy from here
- `src/lib/sections/home/` — one component per homepage section: Identity, SelectedWork, Testimonial, Writing, NextStep
- `src/components/` — shared navigation, advisor sidebar/footer, page intro, and section components
- `src/styles/global.css` — global foundations, design tokens, and shared advisor sidebar/footer rules
- `src/styles/pages/` and `src/styles/components/` — route and component rules, imported only where used
- `src/site.ts`, `src/lib/schema.ts` — shared identity and structured data
- `src/content/writing/` — existing MDX essays; stable URLs and RSS
- `src/data/substack-posts.json` — published Substack articles listed on `/writing/`
- `src/lib/content/work.ts` — case studies rendered at `/work/<slug>/`; `[TODO: …]` marks unfilled slots
- `scripts/og-images.py` — renders the share images in `public/og/` (needs rsvg-convert)
- `public/_redirects` — retired and renamed routes; mirrors Astro redirects
- `docs/APPROVED_AUDIT_2026-09-17.md` — approved scope
- `docs/IMPLEMENTATION_EVIDENCE_2026-09-17.md` — validation and remaining limitations

The Northern Virginia URL remains stable. Retired offer URLs and the unfinished
assessment redirect directly to the retained research briefing.

## Substack writing list

`/writing/` reads `src/data/substack-posts.json`. Every six hours, the
`.github/workflows/sync-substack.yml` workflow fetches the Built that Way archive and RSS feed,
keeps previously listed posts, builds and tests the site, and commits new entries
to `main`. Run `python3 scripts/sync-substack.py` to sync locally, or trigger the
workflow manually in GitHub Actions. The sync uses the public rss2json feed
converter when Substack blocks GitHub's runner. New entries deploy to Cloudflare
when GitHub has a `CLOUDFLARE_API_TOKEN` secret. Without that token, the workflow
commits the list but reports that live deployment was skipped.
The manual workflow input can force a deployment after the token is configured.

## Preserved work

The uncommitted Svelte app, public assets (including the office artwork), dependency
manifests and configuration were preserved in `archive/site-2026-09-17-svelte/`.
All 37 moved files were verified against `SHA256.json`. Earlier archives and unrelated
design/docs remain intact. Archives are excluded from the Astro check/build source scope.
`package-lock.json` is the only JavaScript package lockfile, so hosting builds and CI both use npm.
