# Daniel McGiffin — Founder Constraint Session

A focused, single-page offer for a $500, 90-minute founder constraint session. Built with SvelteKit 2, Svelte 5, Tailwind CSS v4, and the Cloudflare adapter.

## Local development

```bash
pnpm install
pnpm dev
```

Build the production site with:

```bash
pnpm build
```

## Booking link

The calls to action currently open a pre-addressed email to `danielmcgiffin@gmail.com`. Replace the `mailto:` URL in `src/lib/components/Cta.svelte` when a calendar booking link is ready.

## Cloudflare Pages

Create a Pages project from this repository and use:

| Setting | Value |
| --- | --- |
| Framework preset | SvelteKit |
| Production branch | `main` |
| Build command | `pnpm run build` |
| Build output directory | `.svelte-kit/cloudflare` |

After the first deployment, attach `dannymcgiffin.com` in **Workers & Pages → Custom domains**. Because the zone is already in Cloudflare, it can create the DNS record and certificate there.

## Structure

The homepage is intentionally small: five offer sections framed by a header and footer. Authentication routes and scroll-animation dependencies have been removed.

## Attribution

This project started from [YusufCeng1z/sveltekit-tailwind-landing-page-template](https://github.com/YusufCeng1z/sveltekit-tailwind-landing-page-template), licensed under MIT.
