/** Homepage copy. The full layout lives in src/pages/index.astro. */
import { bookingUrl, CTA_LABEL } from '../../config';
import { DESCRIPTOR, HOME_DESCRIPTION, HOME_TITLE, PERSON_NAME } from '../../site';

export const homeMeta = {
	title: HOME_TITLE,
	description: HOME_DESCRIPTION,
	imageAlt: 'Danny McGiffin, Independent Management Consultant.',
} as const;

export interface IdentityContent {
	readonly name: string;
	readonly title: string;
	readonly description: string;
	readonly portraitAlt: string;
}

export const identity: IdentityContent = {
	name: PERSON_NAME,
	title: DESCRIPTOR,
	description: 'I work with owners and executives to understand what’s getting in the way of their business, design practical solutions, and carry the changes through.',
	portraitAlt: PERSON_NAME,
};

export interface SelectedWorkContent {
	readonly heading: string;
	readonly cardLinkLabel: string;
	readonly allLabel: string;
}

export const selectedWorkSection: SelectedWorkContent = {
	heading: 'Selected work',
	cardLinkLabel: 'Read the case ↗',
	allLabel: 'See all case studies ↗',
};

export interface WritingSectionContent {
	readonly heading: string;
	readonly intro: string;
	readonly allLabel: string;
}

export const writingSection: WritingSectionContent = {
	heading: 'Writing',
	intro: 'Essays on how businesses work, how they could work better, and what we ask of technology.',
	allLabel: 'More writing',
};

export interface NextStepContent {
	readonly heading: string;
	readonly body: string;
	readonly primaryLabel: string;
	readonly primaryHref: string;
	readonly secondaryLabel: string;
	readonly secondaryHref: string;
}

export const nextStep: NextStepContent = {
	heading: 'What are you working on?',
	body: 'Tell me about the business and what you’re trying to do. You don’t need to have the problem neatly framed yet.',
	primaryLabel: CTA_LABEL,
	primaryHref: bookingUrl('closing'),
	secondaryLabel: 'Or send me a note',
	secondaryHref: '/contact/',
};
