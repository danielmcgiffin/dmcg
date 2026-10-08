/** Page copy and commercial terms. Edit one offer here; all four use OfferPage. */
export type OfferSlug = 'tech-audit' | 'second-opinion' | 'ai-opportunity' | 'data-connection';
type Pair = readonly [string, string];
export interface Offer {
 readonly slug: OfferSlug;
 readonly name: string;
 readonly href: string;
 readonly oneLiner: string;
 readonly price: string;
 readonly duration: string;
}
export interface OfferPageContent {
 readonly title: string;
 readonly description: string;
 readonly imageAlt: string;
 readonly headline: string;
 readonly deck: string;
 readonly deliverables: readonly Pair[];
 readonly steps: readonly Pair[];
 readonly processNote: string;
 readonly fit: readonly string[];
 readonly notFit: readonly string[];
 readonly guarantee?: string;
 readonly faqs: readonly Pair[];
 readonly proof?: { readonly title: string; readonly lead: string; readonly body: string; readonly small?: string };
}

export const offers: readonly Offer[] = [
  {
    "slug": "tech-audit",
    "name": "Tech Audit",
    "href": "/offers/tech-audit/",
    "oneLiner": "Discover what your software and subscriptions actually cost, how to make the most of what you have, and where to focus next.",
    "price": "$5,000 fixed fee",
    "duration": "10 business days"
  },
  {
    "slug": "second-opinion",
    "name": "Second Opinion",
    "href": "/offers/second-opinion/",
    "oneLiner": "An independent call on a big system purchase or troubled implementation before you commit more money.",
    "price": "From $2,500, fixed quote",
    "duration": "5 business days"
  },
  {
    "slug": "ai-opportunity",
    "name": "AI Opportunity",
    "href": "/offers/ai-opportunity/",
    "oneLiner": "A ranked map of where AI is worth the money in your business, and where it isn’t.",
    "price": "$5,000 fixed fee",
    "duration": "10 business days"
  },
  {
    "slug": "data-connection",
    "name": "Data Connection",
    "href": "/offers/data-connection/",
    "oneLiner": "Connect the systems you already have so the numbers line up, without buying a new platform.",
    "price": "From $7,500, fixed quote",
    "duration": "Typically 3–6 weeks"
  }
];

