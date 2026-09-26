# Danny McGiffin

The existing Astro marketing site, evolved under the approved September 17 audit.
Newsreader + Geist, forest green + bone, and the existing static-page infrastructure.
Positioning: independent business advisor and designer for consequential, ambiguous
business problems. Advisory, Design, and Build are independent ways to engage.

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

- `src/pages/` — homepage, About, Contact, regional page, writing and research
- `src/components/` — shared navigation, advisor sidebar/footer, page intro, and section components
- `src/styles/global.css` — global foundations, design tokens, and shared advisor sidebar/footer rules
- `src/styles/pages/` and `src/styles/components/` — route and component rules, imported only where used
- `src/site.ts`, `src/lib/schema.ts` — shared identity and structured data
- `src/content/writing/` — existing MDX essays; stable URLs and RSS
- `public/_redirects` — retired offer/assessment routes; mirrors Astro redirects
- `docs/APPROVED_AUDIT_2026-09-17.md` — approved scope
- `docs/IMPLEMENTATION_EVIDENCE_2026-09-17.md` — validation and remaining limitations

The Northern Virginia URL remains stable. Retired offer URLs and the unfinished
assessment redirect directly to the retained research briefing.

## Preserved work

The uncommitted Svelte app, public assets (including the office artwork), dependency
manifests and configuration were preserved in `archive/site-2026-09-17-svelte/`.
All 37 moved files were verified against `SHA256.json`. Earlier archives and unrelated
design/docs remain intact. Archives are excluded from the Astro check/build source scope.
`package-lock.json` is the only JavaScript package lockfile, so hosting builds and CI both use npm.
