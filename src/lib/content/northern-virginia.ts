/** The regional service page. Section bodies contain inline links and render with set:html. */
import { offers } from './offers';

export const northernVirginia = {
	title: 'Tech Advisor in Northern Virginia | Danny McGiffin',
	description: 'Independent, vendor-neutral tech advice for Northern Virginia businesses: Tech Audits, Second Opinions, AI Opportunity assessments, and Data Connection. Based in Herndon.',
	imageAlt: 'Independent tech advisor in Northern Virginia. Danny McGiffin, based in Herndon.',
	breadcrumb: 'Northern Virginia',
	serviceName: 'Independent technology advice',
	eyebrow: 'Herndon / Northern Virginia',
	heading: 'An independent tech advisor in Northern Virginia.',
	deck: 'Vendor-neutral advice for owners and executives across the Washington, DC area. Based in Herndon, and close enough to see the real work.',
	sections: [
		{
			heading: 'Four ways to work together.',
			html: [
				'<p>I’m Danny McGiffin, an independent tech advisor based in Herndon. I don’t sell software or take referral fees, so the answer can be to buy nothing.</p>',
				`<ul>${offers.map((item) => `<li><a href="${item.href}"><strong>${item.name}</strong></a>: ${item.oneLiner} ${item.price}, ${item.duration.toLowerCase()}.</li>`).join('')}</ul>`,
			].join(''),
		},
		{
			heading: 'Sometimes the work is stopping the wrong project.',
			html: '<p>For a PE-backed distributor, I found that an enterprise ERP couldn’t represent the relationships at the heart of its business. The CEO canceled the implementation, and I designed an alternative around the systems already in use, estimated at about 2% of the projected ERP path.</p><p><a href="/work/">Read the case studies ↗</a></p>',
		},
		{
			heading: 'Close enough to see the real work.',
			html: '<p>Herndon is home base. I work across Northern Virginia and the Washington, DC area, including Reston, Chantilly, Fairfax, Tysons, McLean, Vienna, Ashburn, Leesburg, Arlington, and Alexandria, as well as Loudoun and Fairfax counties.</p><p>Some work is on site; some is remote. The choice depends on what we need to understand and who needs to be involved. Those are service areas, not a list of offices.</p>',
		},
		{
			heading: 'A useful fit.',
			html: '<p>This work is for owners, executives, and senior operators at founder-led or privately held businesses where a technology decision carries real money, and who are willing to look at what is actually happening.</p>',
		},
	],
} as const;
