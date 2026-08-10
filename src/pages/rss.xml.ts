import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
	const entries = (await getCollection('writing', ({ data }) => !data.draft))
		.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

	return rss({
		title: 'Danny McGiffin — Writing',
		description: 'Notes on work, systems, automation, and leverage.',
		site: context.site!,
		items: entries.map((entry) => ({
			title: entry.data.title,
			description: entry.data.description,
			pubDate: entry.data.publishedAt,
			link: `/writing/${entry.id}/`
		}))
	});
}
