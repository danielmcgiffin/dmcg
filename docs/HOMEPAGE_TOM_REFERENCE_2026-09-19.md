# Homepage layout — Tom Critchlow reference

September 19, 2026. Supersedes the homepage composition documented in HOMEPAGE_STRUCTURE_2026-09-19.md. Implemented locally; not committed or deployed.

Danny rejected the previous composition and requested https://tomcritchlow.com/consulting/ as the new reference, with cream background, forest green accents, and his LinkedIn headshot replacing the reference's hero logos.

## Result

Fixed desktop sidebar; responsive mobile menu; modest sans-serif introduction beside a square portrait; compact engagement descriptions; six focus-area cards; four native expandable case studies; personal introduction and simple conversation invitation. Homepage background #f8f5ec, accent #214d38. Geist retained as the sans-serif. Existing internal pages keep their current design. No copied reference prose, logos, testimonials, or project imagery.

Homepage styles are scoped under the consulting classes. BaseLayout accepts an optional bodyClass. Existing metadata, analytics, fonts, and internal routes are preserved.

## Portrait provenance

Copied unchanged from `/home/epicus/Downloads/1782142835887.jpeg` to `public/danny-mcgiffin.jpg` (400 × 400). The filename matches the image identifier in the author metadata for Danny's public LinkedIn post:
https://www.linkedin.com/posts/danny-mcgiffin_the-ai-pilot-worked-and-nothing-changed-activity-7493318221069070337-x8N9

The source identifies the author as Danny McGiffin and links his existing profile. The image was visually inspected. No generated portrait, retouching, or third-party hotlink.

## Validation

- `npm run build`: exit 0; Astro check 0 errors, warnings, or hints. Existing empty-proof and MDX bundler notices remain.
- `npm test`: 6 passed, 0 failed. Existing homepage test updated for navigation, portrait, project disclosures, section order, and independent engagement modes.
- `git diff --check`: exit 0.
- Chromium production-output checks at 1440, 1024, 768, 390, and 320 CSS pixels: no horizontal overflow; cream background and sans-serif heading confirmed; portrait loaded at natural width 400.
- Full-page desktop and mobile screenshots visually inspected against the rendered reference.
- Project disclosure opens; mobile menu opens; Escape closes it and returns focus. Content, portrait, and native project disclosures remain present with JavaScript disabled.
- No uncaught JavaScript exceptions during the review.
- Existing Tailscale preview at http://100.126.57.128:4325/ returns HTTP 200 with the rebuilt page. Direct reachability from noxbox was not independently tested.

Temporary browser evidence: `/tmp/dmcg-implementation/tom-home-{width}.png`; reference: `/tmp/dmcg-implementation/tom-reference.png`; checks: `/tmp/dmcg-sept19/tom-review.mjs`. No new full accessibility audit or cross-browser certification is claimed.