export const offerPages: Record<OfferSlug, OfferPageContent> = {
  "tech-audit": {
    "title": "Tech Audit | Danny McGiffin",
    "description": "A $5,000 fixed-fee Tech Audit. In 10 business days, find out what your software, subscriptions, and processes cost, what to keep, what to cut, and what to fix first.",
    "imageAlt": "Find out what your technology actually costs, and what it’s worth. Tech Audit with Danny McGiffin. $5,000 fixed fee, 10 business days.",
    "headline": "Find out what your technology actually costs, and what it’s worth.",
    "deck": "In 10 business days, I’ll inventory your software, subscriptions, and the processes around them, find the waste and the gaps, and give you a prioritized list of what to keep, cut, consolidate, or fix.",
    "deliverables": [
      ["The inventory", "Every system and subscription, with its owner, cost, users, and renewal date, in one editable file."],
      ["The findings", "What to keep, cut, consolidate, renegotiate, or fix, ranked by savings and effort."],
      ["The walkthrough", "A working session with me to challenge the findings and agree who does what next."]
    ],
    "steps": [
      ["Kickoff", "We agree the scope, the people I’ll talk with, and the access I need: invoices, admin consoles, and a few real examples of the work."],
      ["Inventory", "I build a complete list of systems and subscriptions: what each costs, who uses it, what it’s for, and when it renews."],
      ["Follow the work", "I talk with the people doing the work and trace how information moves between systems, where it gets re-keyed, and where it breaks."],
      ["Make the calls", "We review the findings together: quick wins, bigger fixes, and what to leave alone. You keep the working files."]
    ],
    "processNote": "The 10 business days start at kickoff, once the agreed access is available. One business or business unit. Making the changes is separate work, and you’re free to do it yourself or with anyone you choose.",
    "fit": [
      "You run an established business and the technology bill has grown without a clear plan.",
      "You suspect you’re paying for overlap, unused seats, or tools that don’t fit the work.",
      "You want an independent baseline before a renewal, a new hire, or a bigger technology decision.",
      "Someone has the authority to cancel, renegotiate, or change how the work is done."
    ],
    "notFit": [
      "You need a cybersecurity or compliance audit. That calls for a specialist firm.",
      "You already know what to change and need someone to implement it.",
      "You want a list of new tools to buy.",
      "Nobody has time to show how the work actually happens."
    ],
    "guarantee": "Complete the audit and review the findings with me. If you don’t believe they’re worth the $5,000 fee, tell me within seven calendar days of the review. I’ll refund the full fee, and you keep the findings.",
    "faqs": [
      ["Is this a security audit?", "No. I’ll flag obvious access and ownership risks I come across, like former employees with active accounts or a single administrator for a critical system. But a Tech Audit is about cost, fit, and how the work flows. If you need a security or compliance assessment, I’ll say so."],
      ["What do you need from us?", "Recent invoices or card statements for software, admin access or a guided walkthrough of your main systems, and focused conversations with the people who use them. We agree the list before starting."],
      ["What if everything is fine?", "Then you’ll know, with evidence, and the next budget or renewal conversation gets easier. That is a valid result."],
      ["Will you make the changes?", "The audit stands on its own. If you want help connecting or cleaning up systems afterward, that’s a separate Data Connection project. There is no obligation to hire me for anything else."],
      ["How do you handle sensitive information?", "We agree access and handling before work begins, including what can be shared, what should be redacted, and which tools are approved. Do not send confidential business records when booking the introductory call."]
    ]
  },
  "second-opinion": {
    "title": "Second Opinion | Danny McGiffin",
    "description": "An independent Second Opinion on an ERP, CRM, or other major system decision, from $2,500 with a fixed quote. In 5 business days, get a clear call: proceed, proceed with changes, or stop.",
    "imageAlt": "Before you commit, get an independent call. Second Opinion with Danny McGiffin. From $2,500, fixed quote, 5 business days.",
    "headline": "Before you commit, get an independent call.",
    "deck": "About to sign for an ERP, CRM, or other major system, or stuck in an implementation that keeps getting more expensive? In 5 business days, I’ll review the proposal, the business need, and the alternatives, and give you a clear decision: proceed, proceed with changes, or stop. I take no vendor commissions, referral fees, or resale margins.",
    "deliverables": [
      ["The decision", "Proceed, proceed with changes, or stop, stated plainly with the reasons behind it."],
      ["The evidence", "What I reviewed, what the proposal assumes, where it fits the business, and where it doesn’t."],
      ["The alternatives", "If the answer is to change course, the most viable, least complicated options still open to you."]
    ],
    "steps": [
      ["Kickoff", "We agree the decision at stake, and I collect the proposal, contract, requirements, change orders, and anything else on the table."],
      ["Review", "I read the documents and test the proposal against how the business actually makes money and gets work done."],
      ["Talk to the people", "Short conversations with the people who will live with the decision, and with the vendor if useful."],
      ["The call", "We meet to walk through the decision and the reasons, and I answer the hard questions from your team."]
    ],
    "processNote": "The 5 business days start once the agreed documents and conversations are available. One decision per engagement. If the situation needs a larger review, like a full implementation rescue, I’ll say so and quote it separately before any additional work.",
    "fit": [
      "You’re about to sign for a major system, or you’re partway through implementing one.",
      "The cost is large enough that being wrong would hurt.",
      "You want someone with no stake in the outcome to look at it.",
      "Someone has the authority to act on the answer, including stopping."
    ],
    "notFit": [
      "You’ve already decided and want the purchase validated.",
      "You need an implementation partner rather than an independent view.",
      "The decision is small enough to reverse cheaply.",
      "The documents and people involved can’t be made available."
    ],
    "guarantee": "Complete the review and walk through the decision with me. If you don’t believe it’s worth the fee, tell me within seven calendar days of that meeting. I’ll refund the full fee, and you keep the findings.",
    "faqs": [
      ["Do you receive vendor commissions?", "No. I have no vendor compensation or affiliations. I do not receive commissions, referral fees, or resale margins for recommending a product or provider."],
      ["Can you review an implementation already underway?", "Yes. The question becomes whether the remaining work still serves the business result. I look at requirements, gaps, change orders, workarounds, and the cost of continuing versus changing course."],
      ["What if the answer is to proceed?", "Then you proceed with confidence, usually with a short list of changes to the contract, scope, or plan that make success more likely."],
      ["Can the work end without a build?", "Yes. Keeping the current tools, changing the process, renegotiating, or stopping can be the whole result. If you want help with what comes next, that’s separate."],
      ["What happens in the first call?", "It’s a free 30-minute introduction. We talk through the decision, what’s on the table, and whether a Second Opinion would help. No preparation is required."]
    ],
    "proof": {
      "title": "Sometimes the right call is to stop.",
      "lead": "At a PE-backed distributor, the ERP being implemented couldn’t represent the commercial relationships at the center of the business.",
      "body": "The five-year license was contracted at $1.25M. Implementation was estimated at $600K, then at least $1.2M with custom code. I recommended stopping. The CEO canceled the implementation, and I designed an alternative around systems the company already had.",
      "small": "About $350K had been paid when implementation stopped. These are projected costs and a design estimate, not a claim of realized savings."
    }
  },
  "data-connection": {
    "title": "Data Connection | Danny McGiffin",
    "description": "Connect the systems you already have so the numbers line up, without buying a new platform. Design and build from $7,500, with a fixed quote before work starts.",
    "imageAlt": "Connect what you have without buying a new system. Data Connection with Danny McGiffin. From $7,500, fixed quote.",
    "headline": "Connect what you have without buying a new system.",
    "deck": "When your systems don’t talk and the numbers don’t match, the usual pitch is a new platform. Often the better answer is to connect what you already have: clean up the data, link the systems, and build reporting you can trust. You get a fixed quote before work starts.",
    "deliverables": [
      ["The design", "Which system is the source of truth for what, how data moves between them, and who owns each piece."],
      ["The build", "Integrations, cleaned and normalized data, a governed data layer, and the reports or dashboards you need."],
      ["The handoff", "Documentation and training so your team can run it, with no lock-in to me or any vendor."]
    ],
    "steps": [
      ["Scope", "We agree the questions the business needs answered and the systems involved. You get a fixed quote before paid work begins."],
      ["Design", "I map where each piece of data lives, where it breaks, and the simplest way to connect it."],
      ["Build", "I build and test the connections, data layer, and reporting against real numbers your team already knows."],
      ["Hand off", "Your team gets documentation, training, and a clear owner for each piece. Ongoing support is optional and separate."]
    ],
    "processNote": "Timing depends on the number of systems and the state of the data. Many projects start after a Tech Audit or Second Opinion, which makes the scope clear. If any new software is needed, you pay the provider directly; I don’t mark it up.",
    "fit": [
      "Your data lives in several systems that don’t share it well.",
      "Reporting takes too much manual work and still isn’t trusted.",
      "You’d rather get more from what you have than replace it.",
      "Someone can own the result once it’s running."
    ],
    "notFit": [
      "You need a full custom software application.",
      "Your core system genuinely can’t do the job. Start with a Second Opinion.",
      "You want an ongoing outsourced IT department.",
      "Nobody can give access to the systems and data involved."
    ],
    "faqs": [
      ["What does it cost?", "Projects start at $7,500. After a short scoping conversation, you get a fixed quote tied to specific deliverables, so the price doesn’t grow with the hours."],
      ["What systems do you work with?", "Common business tools: accounting systems like QuickBooks, CRMs, spreadsheets, operational and industry-specific systems, and the databases and reporting tools between them. If a system has no way to get data out, I’ll tell you early."],
      ["Who owns what you build?", "You do. Accounts, data, code, and documentation live in your environment, not mine."],
      ["Do we need a Tech Audit first?", "Not always. If the problem and the systems are clear, we can scope directly. If they aren’t, an audit is often the faster route to a sound quote."],
      ["What happens after handoff?", "Your team runs it. If you want ongoing support or changes, we can agree that separately. There’s no requirement."],
      ["How do you handle sensitive information?", "We agree access and handling before work begins, including what can be shared, what should be redacted, and which tools are approved. Do not send confidential business records when booking the introductory call."]
    ],
    "proof": {
      "title": "The alternative to a $2.45M ERP was connecting what they had.",
      "lead": "A PE-backed distributor needed trustworthy financial reporting. The ERP it bought couldn’t represent how the business worked.",
      "body": "Instead of finishing the ERP, I designed an alternative around QuickBooks, the existing operational systems, cleaned and normalized exports, a governed data layer, and analytics.",
      "small": "The ERP license had already been contracted, and about $350K had been paid when implementation stopped. These are projected costs and a design estimate, not a claim of realized savings."
    }
  },
  "ai-opportunity": {
    "title": "AI Opportunity | Danny McGiffin",
    "description": "A $5,000 independent AI Opportunity assessment. In 10 business days, get a ranked opportunity map, clear economics, and a decision on what to test, investigate, or leave alone.",
    "imageAlt": "Figure out what AI is actually worth doing in your business. AI Opportunity assessment with Danny McGiffin. $5,000 fixed fee, 10 business days.",
    "headline": "Figure out what AI is actually worth doing in your business.",
    "deck": "In 10 business days, I’ll look across your business for places AI and related technology could create meaningful value, quantify the strongest opportunities, and tell you what to pursue, what to postpone, and what to ignore.",
    "deliverables": [
      ["The working register", "Ranked opportunities, assumptions, economics, dependencies, and recommendations in an editable file."],
      ["The decision brief", "A concise account of what matters most, what to leave alone, and the first experiments worth running."],
      ["The walkthrough", "A conversation with me to challenge the findings and decide who should do what next."]
    ],
    "steps": [
      ["Understand the business", "We start with your goals, economics, and constraints. We agree the areas to examine and the people and information I’ll need."],
      ["Find the opportunities", "I talk with the people doing the work and inspect workflows, systems, and examples. We look for value across the agreed scope."],
      ["Quantify and pressure-test", "I estimate what the strongest opportunities are worth, what they require, and what could go wrong. Assumptions and missing evidence stay visible."],
      ["Make the calls", "We review the opportunity map together: what to test first, what needs more evidence, and what to leave alone. You keep the working files."]
    ],
    "processNote": "The 10 business days start at kickoff, once the agreed information and interview access are available. We agree the areas to review within one business or business unit before starting; if access is delayed or scope changes, we agree a revised schedule. Production builds and pilots are separate work.",
    "fit": [
      "You run an established business with repeat work, expensive bottlenecks, or room to serve customers better.",
      "You want to know where AI is worth the investment before committing to tools or a build.",
      "You can involve the people doing the work and share examples of how it happens.",
      "Someone has the authority to act on the findings, including a recommendation to stop."
    ],
    "notFit": [
      "You already have a defined specification and need someone to implement it.",
      "You want a general AI training session or a list of tools to try.",
      "You need someone to validate a purchase you have already decided to make.",
      "Nobody has time to show the work or responsibility for what happens afterward."
    ],
    "guarantee": "Complete the assessment and review the findings with me. If you don’t believe the decisions and recommendations are worth the $5,000 fee, tell me within seven calendar days of the review. I’ll refund the full fee. You keep the findings. Give me the access we agree on and join the findings review. You do not have to implement a recommendation or buy further work to use this guarantee.",
    "faqs": [
      ["What does my team need to do?", "An owner or executive needs to sponsor the work, make introductions, and join the kickoff and findings review. The people closest to the work take part in focused conversations and show real examples. We agree those conversations and access before starting."],
      ["Do we need clean data or an AI strategy already?", "No. Messy information and unclear priorities are often why this is useful. I do need access to enough real work to distinguish an opportunity from a guess. If a prerequisite is missing, the recommendation will say what needs to change first."],
      ["Will you build or implement the recommendations?", "This engagement ends with the assessment, priorities, and first experiments. Implementation, software, and ongoing support are separate. You can take the findings to your own team or another provider; there is no obligation to hire me for anything else."],
      ["What if AI is not worth doing?", "That is a valid result. The assessment will explain why and identify the better next move, which may be a simpler process, clearer ownership, a conventional integration, or no project. I do not receive vendor commissions or referral fees."],
      ["Are the estimates guaranteed savings?", "No. I distinguish measured costs from assumptions, freed capacity from cash savings, and an attractive hypothesis from a tested result. The first experiment is designed to find out whether the value survives contact with the real work."],
      ["How do you handle sensitive information?", "We agree access and handling before work begins, including what can be shared, what should be redacted, and which tools are approved. Do not send confidential business records when booking the introductory call."]
    ],
    "proof": {
      "title": "Sometimes the answer won’t be AI.",
      "lead": "One of the most valuable technology recommendations I’ve made was to stop implementing the technology.",
      "body": "A PE-backed distributor had purchased an ERP that could not represent how the business actually worked. I recommended stopping. The CEO canceled the implementation, and I designed an alternative around systems the company already had.",
      "small": "The ERP license had already been contracted, and about $350K had been paid when implementation stopped. These are projected costs and a design estimate, not a claim of realized savings."
    }
  }
};

export function offer(slug: OfferSlug): Offer {
 return offers.find(item => item.slug === slug)!;
}
