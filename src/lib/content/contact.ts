/** Contact page copy. The offer list links to /offers/<slug>/. */
import { CONTACT_EMAIL } from '../../site';

const mailto = (subject?: string) => `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export const contact = {
	title: 'Contact | Danny McGiffin',
	description: 'Contact Danny McGiffin, an independent business & technology advisor in the Washington, DC area. Book a free 30-minute introduction or send an email.',
	breadcrumb: 'Contact',
	eyebrow: 'Contact',
	heading: 'Tell me what you’re deciding.',
	intro: 'You don’t need a polished brief. The first 30-minute video call is free: we talk about your business and main pain points, then decide whether to dig deeper.',
	offersLinkLabel: 'See the four ways to work together ↗',
	offersAnchor: 'offers',
	emailButton: {
		href: mailto('A decision worth talking through'),
		label: 'Or send an email',
		/** Shown briefly after the click copies the address, for visitors without a mail app. */
		copiedLabel: `Copied ${CONTACT_EMAIL}`,
		email: CONTACT_EMAIL,
	},
} as const;
