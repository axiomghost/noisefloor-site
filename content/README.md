# File-based publishing

When `CONTENT_SOURCE=file`, published content comes from this directory instead of Supabase.

- `settings.json` controls the site name and description.
- `projects/*.md` defines project pages.
- `log/*.md` defines Diary entries (the folder name stays `log` for compatibility).
- `tags.json` defines the shared tag taxonomy used to filter projects and Diary entries.
- Put images and videos in `public/media/`, then reference them in front matter with a JSON `media` array.

Every Markdown file needs front matter between `---` markers. Example:

```md
---
title: A short title
slug: a-short-title
summary: One sentence for cards and metadata.
type: post
project: acoustic-localization
tags: [statistical-signal-processing]
published: true
published_at: 2026-08-29T12:00:00.000Z
media: [{"path":"/media/example.jpg","kind":"image","caption":"Example"}]
---

Write the article body here.
```

Run `pnpm run generate:content` after adding or changing content. The GitHub Actions workflow runs it automatically before building.

## Adding a project and its entries

Create a project in GitHub under `content/projects/your-project-slug.md`:

```md
---
name: Statistical signal processing
slug: statistical-signal-processing
summary: Methods and experiments for extracting signal from noisy measurements.
status: building
published: true
sort_order: 20
---

Describe the project here.
```

Create a related Diary entry under `content/log/your-entry-slug.md` and set its
`project` field to the exact project slug:

```md
---
title: A first note on the project
slug: first-note-on-the-project
summary: What this entry covers.
type: post
project: statistical-signal-processing
tags: [statistical-signal-processing]
published: true
published_at: 2026-08-29T20:00:00.000Z
media: []
---

Write or paste the complete Markdown article here.
```

To create a file through GitHub, open the repository, choose **Add file →
Create new file**, enter the path and filename, paste the Markdown, and commit
directly to `main`. For an existing local file, use **Add file → Upload files**
and commit to `main`. Cloudflare then rebuilds and publishes the site.
