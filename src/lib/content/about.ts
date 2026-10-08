/** About page copy. Case stories come from work.ts entries that carry an anchor. */
export interface AboutSection {
	readonly id: string;
	readonly heading: string;
	readonly paragraphs: readonly string[];
}

export const about = {
	title: 'About | Danny McGiffin',
	description: 'Danny McGiffin is an independent tech advisor in Herndon, Virginia. He follows business problems across departments, systems, and incentives, and has no software, vendors, or commissions to sell.',
	imageAlt: 'About Danny McGiffin, Independent Tech Advisor. Something important is happening between the boxes on the org chart.',
	breadcrumb: 'About',
	eyebrow: 'About',
	heading: 'Something important is happening between the boxes on the org chart, and no specialist owns the whole thing.',
	portraitAlt: 'Danny McGiffin',
	lead: 'I’m Danny McGiffin, an independent tech advisor in Herndon, Virginia.',
	intro: 'I work directly with owners and senior leaders of growing businesses who need to see a situation clearly and decide what the business should actually change.',
	sections: [
		{
			id: 'arc-title',
			heading: 'How I got here',
			paragraphs: [
				'I started in Army logistics. From there I moved into consulting, then operations, enterprise systems, organizational design, and strategy.',
				'That sounds more eclectic than it feels. Each move followed the same problem into a new room: the thing that was going wrong didn’t belong to any one department, so nobody was in a position to fix it.',
				'So I follow the problem. Across departments, systems, incentives, and information. Wherever it actually goes.',
			],
		},
		{
			id: 'independent-title',
			heading: 'Why independent',
			paragraphs: [
				'I went independent to work directly with founders on things that matter, without having to worry about what partnership agreements were in place.',
				'When the right answer might be “keep what you have” or “fix the process first,” the person giving it can’t be paid by the answer.',
				'So I don’t sell software, represent vendors, take commissions, or accept referral fees. I don’t need the answer to be a purchase, not even of my services.',
				'You work with me directly. No junior team, no handoff after the first meeting.',
			],
		},
		{
			id: 'pattern-title',
			heading: 'The pattern',
			paragraphs: [
				'Finance sees reporting. Operations sees workarounds. IT sees systems. The vendor sees implementation. Leadership sees the cost.',
				'Usually, everybody is seeing something real. They’re just not seeing the whole thing.',
				'I follow the problem through the business: how the company makes money, who owns what, where information comes from, what the systems can actually represent, and what people have learned to work around.',
				'The interesting question is rarely “How do we fix this?” It’s “What is actually causing this?”',
				'Sometimes the answer is technology. Just as often, it’s process, incentives, authority, information, or organization.',
			],
		},
	] as readonly AboutSection[],
	workHeading: 'What that looks like',
	rolePrefix: 'My role: ',
	allWorkLabel: 'All case studies ↗',
	contactHeading: 'Let’s talk.',
	contactParagraphs: [
		'Technology should make the business easier to run. If yours doesn’t, let’s find out why.',
		'You don’t need to have the problem neatly framed. In fact, that’s often the point.',
	],
} as const;
