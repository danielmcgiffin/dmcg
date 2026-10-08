/** Primary navigation, header, footer, and shared page chrome. */
export interface NavigationLink {
  /** Groups without an href render as plain headings. */
  href?: string;
  label: string;
  external?: boolean;
  children?: NavigationLink[];
}

/** Offer pages are deliberately absent; they're linked from Contact and Work. */
export const primaryLinks: NavigationLink[] = [
  { href: "/work/", label: "Work" },
  { href: "/writing/", label: "Writing" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export const chrome = {
  wordmark: "DANNY McGIFFIN",
  homeHref: "/",
  primaryNavLabel: "Primary navigation",
  mobileNavLabel: "Mobile navigation",
  menuLabel: "Menu",
  skipLink: "Skip to main content",
  rssTitle: "Danny McGiffin writing",
  defaultImageAlt: "Straight answers about your business technology. Danny McGiffin, Independent Tech Advisor.",
  copyright: (year: number) => `© ${year} Danny McGiffin`,
  footerLink: { href: "/elsewhere/", label: "Elsewhere ↗" },
  breadcrumbHome: "Home",
} as const;

/** The dark closing band used on Work, Northern Virginia, and other interior pages. */
export const closingCta = {
  eyebrow: "Let’s talk",
  title: "Technology should make the business",
  emphasis: "easier to run.",
  paragraphs: [
    "If it isn’t, let’s find out why and what to do about it.",
    "You don’t need to have the problem neatly framed. In fact, that’s often the point.",
  ],
} as const;

export const proofSection = {
  eyebrow: "Evidence/",
} as const;
