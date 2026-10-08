/** Field Notes: the /writing/ index (Substack posts), article pages, and per-article next steps. */
import { bookingUrl, CTA_LABEL } from '../../config';
import posts from '../../data/substack-posts.json';

export interface FieldNote {
	readonly title: string;
	readonly publishedAt: string;
	readonly href: string;
}

/** Newest first, as synced from Substack. */
export const fieldNotes: readonly FieldNote[] = posts;

export function latestFieldNotes(count: number): readonly FieldNote[] {
	return fieldNotes.slice(0, count);
}

export const formatNoteDate = (publishedAt: string) =>
	new Date(`${publishedAt}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });

export const writingIndex = {
	title: 'Writing | Danny McGiffin',
	description: 'Built that Way: essays by Danny McGiffin on business technology, decisions, and how work actually gets done. Read and subscribe on Substack.',
	heading: 'Writing — Built that Way by Danny McGiffin',
	publicationAlt: 'Built that Way by Danny McGiffin. Read and subscribe at dannymcgiffin.substack.com.',
	listLabel: 'Substack articles',
} as const;

export const articleLabels = {
	titleSuffix: ' | Danny McGiffin',
	back: '← Writing/',
	byline: 'By',
	author: 'Danny McGiffin',
	bylineSeparator: ' · ',
	nextStepLabel: 'Next step',
	subscribeBefore: 'For more essays on business decisions and designing work, ',
	subscribeLink: 'subscribe on Substack ↗',
	subscribeAfter: '. I do not publish on a fixed schedule.',
} as const;

export interface ArticleNextStep {
	readonly title: string;
	readonly description: string;
	readonly primary: { readonly href: string; readonly label: string };
	readonly secondary: { readonly href: string; readonly label: string };
}

export const articleNextSteps: Record<string, ArticleNextStep> = {
	'your-vendor-already-told-you-what-it-doesnt-do': {
		title: 'Questioning a vendor proposal?',
		description: 'The ERP case shows what happened when we tested a system against the business it was meant to serve.',
		primary: { href: '/work/erp-decision/', label: 'Read the ERP case' },
		secondary: { href: '/offers/second-opinion/', label: 'See the Second Opinion' },
	},
	'your-company-keeps-books-on-the-money-and-nothing-else': {
		title: 'Where does your operational knowledge live?',
		description: 'If a cutover, AI pilot, or key departure depends on rules no one has written down, start with the decision and the work behind it.',
		primary: { href: bookingUrl('article-books'), label: CTA_LABEL },
		secondary: { href: '/offers/data-connection/', label: 'See Data Connection' },
	},
	'why-your-ai-initiative-is-a-failure': {
		title: 'More ideas than results?',
		description: 'We can look at the work you want to improve and whether AI belongs in the answer at all.',
		primary: { href: bookingUrl('article-ai'), label: CTA_LABEL },
		secondary: { href: '/offers/ai-opportunity/', label: 'See the AI Opportunity assessment' },
	},
	'the-300000-lesson': {
		title: 'Before the next operations hire',
		description: 'Clarify who owns the work, what decisions the role can make, and what needs to change around it.',
		primary: { href: '/offers/tech-audit/', label: 'See the Tech Audit' },
		secondary: { href: bookingUrl('article-ops-hire'), label: CTA_LABEL },
	},
};
