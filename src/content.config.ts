import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
	loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishedAt: z.coerce.date(),
		draft: z.boolean().default(false),
		tags: z.array(z.string()).default([])
	})
});

export const collections = { writing };
