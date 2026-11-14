type DiaryEntry = {
  slug: string;
  published_at?: string | null;
  series?: string;
  series_order?: number;
};

export function orderDiary<T extends DiaryEntry>(entries: readonly T[]): T[] {
  const groups = new Map<string, { latest: string; entries: T[] }>();
  for (const entry of entries) {
    const key = entry.series ? `series:${entry.series}` : `entry:${entry.slug}`;
    const date = entry.published_at ?? "";
    const group = groups.get(key) ?? { latest: date, entries: [] };
    group.entries.push(entry);
    if (date > group.latest) group.latest = date;
    groups.set(key, group);
  }

  // Keep a series together in reading order, using its newest date in the feed.
  return [...groups.values()]
    .sort((a, b) => b.latest.localeCompare(a.latest))
    .flatMap(({ entries }) =>
      entries.sort(
        (a, b) =>
          (a.series_order ?? Infinity) - (b.series_order ?? Infinity) ||
          (b.published_at ?? "").localeCompare(a.published_at ?? ""),
      ),
    );
}
