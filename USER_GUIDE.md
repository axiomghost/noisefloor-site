# Noise Floor Site — User Guide
https://axiomghost.github.io/noisefloor-site/

This site directory is the publication target for Noise Floor.

## Preferred workflow

Preferred operating model: ask Arthur to prepare and publish the article.

Examples:
- "Publish `docs/common/some-doc.md`"
- "Prepare this article for publication"
- "Sanitise and publish this post"

In the preferred workflow, Arthur handles:
- source review
- privacy/sensitivity screening
- tone softening where needed
- legal/ethical/compliance judgement
- publishable packaging
- site placement
- build validation
- publish execution

## Manual fallback workflow

The manual workflow is intentionally split into two steps:

1. **prepare** a source Markdown file into the site staging area
2. **publish** a reviewed staged file into the Astro content tree

This keeps raw source material out of the live site content directory until it
has passed through a basic safety filter and a human review.

## Script locations

Preparation script:
- `site/scripts/prepare-post.sh`

Publication script:
- `site/scripts/publish-post.sh`

## Step 1 — Prepare a source file

Run:

```bash
cd ~/.openclaw/workspace/site
./scripts/prepare-post.sh /absolute/path/to/source.md
```

What it does:

1. copies the source file into `site/staging/`
2. runs deterministic checks for obvious risky content
3. writes a warnings report beside the staged file
4. lightly masks certain obvious patterns (for example emails and local filesystem paths)

Outputs:
- staged Markdown file in `site/staging/`
- warnings report in `site/staging/`

Example:

```bash
cd ~/.openclaw/workspace/site
./scripts/prepare-post.sh /home/umar/.openclaw/workspace/docs/projects/ldpc-bg1/blog/review/2026-04-12-some-post.md
```

### Important limitation

The prepare script does **not** use AI.
It only performs deterministic detection and light masking.

That means it can help with obvious issues like:
- email addresses
- filesystem paths
- suspicious token/secret language
- URLs and host-like strings

But it does **not** reliably perform:
- tone softening
- legal judgement
- ethical/compliance judgement
- nuanced editorial rewrite

So the intended operating model is:
- the script prepares a staged version
- **you inspect `site/staging/`**
- then you decide whether to publish

## Step 2 — Publish a reviewed staged file

Once the staged file looks acceptable, run:

```bash
cd ~/.openclaw/workspace/site
./scripts/publish-post.sh /absolute/path/to/staged-file.md
```

What the publish script does:

1. copies the reviewed file into `site/src/content/blog/`
2. runs `npm run build`
3. stages the copied file in git
4. commits with a publish-style commit message
5. pushes to the current remote branch

Example:

```bash
cd ~/.openclaw/workspace/site
./scripts/publish-post.sh /home/umar/.openclaw/workspace/site/staging/2026-04-12-some-post.md
```

## Directory roles

### `site/staging/`
Use for:
- prepared candidate files waiting for review
- warnings reports from the prepare step

This is the inspection area.

### `site/src/content/blog/`
Use for:
- valid site-ready content entries only

Do not use it for:
- raw source drafts
- scratch notes
- half-reviewed material

## Summary of the workflow

### Preferred
Ask Arthur to prepare and publish the document.

### Manual fallback — Prepare
```bash
cd ~/.openclaw/workspace/site
./scripts/prepare-post.sh /absolute/path/to/source.md
```

### Manual fallback — Inspect
Review:
- `site/staging/<file>.md`
- `site/staging/<file>.warnings.txt`

### Manual fallback — Publish
```bash
cd ~/.openclaw/workspace/site
./scripts/publish-post.sh /absolute/path/to/staged-file.md
```

## Notes

- The preferred workflow is assistant-driven, not script-driven.
- The current manual prepare step is deterministic, not AI-driven.
- The current publish step assumes the site repo remote and push flow are already configured.
