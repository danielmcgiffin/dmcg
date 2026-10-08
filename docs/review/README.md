# Simplified site review — October 8, 2026

The site now uses one page layout, navigation, footer, palette, and typography system.
The homepage introduces Danny under the working title Independent Management Consultant,
then shows Ed Burns’s testimonial, three selected cases, writing, and contact.

## Preview captures

- [Desktop homepage](home-1440.png)
- [Mobile homepage](home-390.png)
- [About](about.png)
- [AI Opportunity](ai-opportunity.png)
- [Writing](writing.png)

For a working local preview: `npm ci`, `npm run build`, then `npm run preview`.

## Content to review

- The professional title and brief homepage introduction are working copy.
- Ed’s quotation comes from the testimonial supplied on October 7; his October 8 reply permits CEO-at-Burns-Logistics attribution. Only the apostrophe typography was normalized.
- The $64M case uses the résumé’s high-level management responsibilities and completion statement. No customer, location, mission, specific technology, or four-month timing claim was added.
- The contracting case is deliberately brief. The supplied material establishes the policy conversation and Ed’s result, but not enough detail to reconstruct a fuller account of the recommendation.
- Existing ERP cost qualifications remain: projected ERP costs, an estimated alternative, and no realized-savings claim.
- Existing prices, engagement boundaries, and guarantees remain on the focused offer pages.

## Validation

- `npm run build`: passes Astro/TypeScript checks and production build.
- `npm test`: 16 passing checks, including links, fragments, redirects, metadata, analytics markup, commercial terms, and no placeholder copy.
- Chromium: 16 representative routes at 1440px, 390px and 320px; no horizontal overflow, broken images, or page errors.
- Mobile menu opening, Escape dismissal, navigation, and expandable AI examples checked.
- Desktop and mobile homepage, About, Writing, service-page and share-image renders visually inspected.
- Active CSS reduced from 63,501 to 18,565 bytes, approximately 71%.
- Existing MDX bundler notices remain; no build failures. External analytics delivery and booking/subscription completion were not exercised.

No production deployment is included. See the root README for the editing map.
