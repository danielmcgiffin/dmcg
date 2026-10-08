/**
 * The four ways to work together, and every word on their /offers/<slug>/ pages.
 * Offer pages are linked from Contact and Work, not from primary navigation.
 */
export type OfferSlug = 'tech-audit' | 'second-opinion' | 'ai-opportunity' | 'data-connection';

export interface Offer {
	readonly slug: OfferSlug;
	readonly name: string;
	readonly href: string;
	readonly oneLiner: string;
	readonly price: string;
	readonly duration: string;
	/** Router phrases that used to lead from the homepage to this offer. Preserved, not currently rendered. */
	readonly triggers: readonly string[];
}

export const offers: readonly Offer[] = [
	{
		slug: 'tech-audit',
		name: 'Tech Audit',
		href: '/offers/tech-audit/',
		oneLiner: 'Discover what your software and subscriptions actually cost, how to make the most of what you have, and where to focus next.',
		price: '$5,000 fixed fee',
		duration: '10 business days',
		triggers: ['“I’m not even sure what we’re paying for anymore.”'],
	},
	{
		slug: 'second-opinion',
		name: 'Second Opinion',
		href: '/offers/second-opinion/',
		oneLiner: 'An independent call on a big system purchase or troubled implementation before you commit more money.',
		price: 'From $2,500, fixed quote',
		duration: '5 business days',
		triggers: ['“We need an ERP.”', '“The vendor says this is just how the system works.”', '“We’ve already spent too much for this not to work.”'],
	},
	{
		slug: 'ai-opportunity',
		name: 'AI Opportunity',
		href: '/offers/ai-opportunity/',
		oneLiner: 'A ranked map of where AI is worth the money in your business, and where it isn’t.',
		price: '$5,000 fixed fee',
		duration: '10 business days',
		triggers: ['“What could we actually use AI for?”'],
	},
	{
		slug: 'data-connection',
		name: 'Data Connection',
		href: '/offers/data-connection/',
		oneLiner: 'Connect the systems you already have so the numbers line up, without buying a new platform.',
		price: 'From $7,500, fixed quote',
		duration: 'Typically 3–6 weeks',
		triggers: ['“None of our systems talk to each other.”', '“We can’t trust our numbers.”'],
	},
];

export function offer(slug: OfferSlug): Offer {
	return offers.find((item) => item.slug === slug)!;
}

/** The services menu and trigger router removed from the homepage. Kept here so the copy isn't lost. */
export const offerMenu = {
	routerHeading: 'When you hear yourself saying…',
	servicesHeading: 'How we can work together',
	learnMoreLabel: 'Learn more ↗',
	/** The homepage hero sentence that named all four offers. */
	offersLine: (names: Record<OfferSlug, string>) =>
		`Whether you need a ${names['tech-audit']}, a ${names['second-opinion']}, an ${names['ai-opportunity']} assessment, or a ${names['data-connection']} project, we start with a free 30-minute introduction. We’ll discuss the business and its symptoms, then decide whether it’s worthwhile to dig deeper.`,
} as const;

type Pair = readonly [string, string];
type Triple = readonly [string, string, string];

export interface OfferMeta {
	readonly title: string;
	readonly description: string;
	readonly imageAlt: string;
}

/** Strings shared by every offer page built on the OfferPage skeleton. */
export const offerPageLabels = {
	breadcrumbHome: 'Home',
	heroGuarantee: 'Worth the fee or your money back',
	seeWhatYouGet: 'See what you get',
	heroSmall: 'Start with a free 30-minute conversation. You work directly with me.',
	independenceLabel: 'Independent advice',
	independence: ['No software to sell.', 'No commissions or referral fees.', 'No requirement that the answer be a purchase.'],
	symptomsEyebrow: 'Sound familiar?',
	outputEyebrow: 'What you get',
	processEyebrow: 'The engagement',
	processSubtitle: 'A clear path from question to answer.',
	proofEyebrow: 'From the work',
	proofMetrics: [
		{ value: '$2.45M+', label: 'Projected five-year ERP license + implementation path' },
		{ value: '~$50K', label: 'Estimated full implementation of the alternative I designed' },
	],
	proofLinkLabel: 'Read the full ERP case ↗',
	proofHref: '/work/erp-decision/',
	fitEyebrow: 'Is this for you?',
	fitTitle: 'Who this is for, and who it isn’t.',
	fitLabel: 'Probably a good fit',
	notFitLabel: 'Probably not the next step',
	offerSmall: ['Free 30-minute introduction.', 'Scope agreed before paid work begins.'],
	boundaryTitle: 'You keep the findings. You choose what happens next.',
	boundaryText: 'No software purchase, implementation contract, or continuing engagement is required. If the first conversation shows this would not help, I’ll tell you.',
	guaranteeEyebrow: 'The guarantee',
	guaranteeTitle: 'Worth the fee, or your money back.',
	faqEyebrow: 'Before we talk',
	faqTitle: 'A few practical questions.',
	closeEyebrow: 'Let’s talk',
	closeSmall: 'A free 30-minute conversation with Danny McGiffin.',
} as const;

