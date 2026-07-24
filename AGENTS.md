# Repository Working Rules

## Layout

- The SvelteKit website lives at the repository root.
- The prospecting lead agent lives at `prospecting/lead-agent`.
- Never create a repository-root `lead-agent` directory.

## Paths and Git worktrees

- Resolve repository-relative paths from `git rev-parse --show-toplevel`.
- Treat a Herdr checkout path such as `.herdr/worktrees/dmcg/<name>` as the root of a complete alternate checkout.
- Do not interpret a Herdr worktree or branch name as a directory inside the repository.
- Before editing, inspect `git status --short` and `git worktree list`.

## Change safety

- Preserve the SvelteKit website unless the task explicitly requests website changes.
- Keep prospecting runtime files and secrets out of Git according to `.gitignore`.
- Do not create a real `prospecting/lead-agent/.env` from `.env.example` without explicit authorization.
