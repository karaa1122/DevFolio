import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DevFolio — Developer Portfolio Builder',
    template: '%s | DevFolio',
  },
  description:
    'Build, customize, and publish your developer portfolio in minutes. Export as a static website.',
  keywords: ['portfolio', 'developer', 'resume', 'website builder'],
  authors: [{ name: 'DevFolio' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'DevFolio',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
