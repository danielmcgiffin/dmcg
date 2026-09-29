/** The four ways to work together. Navigation, the homepage and the offer pages all read from here. */
export interface Offer {
	readonly slug: 'tech-audit' | 'second-opinion' | 'ai-opportunity' | 'data-connection';
	readonly name: string;
	readonly href: string;
	readonly oneLiner: string;
	readonly price: string;
	readonly duration: string;
	/** Router phrases on the homepage that lead to this offer. */
	readonly triggers: readonly string[];
}

export const offers: readonly Offer[] = [
	{
		slug: 'tech-audit',
		name: 'Tech Audit',
		href: '/tech-audit/',
		oneLiner: 'Find out what your software, subscriptions, and processes actually cost, what to keep, and what to cut.',
		price: '$3,500 fixed fee',
		duration: '10 business days',
		triggers: ['“I’m not even sure what we’re paying for anymore.”'],
	},
	{
		slug: 'second-opinion',
		name: 'Second Opinion',
		href: '/second-opinion/',
		oneLiner: 'An independent call on a big system purchase or troubled implementation before you commit more money.',
		price: '$1,500 fixed fee',
		duration: '5 business days',
		triggers: ['“We need an ERP.”', '“The vendor says this is just how the system works.”', '“We’ve already spent too much for this not to work.”'],
	},
	{
		slug: 'ai-opportunity',
		name: 'AI Opportunity',
		href: '/ai-opportunity/',
		oneLiner: 'A ranked map of where AI is worth the money in your business, and where it isn’t.',
		price: '$5,000 fixed fee',
		duration: '10 business days',
		triggers: ['“What could we actually use AI for?”'],
	},
	{
		slug: 'data-connection',
		name: 'Data Connection',
		href: '/data-connection/',
		oneLiner: 'Connect the systems you already have so the numbers line up, without buying a new platform.',
		price: 'From $7,500, fixed quote',
		duration: 'Typically 3–6 weeks',
		triggers: ['“None of our systems talk to each other.”', '“We can’t trust our numbers.”'],
	},
];

export function offer(slug: Offer['slug']): Offer {
	return offers.find((item) => item.slug === slug)!;
}
