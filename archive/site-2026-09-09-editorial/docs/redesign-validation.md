# Editorial revision — 2026-09-09

Implemented locally; not committed or deployed.

- Removed hero annotations, schematic tiers, status labels, pipeline cards,
  cassette sequence, animated hours counter, and the JavaScript choreography.
- Restored a typographic 95 / 5 spread, fixed school result, prose comparison,
  and a plain printed Field Notes cover.
- Native CSS motion is limited to image drift and paper arrival. Content remains
  visible without JavaScript or scroll-timeline support.
- Chromium, local static output: 320, 390, 768, 1440, and 1920px widths have no
  horizontal overflow. All seven section headings remain without JavaScript.
- Keyboard Enter opens the native details. Reduced motion disables paper
  animation. Internal homepage links return success; no browser errors observed.
- Desktop and mobile full-page screenshots inspected in this revision.
- Build passed: Astro reports 0 errors, 0 warnings, 0 hints. Existing build
  notices concern the empty proof collection and experimental Three.js bundle.
- Earlier Lighthouse scores below have not been remeasured for this revision.

## Image edit

Built-in imagegen; original preserved. Saved as `src/assets/study-editorial.png`
and copied to `public/study-editorial.png` for social metadata.

Prompt: Edit the supplied room photograph. Preserve framing, forest-green walls,
brass lamp, window, dusk city, books, mug, desk, and warm lighting. Remove the
crystal ball, loose gears, mechanical instruments, wall chart, magical sparks,
and technical drawings. Replace desk drawings with ivory paper and an open
literary book. No symbolic replacements, text overlays, or interface graphics.
Restrained photographic art direction; preserve the portrait composition.

---

## Earlier redesign validation (historical)

# Machinery of Magic validation — 2026-09-09

Status: implemented locally, not committed, not deployed.

## Source and build

- `npm run build`: exit 0; Astro check reports 0 errors, 0 warnings, 0 hints.
- `git diff --check`: exit 0.
- Build emits two existing-context notices: empty proof collection and a large
  Three.js chunk belonging to the preserved `/machinery/` experiment. The new
  homepage loads no external JavaScript resource (its observer is inline).
- Pre-redesign working-tree snapshot is in `archive/site-2026-09-09` and excluded
  from TypeScript and static routes. Existing untracked experiments were preserved.
- Package manifest and pnpm lockfile retain their pre-task changes; this redesign
  introduces no dependencies.

## Browser checks

Chromium through Puppeteer against local Astro and final static output:

- 320×740, 390×844, 768×1024, 1440×1000, 1920×1080: no horizontal overflow.
- Inspected desktop, mobile full page, mobile hero, and desktop 95/5 screenshots.
- All nine machinery entries exist. Touch opens an entry; Enter closes it.
- Reduced motion: hero animation `none`, ratio scene position `static`.
- JavaScript disabled: headline and all seven subsequent section headings remain.
- All internal homepage link destinations return success.
- Field note has no mobile overflow and renders to a printable A4 PDF.
- No browser JavaScript errors observed.
- Measured scroll transforms across the 95/5 track: ordinary structure scales
  from approximately .995 to .916 while exceptional content rises from 52 to 9px.
- Disabled CSS minification because the optimizer combined animation-timeline
  into shorthand ignored by the tested browser. Longhands work in production.

## Final Lighthouse mobile run

Local production output served by Python on port 4381; simulated mobile Lighthouse.
These are lab measurements, not production CDN or field measurements.

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

- First contentful paint: 1.4 s
- Largest contentful paint: 1.7 s
- Cumulative layout shift: 0.001
- Total blocking time: 0 ms
- Responsive hero AVIF files: approximately 22, 39, and 49 KB.
- Original source is 941×1672; generated images do not invent source detail.

Full local report: `/tmp/dmcg-lighthouse-final.json`.
Screenshots: `/tmp/magic-desktop-production.png`, `/tmp/magic-phone-production.png`.
Print check: `/tmp/proposal-factory.pdf`.

## Remaining boundaries

No deployment or booking was performed. No cross-browser Safari/Firefox testing
or physical-device testing was performed. Browsers without CSS scroll timelines
receive the static layout. Existing experimental routes remain accessible if this
entire checkout is deployed; they are excluded from the sitemap.
