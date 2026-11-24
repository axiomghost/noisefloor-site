# Noise Floor Site

Astro publication target for public technical writing:
https://axiomghost.github.io/noisefloor-site/

## Purpose
This repository is the publishing target, not the drafting source of truth.

- Drafts are written in the project they belong to.
- A published post is a copy in `content/log/<slug>.md`; projects are in `content/projects/`.
- Publishing happens when Umar asks for it ("publish <post>"). An AI agent then runs
  `PUBLISHING.md` end to end. `AGENTS.md` points agents there, and `USER_GUIDE.md` is the
  human guide.

## Shape
- `content/` — posts, project pages, tags and site settings (see `content/README.md`)
- `public/` — images, media and standalone interactive pages
- `src/` — Astro pages, layout and components
- `scripts/site.sh` — the WSL build, preview and publish pipeline
- `scripts/check-post.mjs`, `scripts/check-dist.mjs` — checks before and after the build

## Release discipline
Pushing `main` deploys. Nothing is pushed without Umar's request to publish.
