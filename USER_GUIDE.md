# Noise Floor Site — User Guide
https://axiomghost.github.io/noisefloor-site/

This repository is the publication target for Noise Floor. Drafts are written in the project
they belong to (for example `traffic_intersection/learn/posts/`). A published post lives in
`content/log/<slug>.md` here.

## Publishing a post

Tell an AI agent "publish <post>" (or "preview <post>" to see it first). The procedure is
`PUBLISHING.md`. Codex and other agents find it through `AGENTS.md`, and Claude Code through
its `publish-post` skill. The agent then runs the whole job:

1. reads and screens the draft (privacy, sensitive content);
2. checks and previews it, and fixes mechanical and rendering problems in the draft;
3. looks at it at desktop and phone width;
4. copies it into `content/log/`, commits `Publish <title>` and pushes `main`;
5. watches the GitHub Pages deploy and checks the live page.

It stops and asks only for private content, wording changes, a new project or tag, or
unpublishing. Updating a post works the same way: same slug, and the first publication date is
kept.

## The pipeline, by hand

Windows has no npm, so everything runs in WSL. `scripts/site.sh` mirrors the repository into
`~/nf-build` (a Linux folder with its own `node_modules`), and builds and serves from there.
GitHub Actions builds the live site from the same `package-lock.json`.

From a WSL shell:

```bash
S=/mnt/c/Users/umarf/projects/noise-floor-site/scripts/site.sh
$S check   /mnt/c/path/to/post.md   # lint front matter, links, media, maths lines, privacy patterns
$S preview /mnt/c/path/to/post.md   # build the site with this post added, check its page
$S serve                            # http://localhost:4329/noisefloor-site/
$S stage   /mnt/c/path/to/post.md   # copy into content/log/ as published, ready to commit
$S build                            # build the site as committed, check every page
```

Paths may also be Windows paths (`'C:\Users\...\post.md'`, in quotes). Then commit and push
from the repository as usual. Pushing `main` deploys.

`check` fails on:
- a missing field, or a bad slug;
- an unknown project;
- a `series` without `series_order`;
- an unclosed `$$` block;
- relative links;
- links to posts or `/media/` files that do not exist.

It warns on:
- tags missing from `content/tags.json`;
- `$$` not on its own line;
- email addresses, local paths, `localhost`, and secret-like words.

`preview` and `build` fail when KaTeX cannot typeset something, or when a built page links to
a file that does not exist.

## Front matter

See `content/README.md`. A draft can keep `published: false`. `stage` and `preview` set
`published: true` in the copy they write, and add today's `published_at` when it is missing.

## Writing maths and code in posts

Posts in `content/log/` and `content/projects/` are typeset at build time: KaTeX for maths,
Shiki for code. Nothing runs in the reader's browser and nothing loads from a CDN.

### Maths

- Inline: `$\tau = d\sin\theta / c$` inside a sentence.
- Display: `$$` on its own line, the equation, then `$$` on its own line:

  ```markdown
  $$
  \hat{\tau} = \arg\max_{\tau} R_{12}(\tau)
  $$
  ```

- The syntax is LaTeX maths as KaTeX supports it (`\frac`, `\int`, `\hat`, `\operatorname`,
  `\text{...}`, `\mathrm{m/s}`). There is no `\label`/`\ref` numbering and no custom
  preamble. A command KaTeX does not know shows in red, and `preview` reports it as an error.
- A literal dollar sign in prose needs a backslash: `it cost \$5`.
- Inside a table cell, `|` ends the cell, so write `\vert x \vert` or `\lvert x \rvert`
  instead of `|x|`.
- A phone column is about 310 px wide. A longer display equation scrolls sideways, so split it
  with `\begin{aligned} ... \\ ... \end{aligned}`.

### Code

Fence code with three backticks and a language name, and Shiki colours it:

````markdown
```python
tau = d * np.sin(theta) / c
```
````

- Common names: `python`, `bash`, `json`, `yaml`, `xml`, `cpp`, `matlab`, `text`.
  With no name the block stays uncoloured.
- Ligatures are off in all code, so `->`, `>=` and `!=` show exactly as typed.
- Long lines scroll inside the block. Keep lines under about 40 characters if phone readers
  should see whole lines.
