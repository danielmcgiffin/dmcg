# Danny McGiffin

A small, static Astro site for an independent management consultant.
The homepage introduces Danny, shows selected work and client testimony, and links to writing and contact.

## Run locally

Node.js 24 and npm. `package-lock.json` is the only JavaScript lockfile.

- `npm ci` — install dependencies
- `npm run dev -- --host 127.0.0.1` — development preview
- `npm run build` — type-check and build to `dist/`
- `npm run preview -- --host 127.0.0.1` — preview the production build
- `npm test` — check the built site (build first)

Deployment requires an explicit request. The Check workflow builds and tests without deploying.
The separate Substack workflow can deploy after a sync if its Cloudflare token is configured.

## Where to make changes

| Change | File |
| --- | --- |
| Name, professional title, homepage metadata, location | `src/site.ts` |
| Homepage words | `src/lib/content/home.ts` |
| Homepage order and layout | `src/pages/index.astro` |
| Navigation and shared closing invitation | `src/lib/content/navigation.ts` |
| Case studies and homepage selection | `src/lib/content/work.ts` |
| Testimonials and featured quotation | `src/lib/content/testimonials.ts` |
| About and Contact copy | `src/lib/content/about.ts`, `contact.ts` |
| Service copy, prices, duration, scope and guarantees | `src/lib/content/offers.ts` |
| Illustrative AI example | `src/lib/content/ai-example.ts` |
| Color, typography, page width, sidebar and mobile menu | `src/styles/global.css` |
| Page-specific layout rules | `src/styles/pages/` |
| Shared page layout, metadata and analytics | `src/layouts/BaseLayout.astro` |
| Booking link, CTA label and subscription link | `src/config.ts` |
| Substack articles | `src/data/substack-posts.json` (automatically synced) |
| Local essays | `src/content/writing/*.mdx` |
| Social/share-image copy | `scripts/og-images.py` |

`BaseLayout` owns the header, main element, and footer on every page. Pages supply their content.
Do not add another header/footer variant or page-wide CSS override layer.
Homepage sections live together in one file; repeated page formats use shared templates.
All four services use `OfferPage.astro`: overview, then expandable details.

To add a case, add an entry to `work.ts`; its route appears automatically at `/work/<slug>/`.
Use `selectedWorkSlugs` to choose the homepage cases. Empty section arrays are omitted.
Never publish placeholder text or turn projected costs into claimed savings.

After changing share cards, run `python3 scripts/og-images.py` (uses the installed Sharp package).
Update visible copy, metadata, `public/llms.txt`, and share cards together when the professional identity changes.

## URLs and integrations

Home, `/work/`, `/writing/`, `/about/`, and `/contact/` form the main site.
Focused engagements remain at `/offers/<slug>/`. Existing regional, research, essay and RSS URLs remain available.
Historical URLs redirect through both `astro.config.ts` and `public/_redirects`; update both together.

Cal booking links retain their `src=` placement tags. GA4 and subscription tracking remain in `Analytics.astro`.
`/writing/` reads the Substack list. Every six hours, `.github/workflows/sync-substack.yml` fetches the publication,
keeps previous entries, builds and tests, and commits updates to `main`. Run
`python3 scripts/sync-substack.py` to sync locally. The workflow uses a public feed converter if Substack blocks its runner.
With `CLOUDFLARE_API_TOKEN`, the workflow can deploy; without it, it only commits the list.

## Historical material

`archive/`, `working/`, and older dated reports in `docs/` preserve prior iterations and artwork.
They are outside the active app. The current brief is `SITE_BRIEF.md`; design rules are in `DESIGN_LANG.md`.
Do not restore retired positioning, layouts, or instructions from old reports.
