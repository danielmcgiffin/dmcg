# Danny McGiffin

Plain Svelte + Vite + TypeScript app. No SvelteKit or router.
The homepage states the work in the first screen: messy business problems no one
wants to own, for owners of small and mid-size companies, solved with the tools
already there — not a framework, deck, or packaged offer. Case results, an
architectural illustration, and Field Notes, About, and Talk navigation follow.
About and Teardown remain separate pages. Newsletter signup is pending a real
destination; Field Notes currently links to LinkedIn.

## Development

Use Node.js 24 and npm. `package-lock.json` is the lockfile used by CI.

- `npm ci` — install locked dependencies
- `npm run dev` — start Vite
- `npm run check` — Svelte and TypeScript checks
- `npm run build` — checks and production build into `dist/`
- `npm run preview` — preview the production build

Start in `src/App.svelte`; global styles are in `src/app.css`.
Scaffold based on the official Vite `svelte-ts` template: https://vite.dev/guide/.

## Project structure

- `src/App.svelte` — root component and development-only office preview
- `src/lib/components/Site.svelte` — shared shell, fullscreen menu, and simple page selection
- `src/lib/content.ts` — real work/writing collections, destinations, and supplied engraving lookup
- `src/lib/components/Homepage.svelte` — homepage narrative and supplied case results
- `src/lib/components/WorkGallery.svelte` — annotated gallery for approved case material
- `src/lib/components/BuildingHero.svelte` — layered SVG driven by one scroll progress value; reduced-motion mode shows the open drawing without animation
- `src/assets/office.svg` — retained editable office illustration with named object layers
- `src/assets/the-cube-layered.svg` — earlier hero artwork, retained as a separate file
- `src/app.css` — Tailwind CSS entry point and global styles
- `src/lib/components/` — reusable Svelte components; Bits UI is available for accessible primitives
- `src/lib/utils.ts` — `cn()` combines conditional classes and resolves Tailwind conflicts
- `public/` — static files served unchanged

Import shared code with `$lib`, for example `import { cn } from '$lib/utils'`.
The alias is configured in both Vite and TypeScript. Tailwind scans `src/` only,
so archived pages cannot add obsolete utilities to the production stylesheet.
Keep utility class names complete in source so Tailwind can detect them.

GitHub Actions runs a clean npm install and the production build on pull requests
and pushes to `main`. It does not deploy the app.

## Edit the illustration

Run `npm run art:edit` to open the working SVG in Inkscape. Save to update Vite.
Open `/?edit=office` on the dev server to inspect the exterior-image reveal.
Run `npm run art:check` to verify the layer structure (Python 3 required).
See [Editing the office](docs/EDITING_OFFICE.md) for trees, tables, stairs, and openings.

## Homepage design

See [Homepage design](docs/HOMEPAGE_DESIGN.md) for the current scope, asset
requirements and content handoff. Fonts are hosted locally. The office
preview and its large assets are excluded from the production homepage bundle.

## Archives

- `archive/site-2026-09-09-editorial/`: complete editorial working source,
  experiments, assets, writing, documentation, and old configuration.
  `SHA256.json` records checksums; `ARCHIVE.md` explains restoration.
- `archive/site-2026-09-09/`: earlier pre-redesign snapshot.

Archives are historical references, excluded from the new app's build and checks.
Old deployment configuration is archived; this starter has not been deployed.
