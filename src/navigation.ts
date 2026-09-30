import { subscribeUrl } from "./config";
import { offers } from "./offers";
import { LINKEDIN_URL, X_URL } from "./site";

export interface NavigationLink {
  /** Groups without an href render as plain headings. */
  href?: string;
  label: string;
  external?: boolean;
  children?: NavigationLink[];
}

export const primaryLinks: NavigationLink[] = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  {
    label: "Services",
    children: offers.map(({ href, name }) => ({ href, label: name })),
  },
  { href: "/case-studies/", label: "Case Studies" },
  { href: "/writing/", label: "Writing" },
  {
    label: "Elsewhere",
    children: [
      { href: LINKEDIN_URL, label: "LinkedIn", external: true },
      { href: subscribeUrl("navigation"), label: "Substack", external: true },
      { href: X_URL, label: "X", external: true },
    ],
  },
];
