/** Homepage copy, one export per section in src/lib/sections/home/. */
import { bookingUrl, CTA_LABEL } from '../../config';
import { DESCRIPTOR, HOME_DESCRIPTION, HOME_TITLE, PERSON_NAME } from '../../site';

export const homeMeta = {
	title: HOME_TITLE,
	description: HOME_DESCRIPTION,
	imageAlt: 'Straight answers about your business technology. Danny McGiffin, Business Advisor.',
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
	description: 'Honest answers about your business technology. For owners and leaders of growing businesses: simplify software spend, make good calls on new systems, make the most of the tools you already have, and figure out where AI can actually pay off.',
	portraitAlt: PERSON_NAME,
};

export interface SelectedWorkContent {
	readonly heading: string;
	readonly cardLinkLabel: string;
	readonly allLabel: string;
}

export const selectedWorkSection: SelectedWorkContent = {
	heading: 'Case studies',
	cardLinkLabel: 'Read the case ↗',
	allLabel: 'See all case studies ↗',
};

export interface WritingSectionContent {
	readonly heading: string;
	readonly intro: string;
	readonly allLabel: string;
}

export const writingSection: WritingSectionContent = {
	heading: '[TODO: writing heading]',
	intro: '[TODO: writing intro]',
	allLabel: '[TODO: writing index link label]',
};

export interface NextStepContent {
	readonly eyebrow: string;
	readonly heading: string;
	readonly body: string;
	readonly primaryLabel: string;
	readonly primaryHref: string;
	readonly secondaryLabel: string;
	readonly secondaryHref: string;
}

export const nextStep: NextStepContent = {
	eyebrow: 'Let’s talk',
	heading: 'Technology should make the business easier to run.',
	body: 'If yours doesn’t, let’s find out why. You don’t need to have the problem neatly framed.',
	primaryLabel: CTA_LABEL,
	primaryHref: bookingUrl('closing'),
	secondaryLabel: '[TODO: secondaryLabel]',
	secondaryHref: '/contact/',
};

/**
 * Homepage copy with no slot in the current structure. Kept verbatim so nothing is lost;
 * nothing renders it. The services menu and trigger router live in offers.ts.
 */
export const unplacedHomeCopy = {
	independence: 'I’m completely independent. I don’t sell software, take commissions, or need the answer to be a purchase (not even of my services).',
	aboutHeading: 'About me',
	about: [
		'<b>I help leaders make expensive technology decisions before they become expensive mistakes.</b>',
		'Most companies don’t need more tech sales. They need someone who can look at the business, the systems, the processes, the vendors, and the economics <em>together</em> and figure out what actually needs to change.',
		'Before working independently, I was a senior leader across strategy, operations, technology, and large transformation efforts, from the defense and tech industries to program management and operational design. The hardest problems don’t fit into one function. I follow them through the whole business.',
	],
	aboutLink: 'More about me ↗',
	featuredCase: {
		label: 'Case study',
		paragraphs: [
			'A PE-backed distributor had bought an ERP that couldn’t actually handle how it saw its business. The five-year license was contracted at $1.25M. The implementation estimate rose from $600K to at least $1.2M as more and more custom code requirements surfaced, putting the projected total at $2.45M or more, and when all was said and done, the system would <em>still</em> have required workarounds.',
			'I recommended the business stop the implementation. Then I designed an alternative around systems already in use, estimated at ~$50K (about 2% of the projected cost), that would accomplish their actual goal: better financial reporting.',
		],
		link: 'Read the ERP case ↗',
	},
} as const;
