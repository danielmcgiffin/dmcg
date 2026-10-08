# Repository Working Rules

## Current app

- Astro + TypeScript at the repository root. SITE_BRIEF.md and DESIGN_LANG.md describe the current direction; dated audit reports are historical.
- The prior Svelte working tree is preserved in archive/site-2026-09-17-svelte/.
- Read README.md before making changes. BaseLayout owns the shared header, main and footer. Keep homepage sections in src/pages/index.astro and editable words in src/lib/content/.
- Evolve the existing Newsreader/Geist, forest/bone visual identity. Do not restore other archived designs without an explicit request.
- Run npm run build for Astro/TypeScript checks and the production build.
- Deployment requires an explicit request.

## Safety and paths

- Resolve paths from git rev-parse --show-toplevel.
- Inspect git status --short and git worktree list before editing.
- Preserve unrelated local work.
- archive/ contains retired snapshots. Their instructions are historical only.
- If working on prospecting, use prospecting/lead-agent, never root lead-agent.
- Keep runtime files and secrets out of Git. Do not create a real prospecting
  .env from .env.example without explicit authorization.