export interface OfferPageContent extends OfferMeta {
	readonly headline: string;
	readonly emphasis: string;
	readonly deck: string;
	readonly guarantee?: string;
	readonly symptomsTitle: string;
	readonly symptoms: readonly Triple[];
	readonly symptomsNote?: string;
	readonly outputTitle: string;
	readonly outputIntro: string;
	readonly deliverables: readonly Pair[];
	readonly steps: readonly Pair[];
	readonly processNote: string;
	readonly proof?: { readonly title: string; readonly lead: string; readonly body: string; readonly small?: string };
	readonly fit: readonly string[];
	readonly notFit: readonly string[];
	readonly faqs: readonly Pair[];
	readonly closeTitle: string;
	readonly closeText: string;
}

const sensitive = 'We agree access and handling before work begins, including what can be shared, what should be redacted, and which tools are approved. Do not send confidential business records when booking the introductory call.';

export const offerPages: Record<Exclude<OfferSlug, 'ai-opportunity'>, OfferPageContent> = {
	'tech-audit': {
		title: 'Tech Audit | Danny McGiffin',
		description: 'A $5,000 fixed-fee Tech Audit. In 10 business days, find out what your software, subscriptions, and processes cost, what to keep, what to cut, and what to fix first.',
		imageAlt: 'Find out what your technology actually costs, and what it’s worth. Tech Audit with Danny McGiffin. $5,000 fixed fee, 10 business days.',
		headline: 'Find out what your technology',
		emphasis: 'actually costs, and what it’s worth.',
		deck: 'In 10 business days, I’ll inventory your software, subscriptions, and the processes around them, find the waste and the gaps, and give you a prioritized list of what to keep, cut, consolidate, or fix.',
		guarantee: 'Complete the audit and review the findings with me. If you don’t believe they’re worth the $5,000 fee, tell me within seven calendar days of the review. I’ll refund the full fee, and you keep the findings.',
		symptomsTitle: 'Technology spending that grew without a plan.',
		symptoms: [
			['Spend', 'The software bill keeps growing.', 'Subscriptions renew automatically, seats go unused, and nobody can say what each tool is for.'],
			['Overlap', 'Three tools do the same job.', 'Different teams bought their own answers. Now the data lives in all of them and agrees in none.'],
			['Workarounds', 'The real process lives in spreadsheets.', 'People export, re-key, and reconcile by hand because the systems don’t fit how the work actually happens.'],
			['Risk', 'One person knows how it all works.', 'Access, renewals, and integrations depend on someone who might leave or is already stretched thin.'],
		],
		symptomsNote: 'Most businesses don’t need more software. They need to know what they have and whether it’s pulling its weight.',
		outputTitle: 'A clear picture of what you have, and a plan for what to do about it.',
		outputIntro: 'Plain-English findings you can act on, with the numbers and reasoning behind each recommendation.',
		deliverables: [
			['The inventory', 'Every system and subscription, with its owner, cost, users, and renewal date, in one editable file.'],
			['The findings', 'What to keep, cut, consolidate, renegotiate, or fix, ranked by savings and effort.'],
			['The walkthrough', 'A working session with me to challenge the findings and agree who does what next.'],
		],
		steps: [
			['Kickoff', 'We agree the scope, the people I’ll talk with, and the access I need: invoices, admin consoles, and a few real examples of the work.'],
			['Inventory', 'I build a complete list of systems and subscriptions: what each costs, who uses it, what it’s for, and when it renews.'],
			['Follow the work', 'I talk with the people doing the work and trace how information moves between systems, where it gets re-keyed, and where it breaks.'],
			['Make the calls', 'We review the findings together: quick wins, bigger fixes, and what to leave alone. You keep the working files.'],
		],
		processNote: 'The 10 business days start at kickoff, once the agreed access is available. One business or business unit. Making the changes is separate work, and you’re free to do it yourself or with anyone you choose.',
		fit: [
			'You run an established business and the technology bill has grown without a clear plan.',
			'You suspect you’re paying for overlap, unused seats, or tools that don’t fit the work.',
			'You want an independent baseline before a renewal, a new hire, or a bigger technology decision.',
			'Someone has the authority to cancel, renegotiate, or change how the work is done.',
		],
		notFit: [
			'You need a cybersecurity or compliance audit. That calls for a specialist firm.',
			'You already know what to change and need someone to implement it.',
			'You want a list of new tools to buy.',
			'Nobody has time to show how the work actually happens.',
		],
		faqs: [
			['Is this a security audit?', 'No. I’ll flag obvious access and ownership risks I come across, like former employees with active accounts or a single administrator for a critical system. But a Tech Audit is about cost, fit, and how the work flows. If you need a security or compliance assessment, I’ll say so.'],
			['What do you need from us?', 'Recent invoices or card statements for software, admin access or a guided walkthrough of your main systems, and focused conversations with the people who use them. We agree the list before starting.'],
			['What if everything is fine?', 'Then you’ll know, with evidence, and the next budget or renewal conversation gets easier. That is a valid result.'],
			['Will you make the changes?', 'The audit stands on its own. If you want help connecting or cleaning up systems afterward, that’s a separate Data Connection project. There is no obligation to hire me for anything else.'],
			['How does the money-back guarantee work?', 'Give me the access we agree on and join the findings review. If you don’t believe the findings are worth the $5,000 fee, tell me within seven calendar days of that review. I’ll refund the full fee, and you keep the findings.'],
			['How do you handle sensitive information?', sensitive],
		],
		closeTitle: 'Find out what your technology is really costing you.',
		closeText: 'Tell me what you’re paying for, what feels off, or what renewal is coming up. We’ll decide whether an audit makes sense.',
	},
	'second-opinion': {
		title: 'Second Opinion | Danny McGiffin',
		description: 'An independent Second Opinion on an ERP, CRM, or other major system decision, from $2,500 with a fixed quote. In 5 business days, get a clear call: proceed, proceed with changes, or stop.',
		imageAlt: 'Before you commit, get an independent call. Second Opinion with Danny McGiffin. From $2,500, fixed quote, 5 business days.',
		headline: 'Before you commit,',
		emphasis: 'get an independent call.',
		deck: 'About to sign for an ERP, CRM, or other major system, or stuck in an implementation that keeps getting more expensive? In 5 business days, I’ll review the proposal, the business need, and the alternatives, and give you a clear decision: proceed, proceed with changes, or stop. I take no vendor commissions, referral fees, or resale margins.',
		guarantee: 'Complete the review and walk through the decision with me. If you don’t believe it’s worth the fee, tell me within seven calendar days of that meeting. I’ll refund the full fee, and you keep the findings.',
		symptomsTitle: 'An expensive decision that’s hard to reverse.',
		symptoms: [
			['The purchase', 'A big proposal is waiting for a signature.', 'The demo looked great. The price is large, the contract is long, and it’s hard to tell what you’re really getting.'],
			['The implementation', 'The project keeps getting more expensive.', 'Change orders, custom code, and slipping dates. Everyone says it will be worth it once it’s done.'],
			['The fit', '“That’s just how the system works.”', 'The software can’t represent how your business actually operates, and the answer is always another workaround.'],
			['The disagreement', 'Leadership sees three different problems.', 'Finance, operations, and IT each have a theory. The decision is expensive and hard to reverse.'],
		],
		outputTitle: 'A decision, not a report.',
		outputIntro: 'You get one of three calls, with the reasons and evidence behind it: proceed as planned, proceed with specific changes, or stop and take a different route.',
		deliverables: [
			['The decision', 'Proceed, proceed with changes, or stop, stated plainly with the reasons behind it.'],
			['The evidence', 'What I reviewed, what the proposal assumes, where it fits the business, and where it doesn’t.'],
			['The alternatives', 'If the answer is to change course, the most viable, least complicated options still open to you.'],
		],
		steps: [
			['Kickoff', 'We agree the decision at stake, and I collect the proposal, contract, requirements, change orders, and anything else on the table.'],
			['Review', 'I read the documents and test the proposal against how the business actually makes money and gets work done.'],
			['Talk to the people', 'Short conversations with the people who will live with the decision, and with the vendor if useful.'],
			['The call', 'We meet to walk through the decision and the reasons, and I answer the hard questions from your team.'],
		],
		processNote: 'The 5 business days start once the agreed documents and conversations are available. One decision per engagement. If the situation needs a larger review, like a full implementation rescue, I’ll say so and quote it separately before any additional work.',
		proof: {
			title: 'Sometimes the right call is to stop.',
			lead: 'At a PE-backed distributor, the ERP being implemented couldn’t represent the commercial relationships at the center of the business.',
			body: 'The five-year license was contracted at $1.25M. Implementation was estimated at $600K, then at least $1.2M with custom code. I recommended stopping. The CEO canceled the implementation, and I designed an alternative around systems the company already had.',
			small: 'About $350K had been paid when implementation stopped. These are projected costs and a design estimate, not a claim of realized savings.',
		},
		fit: [
			'You’re about to sign for a major system, or you’re partway through implementing one.',
			'The cost is large enough that being wrong would hurt.',
			'You want someone with no stake in the outcome to look at it.',
			'Someone has the authority to act on the answer, including stopping.',
		],
		notFit: [
			'You’ve already decided and want the purchase validated.',
			'You need an implementation partner rather than an independent view.',
			'The decision is small enough to reverse cheaply.',
			'The documents and people involved can’t be made available.',
		],
		faqs: [
			['Do you receive vendor commissions?', 'No. I have no vendor compensation or affiliations. I do not receive commissions, referral fees, or resale margins for recommending a product or provider.'],
			['Can you review an implementation already underway?', 'Yes. The question becomes whether the remaining work still serves the business result. I look at requirements, gaps, change orders, workarounds, and the cost of continuing versus changing course.'],
			['What if the answer is to proceed?', 'Then you proceed with confidence, usually with a short list of changes to the contract, scope, or plan that make success more likely.'],
			['Can the work end without a build?', 'Yes. Keeping the current tools, changing the process, renegotiating, or stopping can be the whole result. If you want help with what comes next, that’s separate.'],
			['How does the money-back guarantee work?', 'Share the documents and access we agree on and join the decision meeting. If you don’t believe the call is worth the fee, tell me within seven calendar days of that meeting. I’ll refund the full fee, and you keep the findings.'],
			['What happens in the first call?', 'It’s a free 30-minute introduction. We talk through the decision, what’s on the table, and whether a Second Opinion would help. No preparation is required.'],
		],
		closeTitle: 'Get an independent call before you commit.',
		closeText: 'Tell me what you’re deciding and what’s on the table. We’ll decide whether a Second Opinion makes sense.',
	},
	'data-connection': {
		title: 'Data Connection | Danny McGiffin',
		description: 'Connect the systems you already have so the numbers line up, without buying a new platform. Design and build from $7,500, with a fixed quote before work starts.',
		imageAlt: 'Connect what you have without buying a new system. Data Connection with Danny McGiffin. From $7,500, fixed quote.',
		headline: 'Connect what you have',
		emphasis: 'without buying a new system.',
		deck: 'When your systems don’t talk and the numbers don’t match, the usual pitch is a new platform. Often the better answer is to connect what you already have: clean up the data, link the systems, and build reporting you can trust. You get a fixed quote before work starts.',
		symptomsTitle: 'Systems that don’t talk. Numbers that don’t match.',
		symptoms: [
			['Re-keying', 'The same data gets typed in twice.', 'Orders, customers, and invoices are entered in one system and re-entered in another, with errors at every handoff.'],
			['Reporting', 'Month-end is a spreadsheet project.', 'Someone spends days pulling exports together, and the result still needs explaining.'],
			['Trust', 'Nobody agrees on the numbers.', 'Sales, finance, and operations each have a figure. None of them match.'],
			['Pressure', 'Someone is pushing an all-in-one platform.', 'A vendor says the fix is to replace everything. The price and the disruption are both enormous.'],
		],
		symptomsNote: 'Before going into an overhaul or another expensive subscription, it’s worth finding out what the systems you already pay for can do together.',
		outputTitle: 'Your systems, connected. Your numbers, reconciled.',
		outputIntro: 'A working connection between the systems you already use, built around the questions your business actually needs answered. This is where design and build work happens.',
		deliverables: [
			['The design', 'Which system is the source of truth for what, how data moves between them, and who owns each piece.'],
			['The build', 'Integrations, cleaned and normalized data, a governed data layer, and the reports or dashboards you need.'],
			['The handoff', 'Documentation and training so your team can run it, with no lock-in to me or any vendor.'],
		],
		steps: [
			['Scope', 'We agree the questions the business needs answered and the systems involved. You get a fixed quote before paid work begins.'],
			['Design', 'I map where each piece of data lives, where it breaks, and the simplest way to connect it.'],
			['Build', 'I build and test the connections, data layer, and reporting against real numbers your team already knows.'],
			['Hand off', 'Your team gets documentation, training, and a clear owner for each piece. Ongoing support is optional and separate.'],
		],
		processNote: 'Timing depends on the number of systems and the state of the data. Many projects start after a Tech Audit or Second Opinion, which makes the scope clear. If any new software is needed, you pay the provider directly; I don’t mark it up.',
		proof: {
			title: 'The alternative to a $2.45M ERP was connecting what they had.',
			lead: 'A PE-backed distributor needed trustworthy financial reporting. The ERP it bought couldn’t represent how the business worked.',
			body: 'Instead of finishing the ERP, I designed an alternative around QuickBooks, the existing operational systems, cleaned and normalized exports, a governed data layer, and analytics.',
			small: 'The ERP license had already been contracted, and about $350K had been paid when implementation stopped. These are projected costs and a design estimate, not a claim of realized savings.',
		},
		fit: [
			'Your data lives in several systems that don’t share it well.',
			'Reporting takes too much manual work and still isn’t trusted.',
			'You’d rather get more from what you have than replace it.',
			'Someone can own the result once it’s running.',
		],
		notFit: [
			'You need a full custom software application.',
			'Your core system genuinely can’t do the job. Start with a Second Opinion.',
			'You want an ongoing outsourced IT department.',
			'Nobody can give access to the systems and data involved.',
		],
		faqs: [
			['What does it cost?', 'Projects start at $7,500. After a short scoping conversation, you get a fixed quote tied to specific deliverables, so the price doesn’t grow with the hours.'],
			['What systems do you work with?', 'Common business tools: accounting systems like QuickBooks, CRMs, spreadsheets, operational and industry-specific systems, and the databases and reporting tools between them. If a system has no way to get data out, I’ll tell you early.'],
			['Who owns what you build?', 'You do. Accounts, data, code, and documentation live in your environment, not mine.'],
			['Do we need a Tech Audit first?', 'Not always. If the problem and the systems are clear, we can scope directly. If they aren’t, an audit is often the faster route to a sound quote.'],
			['What happens after handoff?', 'Your team runs it. If you want ongoing support or changes, we can agree that separately. There’s no requirement.'],
			['How do you handle sensitive information?', sensitive],
		],
		closeTitle: 'Get more from the systems you already pay for.',
		closeText: 'Tell me which systems you use and where the numbers break down. We’ll decide whether a Data Connection project makes sense.',
	},
};

