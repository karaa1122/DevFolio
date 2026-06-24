import type { Metadata } from 'next';
import {
  Inter,
  Roboto,
  Poppins,
  Fira_Code,
  JetBrains_Mono,
  Space_Grotesk,
} from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devfolioapp.cloud';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'DevFolio — Build a developer portfolio that gets you hired',
    template: '%s · DevFolio',
  },
  description:
    'DevFolio is a JSON-first portfolio and resume builder for developers. Design visually, own your data, and export a static site or a print-perfect PDF — no lock-in, ever.',
  keywords: [
    'developer portfolio',
    'portfolio builder',
    'resume builder',
    'software engineer resume',
    'static site export',
    'github portfolio',
    'devfolio',
  ],
  applicationName: 'DevFolio',
  authors: [{ name: 'DevFolio' }],
  creator: 'DevFolio',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'DevFolio',
    title: 'DevFolio — Build a developer portfolio that gets you hired',
    description:
      'Design visually, own your data, and export a static site or a print-perfect PDF. Built for developers.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevFolio — Developer portfolio & resume builder',
    description: 'Design visually, own your data, export anywhere. Built for developers.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${roboto.variable} ${poppins.variable} ${firaCode.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
