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
			filter: (page) => !['/workflow-review/', '/ai-opportunity-sprint/', '/score-one-workflow/', '/404/'].some((route) => new URL(page).pathname === route)
		})
	],
	redirects: {
		'/workflow-review': '/still-on-tools/',
		'/ai-opportunity-sprint': '/still-on-tools/',
		'/score-one-workflow': '/still-on-tools/'
	},
	vite: {
		plugins: [tailwindcss()]
	}
});
