/** About page copy. Case stories come from work.ts entries that carry an anchor. */
export interface AboutSection {
	readonly id: string;
	readonly heading: string;
	readonly paragraphs: readonly string[];
}

export const about = {
	title: 'About | Danny McGiffin',
	description: 'Danny McGiffin is an independent management consultant in Herndon, Virginia. He follows business problems across departments, systems, and incentives, and has no software, vendors, or commissions to sell.',
	imageAlt: 'About Danny McGiffin, Independent Management Consultant. Background, work, and approach.',
	breadcrumb: 'About',
	eyebrow: 'About',
	heading: 'About Danny.',
	portraitAlt: 'Danny McGiffin',
	lead: 'I’m Danny McGiffin. I live and work in Northern Virginia, in the Washington, DC area.',
	intro: 'My work has taken me from Army logistics to consulting, company operations, and technology delivery. Today I work independently with owners and executives.',
	sections: [
    {
      id: 'arc-title',
      heading: 'How I got here',
      paragraphs: [
        'I started in Army logistics, where plans had to survive contact with people, equipment, time, and distance. I later moved into federal consulting, including work at IronArch Technology and Accenture Federal Services.',
        'As Director of Operations at Iberia Advisory, I helped build the management and delivery systems underneath a growing firm. At Mercer, I redesigned an operating model so practices had a reason to work together in the federal market.',
        'At Four Inc., I led a major technology deployment and then worked across finance, procurement, sales, operations, and reporting on enterprise systems and data. The work required both making decisions and taking responsibility for what happened next.',
      ],
    },
    {
      id: 'independent-title',
      heading: 'Why independent',
      paragraphs: [
        'I want to work directly with owners and executives on the things that matter to their businesses. You work with me, from the first conversation through the engagement.',
        'I don’t sell software, represent vendors, take commissions, or accept referral fees. My recommendations don’t have to lead to a technology purchase or another engagement.',
      ],
    },
    {
      id: 'pattern-title',
      heading: 'How I approach the work',
      paragraphs: [
        'I start with the business: where it’s trying to go, how it makes money, and how the work actually happens. Then I look at what’s getting in the way and what a practical answer would require.',
        'People, policies, incentives, processes, and technology all affect one another. I want to understand those relationships well enough to design a solution that works for the business, the people doing the work, and the customers it serves.',
      ],
    },
  ] as readonly AboutSection[],
	workHeading: 'What that looks like',
	rolePrefix: 'My role: ',
	allWorkLabel: 'All case studies ↗',
	contactHeading: 'Let’s talk.',
	contactParagraphs: [
		'If there’s something you’re trying to work through in your business, I’d like to hear about it.',
		'You don’t need to have the problem neatly framed yet.',
	],
} as const;
