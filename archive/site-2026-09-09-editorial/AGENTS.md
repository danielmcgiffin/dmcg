# Repository Working Rules

## Layout

- The Astro website lives at the repository root.
- The prospecting lead agent lives at `prospecting/lead-agent`.
- Never create a repository-root `lead-agent` directory.

## Paths and Git worktrees

- Resolve repository-relative paths from `git rev-parse --show-toplevel`.
- Treat a Herdr checkout path such as `.herdr/worktrees/dmcg/<name>` as the root of a complete alternate checkout.
- Do not interpret a Herdr worktree or branch name as a directory inside the repository.
- Before editing, inspect `git status --short` and `git worktree list`.

## Change safety

- Preserve the Astro website unless the task explicitly requests website changes.
- Keep prospecting runtime files and secrets out of Git according to `.gitignore`.
- Do not create a real `prospecting/lead-agent/.env` from `.env.example` without explicit authorization.

## Website direction

- Read `README.md` before changing the website.
- The site thesis is “Magic is the Moat”: exceptional business experiences made repeatable by thoughtful machinery.
- Canonical art direction: `src/assets/workshop.png`. Private library, precision workshop, cinematic magical realism; no SaaS cards, fantasy imagery, or decorative animation libraries.
- Preserve real proof and institution privacy. Do not invent testimonials or present proposed essays as published writing.
- The commercial entry is a conversation, not a priced package.
- `archive/site-2026-09-09` is the unpublished pre-redesign snapshot.
