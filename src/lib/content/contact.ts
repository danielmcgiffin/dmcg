/** Contact page copy. The offer list links to /offers/<slug>/. */
import { CONTACT_EMAIL } from '../../site';

const mailto = (subject?: string) => `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export const contact = {
	title: 'Contact | Danny McGiffin',
	description: 'Contact Danny McGiffin, an independent management consultant in Herndon, Virginia. Book a free 30-minute introduction or send an email.',
	breadcrumb: 'Contact',
	eyebrow: 'Contact',
	heading: 'Tell me what you’re deciding.',
	intro: 'You don’t need a polished brief. The first 30-minute video call is free: we talk about your business and main pain points, then decide whether to dig deeper.',
	offersLinkLabel: 'See the four ways to work together ↗',
	offersAnchor: 'offers',
	emailButton: { href: mailto('A decision worth talking through'), label: 'Or send an email' },
	emailLabel: 'Email directly: ',
	email: CONTACT_EMAIL,
	emailHref: mailto(),
	locationHtml: `Based in Herndon, Virginia. The booked first call is by video; <a href="${mailto('Meet locally in Northern Virginia')}">email me to arrange an in-person conversation</a>. Learn more about <a href="/northern-virginia-ai-workflow-automation/">working together in Northern Virginia</a>.`,
} as const;
