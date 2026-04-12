import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(true),
    audience: z.string().optional(),
    thesis: z.string().optional(),
    project: z.string().optional(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    canonicalURL: z.string().url().optional(),
  }),
});

export const collections = {
  blog,
};
