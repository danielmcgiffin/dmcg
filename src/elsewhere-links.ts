import { bookingUrl, CTA_LABEL, subscribeUrl } from './config';
import { CONTACT_EMAIL, LINKEDIN_URL, X_URL } from './site';

/** The links shown on Elsewhere and beneath its sidebar entry. */
export const elsewhereLinks = [
  { label: CTA_LABEL, detail: 'A free 30-minute introduction', href: bookingUrl('elsewhere'), external: true },
  { label: 'Email', detail: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, external: false },
  { label: 'LinkedIn', detail: 'Work and updates', href: LINKEDIN_URL, external: true },
  { label: 'Substack', detail: 'Subscribe to my writing', href: subscribeUrl('elsewhere'), external: true },
  { label: 'X', detail: '@therealmcgiffin', href: X_URL, external: true },
  { label: 'Meet locally', detail: 'Email to arrange an in-person conversation in Northern Virginia', href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Meet locally in Northern Virginia')}`, external: false },
] as const;