/* AI Opportunity has its own layout. Strings containing markup are rendered with set:html. */

export interface AiSample {
	readonly label: string;
	readonly title: string;
	readonly status: string;
	readonly tone: 'go' | 'wait' | 'stop';
	readonly open?: boolean;
	readonly intro: string;
	/** The first sample's intro carries the lead-paragraph style. */
	readonly introLead?: boolean;
	readonly economics?: readonly Triple[];
	readonly record: readonly Pair[];
	readonly note?: string;
}

export const aiOpportunityPage = {
	title: 'AI Opportunity | Danny McGiffin',
	description: 'A $5,000 independent AI Opportunity assessment. In 10 business days, get a ranked opportunity map, clear economics, and a decision on what to test, investigate, or leave alone.',
	imageAlt: 'Figure out what AI is actually worth doing in your business. AI Opportunity assessment with Danny McGiffin. $5,000 fixed fee, 10 business days.',
	hero: {
		headlineHtml: 'Figure out what AI is <em>actually worth doing</em> in your business.',
		deck: 'In 10 business days, I’ll look across your business for places AI and related technology could create meaningful value, quantify the strongest opportunities, and tell you what to pursue, what to postpone, and what to ignore.',
		independence: ['No software to sell.', 'No platform partnerships.', 'No requirement that the answer involve AI.'],
	},
	tension: {
		eyebrow: 'The problem with the pitches',
		titleHtml: 'You’re probably missing opportunities.<br /><span>You’re also probably being pitched a lot of bullshit.</span>',
		voices: [
			['Your employees', '“We should use ChatGPT for this.”'],
			['Software companies', '“Our AI solves this.”'],
			['AI agencies', '“We can build this.”'],
		] as readonly Pair[],
		conclusion: 'You need someone whose business model permits the answer to be “none of those.”',
	},
	look: {
		eyebrow: 'Where the value might be',
		title: 'Start with work that is expensive, slow, or getting in the way.',
		opportunities: [
			['Senior time', 'Your most expensive people keep doing the same work.', 'Rebuilding proposals. Reviewing routine documents. Answering questions someone has answered before.'],
			['Decision speed', 'The answer exists. Getting to it takes too long.', 'Information scattered across systems, reports assembled by hand, decisions waiting on a spreadsheet.'],
			['Customer experience', 'Customers wait while your team hunts for an answer.', 'Slow quotes, repeated questions, missed follow-ups, and handoffs that make the customer do the work.'],
			['Capacity', 'More business means more work you can’t absorb.', 'Knowledge trapped with a few people, time-consuming intake, and repetitive steps between otherwise useful systems.'],
		] as readonly Triple[],
		note: 'Sometimes the best opportunity is to make the work disappear altogether.',
	},
	map: {
		eyebrow: 'What you get',
		titleHtml: 'A map of what’s worth doing.<br />And a call on what comes first.',
		intro: 'An opportunity register you can use, with the reasoning behind each recommendation. Expand the examples below to see the level of detail.',
		heading: 'Opportunity map',
		exampleLabel: 'Illustrative example',
		disclosure: 'Fictional business. Assumed figures. This shows the format of the assessment, not client findings or promised results.',
		bucketsLabel: 'Three decision categories',
		buckets: [
			{ tone: 'go', title: 'Do now', detail: 'A bounded test is justified.' },
			{ tone: 'wait', title: 'Investigate', detail: 'Resolve the missing evidence.' },
			{ tone: 'stop', title: 'Don’t bother', detail: 'A simpler answer wins.' },
		],
		samples: [
			{
				label: 'Opportunity 07 / Sales',
				title: 'Proposal development',
				status: 'Test now',
				tone: 'go',
				open: true,
				introLead: true,
				intro: 'Senior staff reconstruct proposals from prior work. Test an AI-assisted first draft using approved material, with a person responsible for every final proposal.',
				economics: [
					['Current annual labor cost', '~$87K', '20 hrs/week × $87/hr × 50 weeks'],
					['Capacity hypothesis', '8 hrs/week', '~$34.8K/year of staff time, if the test supports it'],
				],
				record: [
					['Value mechanism', 'Senior capacity and faster proposal turnaround. Freed time only creates value if the business can use it.'],
					['AI fit / difficulty', 'High / medium, subject to a test of draft quality and review effort.'],
					['Dependencies', 'Clean past proposals, approved qualifications and language, and a named reviewer.'],
					['Costs to establish', 'Tool licenses, content cleanup, setup, human review, and ongoing maintenance. Obtain a quote before committing to production.'],
					['Main risk', 'Invented qualifications or pricing. Keep pricing outside the draft generator and check every factual claim.'],
					['Build or buy', 'Test an existing tool with approved source material before considering custom software.'],
					['First experiment', '20 historical proposals, then a 30-day pilot. Compare total drafting and review time, factual errors, and approval rates against the current process.'],
					['Decision gate', 'Proceed only if total effort falls without worse quality. Otherwise revise the approach or stop.'],
				],
				note: 'All figures above are illustrative assumptions. Labor cost is not recoverable savings, and capacity value is before implementation and running costs. The pilot follows the assessment; it is not included in it.',
			},
			{
				label: 'Opportunity 12 / Customer service',
				title: 'Answers from internal knowledge',
				status: 'Investigate',
				tone: 'wait',
				intro: 'People spend time finding answers, but the source documents disagree. A faster answer is not useful if it is wrong.',
				record: [
					['Before a pilot', 'Name the content owner, reconcile conflicting guidance, and measure how often the questions recur.'],
					['Value / costs', 'Unquantified until search time, question volume, and content maintenance effort are measured.'],
					['Recommendation', 'Investigate the information problem first. Test AI retrieval only after the source material can support reliable answers.'],
				],
			},
			{
				label: 'Opportunity 18 / Finance',
				title: 'An AI agent for approval routing',
				status: 'Don’t bother',
				tone: 'stop',
				intro: 'Approval rules are fixed and already supported by the existing system. The delay comes from missing ownership.',
				record: [
					['Better next move', 'Assign an owner and configure the existing approval rules.'],
					['AI advantage', 'None established. An agent adds ongoing cost and another failure point.'],
					['Recommendation', 'Fix the handoff. Measure the resulting turnaround before spending on another tool.'],
				],
			},
		] as readonly AiSample[],
		deliverables: [
			['The working register', 'Ranked opportunities, assumptions, economics, dependencies, and recommendations in an editable file.'],
			['The decision brief', 'A concise account of what matters most, what to leave alone, and the first experiments worth running.'],
			['The walkthrough', 'A conversation with me to challenge the findings and decide who should do what next.'],
		] as readonly Pair[],
	},
	pressure: {
		eyebrow: 'How I make the call',
		title: 'Every opportunity has to stand up to the business.',
		dimensions: [
			['Business value', 'What changes in cost, capacity, revenue, quality, or speed? What evidence supports the estimate?'],
			['Feasibility', 'Do the information, systems, ownership, and skills needed to make it work actually exist?'],
			['AI advantage', 'Does AI do something useful here that a simpler rule, integration, or process change would not?'],
			['Full cost', 'What will the experiment, implementation, licenses, maintenance, and human review require?'],
			['Risk', 'What happens when it is wrong? Who catches the error, and who carries the consequences?'],
			['Three-sided impact', 'Does it work for the business, the people doing the work, and the customers on the receiving end?'],
		] as readonly Pair[],
	},
	proof: {
		eyebrow: 'Evidence of saying no',
		title: 'Sometimes the answer won’t be AI.',
		lead: 'One of the most valuable technology recommendations I’ve made was to stop implementing the technology.',
		body: 'A PE-backed distributor had purchased an ERP that could not represent how the business actually worked. I recommended stopping. The CEO canceled the implementation, and I designed an alternative around systems the company already had.',
		small: 'The ERP license had already been contracted, and about $350K had been paid when implementation stopped. These are projected costs and a design estimate, not a claim of realized savings.',
	},
	process: {
		titleHtml: '10 business days.<br />A set of decisions you can act on.',
		steps: [
			['01', 'Understand the business', 'We start with your goals, economics, and constraints. We agree the areas to examine and the people and information I’ll need.'],
			['02', 'Find the opportunities', 'I talk with the people doing the work and inspect workflows, systems, and examples. We look for value across the agreed scope.'],
			['03', 'Quantify and pressure-test', 'I estimate what the strongest opportunities are worth, what they require, and what could go wrong. Assumptions and missing evidence stay visible.'],
			['04', 'Make the calls', 'We review the opportunity map together: what to test first, what needs more evidence, and what to leave alone. You keep the working files.'],
		] as readonly Triple[],
		note: 'The 10 business days start at kickoff, once the agreed information and interview access are available. We agree the areas to review within one business or business unit before starting; if access is delayed or scope changes, we agree a revised schedule. Production builds and pilots are separate work.',
	},
	bio: {
		imageAlt: 'Danny McGiffin',
		eyebrow: 'Why work with me',
		title: 'I follow the problem through the business.',
		paragraphs: [
			'I’m Danny McGiffin. My work spans strategy, operations, systems, and organizational design. I’ve spent my career figuring out what actually needs to change before throwing technology at a problem. AI doesn’t change that rule.',
			'I built management and delivery systems during a firm’s growth from about $200K to $2M in recognized revenue. Working with Navy finance and payment experts, I helped build the measurement and controls behind a reported decline in estimated improper payments of roughly $250M from 2015–2019.',
		],
		small: 'Those are business and program outcomes I contributed to, not results from this AI assessment. The Navy figure is a decline in estimated improper payments, not recovered cash.',
		linkLabel: 'More about me and the work ↗',
	},
	fit: {
		title: 'A useful next step when the opportunity is real and the answer isn’t obvious.',
		fit: [
			'You run an established business with repeat work, expensive bottlenecks, or room to serve customers better.',
			'You want to know where AI is worth the investment before committing to tools or a build.',
			'You can involve the people doing the work and share examples of how it happens.',
			'Someone has the authority to act on the findings, including a recommendation to stop.',
		],
		notFit: [
			'You already have a defined specification and need someone to implement it.',
			'You want a general AI training session or a list of tools to try.',
			'You need someone to validate a purchase you have already decided to make.',
			'Nobody has time to show the work or responsibility for what happens afterward.',
		],
	},
	offerBlock: {
		eyebrow: 'AI Opportunity / fixed fee',
		titleHtml: '$5,000.<br />10 business days.',
		text: 'Business review, ranked opportunity register, decision brief, and a walkthrough with me. The work stands on its own.',
		small: 'One business or business unit, with review areas agreed before kickoff. Software, implementation, and pilots are outside this fee.',
		boundaryText: 'No software purchase, implementation contract, or continuing engagement is required. If the first conversation shows that an assessment would not help, I’ll tell you.',
	},
	guarantee: {
		text: 'Complete the assessment and review the findings with me. If you don’t believe the decisions and recommendations are worth the $5,000 fee, tell me within seven calendar days of the review. I’ll refund the full fee. You keep the findings.',
		small: 'Give me the access we agree on and join the findings review. You do not have to implement a recommendation or buy further work to use this guarantee.',
	},
	faqs: [
		['What does my team need to do?', 'An owner or executive needs to sponsor the work, make introductions, and join the kickoff and findings review. The people closest to the work take part in focused conversations and show real examples. We agree those conversations and access before starting.'],
		['Do we need clean data or an AI strategy already?', 'No. Messy information and unclear priorities are often why this is useful. I do need access to enough real work to distinguish an opportunity from a guess. If a prerequisite is missing, the recommendation will say what needs to change first.'],
		['Will you build or implement the recommendations?', 'This engagement ends with the assessment, priorities, and first experiments. Implementation, software, and ongoing support are separate. You can take the findings to your own team or another provider; there is no obligation to hire me for anything else.'],
		['What if AI is not worth doing?', 'That is a valid result. The assessment will explain why and identify the better next move, which may be a simpler process, clearer ownership, a conventional integration, or no project. I do not receive vendor commissions or referral fees.'],
		['Are the estimates guaranteed savings?', 'No. I distinguish measured costs from assumptions, freed capacity from cash savings, and an attractive hypothesis from a tested result. The first experiment is designed to find out whether the value survives contact with the real work.'],
		['How does the money-back guarantee work?', 'Give me the access we agree on and join the findings review. If you do not believe the decisions and recommendations are worth the $5,000 fee, tell me within seven calendar days of that review. I will refund the full fee, and you keep the findings. You do not need to implement a recommendation or buy further work to qualify.'],
		['How do you handle sensitive information?', sensitive],
	] as readonly Pair[],
	close: {
		title: 'Find out what AI is actually worth doing.',
		text: 'Tell me where the work gets stuck, what you’re considering, or what you suspect you might be missing. We’ll decide whether an assessment makes sense.',
	},
} as const;
