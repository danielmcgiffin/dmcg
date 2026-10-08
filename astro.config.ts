import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
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
			filter: (page) => !['/workflow-review/', '/ai-opportunity-sprint/', '/score-one-workflow/', '/advisory/', '/ai/', '/work/erp-second-opinion/', '/case-studies/', '/case-studies/erp-second-opinion/', '/case-studies/operating-model/', '/case-studies/growth/', '/case-studies/navy-improper-payments/', '/tech-audit/', '/second-opinion/', '/ai-opportunity/', '/data-connection/', '/northern-virginia-ai-workflow-automation/', '/404/'].some((route) => new URL(page).pathname === route)
		})
	],
	redirects: {
		'/workflow-review': '/still-on-tools/',
		'/ai-opportunity-sprint': '/still-on-tools/',
		'/score-one-workflow': '/still-on-tools/',
		'/advisory': '/offers/second-opinion/',
		'/ai': '/offers/ai-opportunity/',
		'/work/erp-second-opinion': '/work/erp-decision/',
		'/case-studies': '/work/',
		'/case-studies/erp-second-opinion': '/work/erp-decision/',
		'/case-studies/operating-model': '/work/operating-model/',
		'/case-studies/growth': '/work/growth/',
		'/case-studies/navy-improper-payments': '/work/navy-improper-payments/',
		'/tech-audit': '/offers/tech-audit/',
		'/second-opinion': '/offers/second-opinion/',
		'/ai-opportunity': '/offers/ai-opportunity/',
		'/data-connection': '/offers/data-connection/',
		'/northern-virginia-ai-workflow-automation': '/'
	}
});
