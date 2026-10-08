/** Homepage copy. The full layout lives in src/pages/index.astro. */
import { bookingUrl, CTA_LABEL } from '../../config';
import { DESCRIPTOR, HOME_DESCRIPTION, HOME_TITLE, PERSON_NAME } from '../../site';

export const homeMeta = {
	title: HOME_TITLE,
	description: HOME_DESCRIPTION,
	imageAlt: 'Danny McGiffin, Business & Technology Advisor.',
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

export interface NextStepContent {
	readonly heading: string;
	readonly body: string;
	readonly primaryLabel: string;
	readonly primaryHref: string;
	readonly secondaryLabel: string;
	readonly secondaryHref: string;
}

const contactNote = { label: 'Or send me a note', href: '/contact/' } as const;

/** Booking and contact buttons shown directly under the homepage testimonial. */
export const testimonialCta = {
	primaryLabel: CTA_LABEL,
	primaryHref: bookingUrl('testimonial'),
	secondaryLabel: contactNote.label,
	secondaryHref: contactNote.href,
} as const;

export const nextStep: NextStepContent = {
	heading: 'What are you working on?',
	body: 'Tell me about the business and what you’re trying to do. You don’t need to have the problem neatly framed yet.',
	primaryLabel: CTA_LABEL,
	primaryHref: bookingUrl('closing'),
	secondaryLabel: contactNote.label,
	secondaryHref: contactNote.href,
};
