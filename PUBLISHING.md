# Publishing procedure

This is the procedure for publishing, updating or previewing a post on noise-floor
(https://axiomghost.github.io/noisefloor-site/). It is written for any agent: Claude Code,
Codex, another AI agent, or a person. The tools it needs are a shell, git, the GitHub CLI
`gh`, and a browser that can be set to phone width.

## Standing instruction from Umar (2026-11-24)

When Umar says a post should be published, the agent does the whole job and he does no manual
steps:

1. checks;
2. preview;
3. commit;
4. push;
5. a check of the live page.

His request is the permission to commit and push this repository for that post. Without such a
request, never push: pushing `main` deploys the site.

## Where things are

- **This repository:** Astro 5, GitHub Pages, base path `/noisefloor-site`. On Umar's Windows
  machine it is at `C:\Users\umarf\projects\noise-floor-site`. A push to `main` deploys through
  `.github/workflows/deploy.yml`.
- **Drafts:** they live in the project they belong to, for example
  `traffic_intersection/learn/posts/`. A published post is a copy in `content/log/<slug>.md`.
- **The pipeline:** `scripts/site.sh`. It runs in WSL, Linux or macOS and needs bash, rsync,
  node 22 or newer and npm. It builds in a mirror (`~/nf-build`), so a Windows checkout never
  needs Windows npm. Do not build in a Windows `node_modules`.
- **Calling it on Windows:** from PowerShell, or from any tool that runs Windows commands:

  ```
  wsl.exe -e bash /mnt/c/Users/umarf/projects/noise-floor-site/scripts/site.sh <command> '<post path>'
  ```

  From Git Bash, put `MSYS_NO_PATHCONV=1` in front, or the `/mnt/...` path gets mangled.
- **On Linux or macOS:** `scripts/site.sh <command> <post path>`.

| Command | Does |
|---|---|
| `check <post>` | Lint front matter, links, media, `$$` lines, privacy patterns. Exit 1 on errors. |
| `preview <post>` | check, sync the mirror, add the post as published, build, check the built page (KaTeX errors, broken internal links) |
| `serve` | Serve the last build on http://localhost:4329/noisefloor-site/ (long-running; start it in the background) |
| `stage <post>` | Copy the post into `content/log/<slug>.md` with `published: true`. An update keeps the first `published_at`. |
| `build` | Build the site as committed and check every page |

Post format: `content/README.md`. Maths and code: `USER_GUIDE.md`.

## Steps

1. **Find the post and read all of it.** If the request does not name a file clearly, look in
   the current project's posts folder. If two candidates fit, ask which one.
2. **Screen it as an editor.** Look for private or sensitive content: client names or data,
   people other than Umar, local paths, credentials, unpublished business plans, and anything a
   project's own rules keep out of public. Judge every `WARN` line from `check`.
3. **Run `preview` until it reports 0 errors.**
   - Fix **mechanical** problems in the source draft: front matter, slug, `$$` placement, link
     paths, a missing language on a code fence.
   - Also fix **rendering** problems: split a display equation that overflows a phone with
     `\begin{aligned}...\\...\end{aligned}`, or turn a plain-text symbol into `$k$`.
   - Never change wording, claims, numbers or tone. Those belong to Umar; report them instead.
   - Keep a list of every change for the report.
4. **Look at it.** Start `serve`. Open `/noisefloor-site/log/<slug>/` at desktop width and at
   375 px wide, and run this in the page's console:

   ```js
   await document.fonts.ready;
   ({ pageScroll: document.documentElement.scrollWidth > innerWidth,
      overflowingEquations: [...document.querySelectorAll('.katex-display')]
        .filter(e => e.scrollWidth > e.clientWidth + 1)
        .map(e => e.querySelector('annotation')?.textContent.slice(0, 60)),
      katexErrors: document.querySelectorAll('.katex-error').length,
      failedFonts: [...document.fonts].filter(f => f.status === 'error').length })
   ```

   All of these must be false, empty or 0. An equation that overflows goes back to step 3.
   Take a screenshot of the first maths and of a code block at 375 px, then stop the server.
5. **If only a preview was asked for, stop here** and report, with the screenshots.
6. **Publish.** Work in this repository:
   - Run `git status`, then `git pull --ff-only`.
   - Leave alone any uncommitted changes that are not yours, and say so in the report.
   - If the post uses `/media/...` files, copy them into `public/media/`.
   - Run `stage <post>`, then `build`, which must report 0 errors.
   - Commit only the post and its media. The subject is `Publish <title>` or `Update <title>`,
     plain, plus the attribution line the agent's own rules require.
   - Push with `git push origin main`.
7. **Watch the deploy, then check the live page.**
   - Find the run: `gh run list --repo axiomghost/noisefloor-site --limit 1`.
   - Wait once with `gh run watch <id> --repo axiomghost/noisefloor-site --exit-status`.
     Don't poll in a loop.
   - On failure, run `gh run view <id> --log-failed`, fix the problem, and push again.
   - Then open `https://axiomghost.github.io/noisefloor-site/log/<slug>/?v=<commit>` and check
     the title and the maths.
   - The `?v=<commit>` query skips the GitHub Pages cache, which serves the old copy for a few
     minutes after a deploy.
8. **Report briefly.**
   - The live URL, and the commit hash.
   - Your edits to the source draft, if any. The draft's own repository still needs them
     committed under that project's rules.
   - The warnings you judged harmless, and why.
   - The screenshots.

## Stop and ask

Ask Umar before going on when:

- **Private or sensitive content.** The screen in step 2 finds something that looks private or
  sensitive.
- **A fix needs new wording.** A check fails in a way only a change of wording, claims or
  numbers would fix.
- **The site's structure would change.** The post needs a new project page or a new tag in
  `content/tags.json`. That is a scope decision.
- **Someone else's changes.** Their uncommitted changes in this repository touch the files this
  publish would commit.
- **Unpublishing.** He asks to take a post down, which deletes public content. Confirm which
  post first.

## Maintaining the pipeline

`scripts/site.sh`, `scripts/check-post.mjs`, `scripts/check-dist.mjs` and `astro.config.mjs`
belong to the agent to maintain. When a publish shows a gap, such as a check that missed a real
problem:

- fix the script in the same session;
- test the fix on a planted bad post;
- commit it separately from the post;
- mention it in the report.

## New machine

1. Install WSL (on Windows), node 22 or newer, npm, rsync, git and the GitHub CLI.
2. Run `gh auth login` as axiomghost.
3. Clone `axiomghost/noisefloor-site`.
4. Run `scripts/site.sh build` once. It creates the mirror and installs packages from the
   lockfile.
