import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer Portfolio Templates — DevFolio Marketplace',
  description:
    'Nine portfolio templates for developers: Aurora, Minimal, Editorial, Terminal, Retro OS, Dimension, Brutalist, Glitch and Arcade. Switch anytime — your content carries over.',
  alternates: { canonical: '/templates' },
  openGraph: {
    title: 'Developer Portfolio Templates — DevFolio Marketplace',
    description:
      'From quiet and minimal to a desktop of floating windows — browse every DevFolio portfolio template and apply one in a click.',
    type: 'website',
    url: '/templates',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Portfolio Templates — DevFolio Marketplace',
    description: 'Browse every DevFolio portfolio template and apply one in a click.',
  },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
