/**
 * Case studies share one format: context, expensive problem, what I found, decision, outcome.
 * Keep role and measurement boundaries explicit; the tests check them.
 * Every section renders only when its slot is filled.
 */
import type { OfferSlug } from './offers';
import type { TestimonialId } from './testimonials';

export interface WorkMetric {
	readonly value: string;
	readonly label: string;
}

export interface WorkEntry {
	readonly slug: string;
	/** Anchor kept on /about/ so older links still land on the teaser. Entries without one are not listed on About. */
	readonly anchor?: string;
	readonly title: string;
	/** Card and intro summary. */
	readonly summary: string;
	/** Optional single figure for the homepage card. */
	readonly metric?: string;
	/** Who the work was for, e.g. "PE-backed distributor". */
	readonly client?: string;
	readonly role?: string;
	/** Meta description. */
	readonly description: string;
	readonly ogImage: string;
	readonly context: readonly string[];
	readonly problem: readonly string[];
	readonly found?: readonly string[];
	readonly decision: readonly string[];
	readonly outcome: readonly string[];
	readonly metrics: readonly WorkMetric[];
	readonly note?: string;
	readonly principle?: string;
	readonly testimonial?: TestimonialId;
	/** The offer a reader facing the same situation should look at next. */
	readonly related?: OfferSlug;
}

export const work: readonly WorkEntry[] = [
	{
		slug: 'erp-decision',
		anchor: 'erp',
		title: 'The ERP we decided not to implement',
		client: 'PE-backed distributor',
		role: 'Found the system mismatch, recommended stopping, and designed a simpler route to trusted reporting.',
		summary: 'Stopped a misfit ERP rollout with a $2.45M+ projected path and designed an alternative estimated at ~$50K.',
		description: 'How a PE-backed distributor stopped a misfit ERP implementation with a projected $2.45M+ path and designed an alternative estimated at about $50K.',
		ogImage: '/og/case-erp-second-opinion.png',
		context: [
			'A PE-backed distributor wanted a faster monthly close, cleaner data, and financial reporting good enough for its board and new owners. By the time I joined, it had already bought an enterprise ERP and was partway through implementation.',
		],
		problem: [
			'The five-year license had been contracted at $1.25M. Implementation was originally estimated at $600K; the custom-code path would have brought that estimate to at least $1.2M. License plus revised implementation put the projected five-year path at $2.45M or more. That is a projection, not the amount the company paid.',
			'Even that path would have left extensive workarounds and a heavily customized system.',
		],
		found: [
			'The software modeled the company’s commercial relationships as simple two-party contracts. The actual arrangements involved multiple parties with different rights and responsibilities, which the ERP couldn’t represent cleanly.',
			'The implementation wasn’t the real problem. The project was implementing the wrong model of the business.',
		],
		decision: [
			'The question changed from “How do we finish implementing this?” to “Should we be implementing it at all?” I recommended that the CEO stop, and the project was canceled.',
			'I then designed an alternative around QuickBooks, existing operational systems, cleaned and normalized exports, a governed data layer, and analytics.',
		],
		outcome: [
			'The CEO canceled the implementation after about $350K had been paid. I designed an alternative using systems the company already had, with full implementation estimated at about $50K. That was roughly 2% of the projected $2.45M or more for the five-year ERP license-and-implementation path. The five-year license had already been contracted.',
		],
		metrics: [
			{ value: '$2.45M+', label: 'Projected five-year ERP license + implementation path' },
			{ value: '~$50K', label: 'Estimated full implementation of the alternative I designed' },
		],
		note: 'These are projected costs and a design estimate, not a claim of realized savings.',
		principle: 'Test whether a system can represent how the business actually works before committing more money to close its gaps.',
		related: 'second-opinion',
	},
	{
		slug: '64m-deployment',
		title: '[TODO: title for 64m-deployment]',
		summary: '[TODO: summary]',
		metric: '[TODO: metric]',
		description: '[TODO: meta description for 64m-deployment]',
		ogImage: '/og/default.png',
		context: ['[TODO: context]'],
		problem: ['[TODO: problem]'],
		decision: ['[TODO: decision]'],
		outcome: ['[TODO: outcome]'],
		metrics: [{ value: '[TODO: metric value]', label: '[TODO: metric label]' }],
	},
	{
		slug: 'negotiation-policy',
		title: '[TODO: title for negotiation-policy]',
		summary: '[TODO: summary]',
		metric: '[TODO: metric]',
		description: '[TODO: meta description for negotiation-policy]',
		ogImage: '/og/default.png',
		context: ['[TODO: context]'],
		problem: ['[TODO: problem]'],
		decision: ['[TODO: decision]'],
		outcome: ['[TODO: outcome]'],
		metrics: [{ value: '[TODO: metric value]', label: '[TODO: metric label]' }],
	},
	{
		slug: 'operating-model',
		anchor: 'collaboration',
		title: 'Redesigning an operating model that made collaboration irrational',
		client: 'Professional services',
		role: 'Redesigned the federal-market operating model and won executive approval for it.',
		summary: 'Redesigned incentives and ownership so practices had a reason to work together in the federal market.',
		description: 'How a professional-services firm redesigned its federal-market operating model so its commercial practices had a reason to collaborate.',
		ogImage: '/og/case-operating-model.png',
		context: [
			'A major professional-services firm wanted to grow in the federal market by bringing together expertise from its commercial practices. The strategy made sense.',
		],
		problem: [
			'The operating model made cooperation a bad deal. Federal business development, contracts, administration, and program management sat together, but delivery depended on specialists in the commercial practices.',
			'Those leaders faced lower payment, rigid staffing rules, extra overhead, and arguments over who got credit for the revenue.',
		],
		found: [
			'Leadership could ask everyone to collaborate harder. That would not change the economics. The issue was incentives and ownership, not effort or software.',
		],
		decision: [
			'I redesigned the model. The commercial practice owned the client relationship. Federal became the enabling layer: opportunity identification, contracting expertise, administrative tools, guidance, and program support where needed.',
			'Then we clarified client ownership, delivery responsibility, decision rights, shared costs, and support.',
		],
		outcome: [
			'The executive team approved the model and its potential use across related businesses.',
		],
		metrics: [],
		principle: 'If you want people to collaborate differently, change what makes their current behavior rational.',
	},
	{
		slug: 'growth',
		anchor: 'growth',
		title: 'Building the company underneath 10× growth',
		client: 'Professional services',
		role: 'Internal leadership and operating systems during tenfold firm growth.',
		summary: 'Built the management and delivery systems while recognized revenue grew about 10× and every employee stayed.',
		description: 'How a professional-services firm built the management and delivery systems to survive tenfold growth while keeping its whole team.',
		ogImage: '/og/case-growth.png',
		context: [
			'I was the first full-time person brought in to help build a professional-services firm. The founder had created the opportunity and remained the primary commercial relationship. My job was to help build the company underneath it.',
		],
		problem: [
			'Within a month, we inherited most of the team supporting our principal client and grew to eight or nine people almost overnight. Growth was not the hard part. Making the growth survivable was.',
		],
		found: [
			'The founder was carrying too much personally, and the firm needed consistent management, delivery, hiring, and reporting before the next wave of growth arrived.',
		],
		decision: [
			'I built a PMO and consistent delivery cadence, management structure across client teams, hiring and onboarding, reporting and automation, and operating routines that reduced how much the founder had to carry.',
			'One of the systems I cared most about was extremely low-tech: a monthly one-on-one between the CEO and every employee. No status agenda. No project review. Just a protected conversation between two people.',
		],
		outcome: [
			'Across the firm, recognized revenue grew from roughly $200K to $2M in about a year. The team grew from one person to 15, and we retained 100% of the team during that period. When I left, those conversations were still happening as the company approached 20 people.',
		],
		metrics: [],
		principle: 'A business needs to grow without destroying the things that made it worth growing in the first place.',
	},
	{
		slug: 'navy-improper-payments',
		anchor: 'navy',
		title: 'Making improper payments measurable and controllable',
		client: 'U.S. Navy',
		role: 'Helped build the measurement and controls behind a decline in estimated improper payments.',
		summary: 'Helped build the measurement and controls behind a roughly $250M decline in estimated improper payments.',
		description: 'How the U.S. Navy made improper payments measurable and controllable, with a roughly $250 million decline in estimated improper payments from 2015 to 2019.',
		ogImage: '/og/case-navy-improper-payments.png',
		context: [
			'When I began working on the Navy’s improper-payments program, there was a more fundamental problem than reducing improper payments.',
		],
		problem: [
			'We couldn’t reliably measure them. Before you can control a problem, you need to know where it happens, how often it happens, and why.',
		],
		found: [
			'The program needed its own machinery: a way to estimate the problem, find the points of leverage, and see whether controls were actually working.',
		],
		decision: [
			'Working with finance and payment experts, we built much of that machinery from scratch: statistical estimation models, risk assessments, sampling and review methods, pre-payment controls, training, local review activity, and reporting for leadership.',
		],
		outcome: [
			'From 2015 to 2019, internal program reporting showed roughly $250 million less in estimated improper payments. In a separate two-year comparison, underlying error rates fell by about 45%.',
			'The more interesting result was that an enormous, fuzzy problem became something people could see, investigate, and control.',
		],
		metrics: [],
		note: 'These are results across the program. The $250 million is a decline in estimated improper payments, not recovered cash.',
		principle: 'An enormous problem becomes much more tractable once you can measure it, find the causes, and put controls where they matter.',
	},
];

