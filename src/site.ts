// Shared site data and helpers for pages and layouts.
import { fileContent } from "./content.generated";
import { orderDiary } from "./diary-order";

export const SITE_TITLE = "noise-floor";
export const SITE_DESCRIPTION =
  "Engineering notes on signal processing, acoustic sensing and wireless systems, written as the work happens.";
export const SITE_URL = "https://axiomghost.github.io";
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Site path ("/log/x/") with the base path in front. */
export const href = (path: string) => `${BASE}${path}`;
/** Absolute URL for feeds and link previews. */
export const absolute = (path: string) => `${SITE_URL}${BASE}${path}`;

type Entry = (typeof fileContent.entries)[number] & {
  series?: string;
  series_order?: number;
  project_id?: string | null;
};

export const entries = (): Entry[] =>
  orderDiary(fileContent.entries.filter((e) => e.published) as Entry[]);

export const projects = () => fileContent.projects.filter((p) => p.published);

export const humanize = (slug: string) => {
  const words = slug.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const tagNames = new Map(fileContent.tags.map((t) => [t.slug, t.name]));
export const tagName = (slug: string) => tagNames.get(slug) ?? humanize(slug);

/** Every tag used by a published post or project, so each tag link has a page. */
export const allTags = () => {
  const used = new Set<string>();
  for (const e of entries()) for (const t of e.tags ?? []) used.add(t);
  for (const p of projects()) for (const t of p.tags ?? []) used.add(t);
  return [...used].sort();
};

export const formatDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(iso),
      )
    : null;

/** Reading time from the Markdown body: about 220 words a minute, code counted too. */
export const readingMinutes = (body: string) => {
  const words = body.replace(/\$\$[\s\S]*?\$\$/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

export const seriesOf = (entry: Entry) => {
  if (!entry.series) return null;
  const parts = (fileContent.entries as Entry[])
    .filter((e) => e.published && e.series === entry.series)
    .sort((a, b) => (a.series_order ?? 0) - (b.series_order ?? 0));
  const index = parts.findIndex((p) => p.slug === entry.slug);
  return {
    name: humanize(entry.series),
    parts,
    index,
    prev: index > 0 ? parts[index - 1] : undefined,
    next: index >= 0 && index < parts.length - 1 ? parts[index + 1] : undefined,
  };
};

export const projectOf = (entry: Entry) =>
  fileContent.projects.find((p) => p.published && p.id === entry.project_id);
