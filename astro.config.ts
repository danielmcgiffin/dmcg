import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://dannymcgiffin.com',
	output: 'static',
	build: {
		inlineStylesheets: 'always'
	},
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()]
	}
});
