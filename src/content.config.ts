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

const proof = defineCollection({
	loader: glob({ base: './src/content/proof', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		metric_line: z.string().min(1),
		context: z.string().min(1),
		attribution: z.string().min(1)
	})
});

export const collections = { writing, proof };