/** The three cards on the homepage, in order. */
export const selectedWorkSlugs = ['erp-decision', '64m-deployment', 'negotiation-policy'] as const;

export const selectedWork: readonly WorkEntry[] = selectedWorkSlugs.map((slug) => work.find((entry) => entry.slug === slug)!);

export const workHref = (slug: string) => `/work/${slug}/`;

export const workIndex = {
	title: 'Case Studies | Danny McGiffin',
	description: 'Four accounts of expensive business problems: what I found, what we decided, and what happened, from a $2.45M ERP path to a $250M decline in estimated improper payments.',
	imageAlt: 'Case studies: what I found, what we decided, and what happened. Danny McGiffin, Independent Tech Advisor.',
	breadcrumb: 'Case Studies',
	eyebrow: 'Case studies',
	heading: 'What I found, what we decided, and what happened.',
	deck: 'Each account follows the same format: the situation, the expensive problem, what I found, the decision, and the result. Roles and measurement limits are stated plainly.',
	cardLinkLabel: 'Read the case ↗',
} as const;

export const workDetailLabels = {
	titleSuffix: ' | Danny McGiffin',
	imageAlt: (title: string) => `${title}. A case study by Danny McGiffin, Independent Tech Advisor.`,
	eyebrow: 'Case study',
	eyebrowSeparator: ' / ',
	summaryLabel: 'Case summary',
	client: 'Client',
	role: 'My role',
	context: 'The situation',
	problem: 'The expensive problem',
	found: 'What I found',
	decision: 'The decision',
	outcome: 'The result',
	nextTitle: 'Facing something similar?',
	nextText: 'We start with a free 30-minute conversation about the business and what’s on the table.',
	relatedLink: (name: string) => `See the ${name} ↗`,
	moreLink: 'More case studies ↗',
} as const;
