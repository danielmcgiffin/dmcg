import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://dannymcgiffin.com',
	output: 'static',
	trailingSlash: 'always',
	build: {
		inlineStylesheets: 'always'
	},
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/workflow-review')
		})
	],
	redirects: {
		'/workflow-review': '/ai-opportunity-sprint'
	},
	vite: {
		plugins: [tailwindcss()]
	}
});
