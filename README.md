# dannymcgiffin.com

A static, hand-crafted marketing site for Danny McGiffin, an independent operations and AI consultant in Northern Virginia.

## Stack

- Astro 7 with strict TypeScript and static output
- Tailwind CSS v4 tokens through `@theme`; bespoke component CSS
- Typed Astro Content Collections and MDX for `/writing`
- Locally hosted Newsreader and Geist Latin WOFF2 subsets
- Astro `<Picture>` output with AVIF primary and WebP fallback
- Native cross-document View Transitions
- CSS scroll timelines with a sub-1KB IntersectionObserver fallback
- No component library, animation library, smooth-scroll runtime, or SPA router

## Commands

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm preview
```

The production output is written to `dist/`.

## Design tokens

The supplied desktop PNG is the source of truth. Tokens live in [`src/styles/global.css`](src/styles/global.css).

| Role | Token | Value |
| --- | --- | --- |
| Dark surface | `--dark` | `#0f1b14` |
| Footer surface | `--darkest` | `#0b100d` |
| Light surface | `--bone` | `#efeee8` |
| Text on light | `--ink` | `#171a17` |
| Muted text on light | `--muted-light` | `#666a64` |
| Muted text on dark | `--muted-dark` | `#a7aea7` |
| Green identity | `--accent` | `#2f6845` |
| Green on dark | `--accent-on-dark` | `#a4d392` |
| Display font | `--display` | Newsreader 300 / true italic |
| UI font | `--ui` | Geist 400 / 600 |
| Content shell | `--shell` | `min(86.6vw, 1664px)` |
| Structural rule | — | `1px` translucent neutral |
| Pill radius | — | `999px` |
| Motion easing | `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

The two green values are contrast-adjusted expressions of one green identity. The darker value supports white button text and large text on bone; the mint supports large italic display text on the forest surface.

### Type scale

The scale follows an approximate 1.333 ratio: 10, 12, 14, 18, 24, 32, 44, 60, 80, and 108px. Display type uses `clamp()` at responsive boundaries rather than fixed viewport assumptions.

### Spacing rhythm

The base rhythm is 8px. Major section padding uses 84, 112, 120, 144, and 160px steps. Desktop sections retain the asymmetric 18% eyebrow rail and intentional negative space from the comp.

## Content

Writing lives in `src/content/writing/`. Frontmatter is validated by Zod in `src/content.config.ts`:

```yaml
title: Article title
description: Search and teaser description
publishedAt: 2026-08-10
draft: false
tags:
  - workflow design
```

The current MDX entries contain explicit TODO comments instead of invented article copy. Add approved prose beneath those comments.

Verified evidence lives in `src/content/proof/`. Every entry requires `metric_line`, `context`, and `attribution`; the collection is intentionally empty. The section renders only when verified entries exist and both `SHOW_PROOF=true` and `PROOF_HEADLINE` are present at build time. It is off by default, and an incomplete setup emits a build warning rather than shipping placeholder proof.

## Images

Source photography lives in `src/assets/`. Astro creates width-specific AVIF and WebP files at build time. The hero is eager, high-priority, explicitly dimensioned, and preloaded by Astro. Below-fold media is lazy-loaded.

The OG image is `public/og-image.png`.

## Accessibility and motion

- Semantic header, navigation, main, sections, articles, and footer
- Skip link and visible keyboard focus rings
- WCAG AA contrast verified by Lighthouse
- Headline and section motion respects `prefers-reduced-motion`
- Desktop headline lines reveal with a 70ms stagger; mobile avoids LCP-delaying entrance motion
- Browsers without scroll timelines receive a one-shot IntersectionObserver reveal shim

## Measured quality

Measured locally against the static production build with Lighthouse mobile simulation:

| Metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 1.353s |
| LCP | 1.653s |
| CLS | 0.00028 |
| Total Blocking Time | 0ms |
| Initial transfer | 124,344 bytes |
| Generated JS bundles | 0 bytes |

The only authored client script is the inline reveal fallback and is under 1KB. Results were collected on the local static server; production network and CDN behavior can change field measurements.

## Deployment

### Cloudflare Pages

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node version | 22 or later |

### Netlify

`netlify.toml` contains the build command, publish directory, and immutable asset caching policy.

Astro generates `sitemap-index.xml`. The RSS feed is available at `/rss.xml`.
