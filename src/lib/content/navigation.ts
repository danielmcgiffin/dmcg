/** Primary navigation, header, footer, and shared page chrome. */
/** Home is available through the name. Services are linked from Contact and Work. */
export const primaryLinks = [
  { href: '/work/', label: 'Work' },
  { href: '/writing/', label: 'Writing' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/elsewhere/', label: 'Elsewhere' },
] as const;

export const chrome = {
  wordmark: "DANNY McGIFFIN",
  homeHref: "/",
  primaryNavLabel: "Primary navigation",
  mobileNavLabel: "Mobile navigation",
  menuLabel: "Menu",
  skipLink: "Skip to main content",
  rssTitle: "Danny McGiffin writing",
  defaultImageAlt: "Danny McGiffin, Business & Technology Advisor.",
  copyright: (year: number) => `© ${year} Danny McGiffin`,
  footerLink: { href: "/elsewhere/", label: "Elsewhere ↗" },
  breadcrumbHome: "Home",
} as const;

export const closingCta = {
  eyebrow: 'Get in touch',
  title: 'What are you working on?',
  paragraphs: ['Tell me about the business and what you’re trying to do. You don’t need to have the problem neatly framed yet.'],
} as const;
