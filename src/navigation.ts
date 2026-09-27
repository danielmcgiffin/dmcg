import { elsewhereLinks } from './elsewhere-links';

interface NavigationLink {
  href: string;
  label: string;
  external?: boolean;
  children?: NavigationLink[];
}

export const primaryLinks: NavigationLink[] = [
  { href: '/', label: 'Home', children: [
    { href: '/#advisory', label: 'Advisory' },
    { href: '/#work', label: 'Selected work' },
    { href: '/#about', label: 'About me' },
  ] },
  { href: '/ai/', label: 'AI assessment' },
  { href: '/writing/', label: 'Writing' },
  { href: '/contact/', label: 'Get in touch' },
  { href: '/elsewhere/', label: 'Elsewhere', children: elsewhereLinks.filter(link => link.external) },
];
