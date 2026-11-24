# Instructions for AI agents (Codex, Claude Code, others)

This repository is Umar's public site, noise-floor: https://axiomghost.github.io/noisefloor-site/

- **Publishing, updating or previewing a post:** follow `PUBLISHING.md` exactly. When Umar
  says "publish <post>", run the whole procedure, push included, without asking.
- **Pushing `main` deploys the live site.** Never push without his request to publish.
- **Builds:** run `scripts/site.sh` (WSL, Linux or macOS). On Windows never run npm or the
  build in this checkout's `node_modules`.
- **Writing format:** `content/README.md` (front matter) and `USER_GUIDE.md` (maths and code).
- **Base path:** the site is served under `/noisefloor-site/`. Markdown links like `/log/<slug>/`
  are rewritten automatically. Hand-written HTML pages in `public/` need relative links.
