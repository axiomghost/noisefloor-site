# Noise Floor Site

Astro publication target for public technical writing.

## Purpose
This directory is the publishing target, not the drafting source of truth.

- Drafts begin in project-local `docs/projects/<project>/blog/`
- Approved publication packages are copied/adapted into the Astro content tree
- Public release remains explicit and approval-gated

## Intended Astro shape
- `src/content/blog/` — canonical publishable article entries
- `public/images/` — public assets used by articles
- `src/layouts/` — optional post/page layouts
- `src/content.config.ts` — Astro content collection schema

## Release discipline
Do not treat presence in this directory as permission to publish.
Prepare, preview, review, then stop for explicit signoff.
