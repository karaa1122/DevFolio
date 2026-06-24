import Link from 'next/link';
import type { Metadata } from 'next';
import {
  IconWand,
  IconLayers,
  IconPackage,
  IconGithub,
  IconChart,
  IconGlobe,
  IconArrowRight,
} from '@/components/icons';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Build a developer portfolio that gets you hired',
  alternates: { canonical: '/' },
};

const features = [
  {
    Icon: IconWand,
    title: 'Visual editor',
    desc: 'Drag, drop, and theme live. Every change previews instantly — no code, no rebuild.',
  },
  {
    Icon: IconLayers,
    title: 'JSON-first',
    desc: 'Your portfolio is pure, portable data. Version it, fork it, and own it forever.',
  },
  {
    Icon: IconPackage,
    title: 'Static export',
    desc: 'Ship a self-contained ZIP of HTML, CSS & JS. Host it on anything, anywhere.',
  },
  {
    Icon: IconGithub,
    title: 'GitHub import',
    desc: 'Pull repos in one click — stars, language, and descriptions included.',
  },
  {
    Icon: IconChart,
    title: 'Privacy-first analytics',
    desc: 'See views, section engagement, and project clicks. No creepy tracking.',
  },
  {
    Icon: IconGlobe,
    title: 'Custom domains',
    desc: 'Publish at yourname.devfolioapp.cloud — or bring your own domain.',
  },
];

const steps = [
  { n: '01', title: 'Import or start fresh', desc: 'Connect GitHub or open a blank canvas.' },
  { n: '02', title: 'Design it your way', desc: 'Drag sections, pick a theme, tune the type.' },
  { n: '03', title: 'Publish & export', desc: 'Go live on a subdomain or download a static site.' },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-ink text-content">
      {/* Ambient aurora glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-12rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px] animate-aurora-drift" />
        <div className="absolute right-[-10rem] top-[20rem] h-[30rem] w-[30rem] rounded-full bg-accent-2/15 blur-[130px] animate-aurora-drift [animation-delay:-6s]" />
      </div>

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="DevFolio home">
            <Logo withWordmark />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-3 py-2 text-sm text-content-muted transition-colors hover:text-content"
            >
              Sign in
            </Link>
            <Link href="/register" className="df-btn df-btn-primary px-4 py-2 text-sm">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-36 pb-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-slide-up">
            <span className="df-chip mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
              Open source · built for developers
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Your portfolio,
              <br />
              <span className="aurora-text">built different.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-content-muted">
              DevFolio is a JSON-first portfolio &amp; resume builder. Design visually, own your
              data, and export a static site or a print-perfect PDF — no lock-in, ever.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="df-btn df-btn-primary px-7 py-3.5 text-base">
                Start building free
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/karaa1122/DevFolio"
                target="_blank"
                rel="noopener noreferrer"
                className="df-btn df-btn-ghost px-7 py-3.5 text-base"
              >
                <IconGithub className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
            <p className="mt-6 text-sm text-content-faint">
              Free forever · No credit card · Export anytime
            </p>
          </div>

          {/* Live preview mockup */}
          <div className="relative animate-fade-in [animation-delay:200ms]">
            <div className="df-card glow overflow-hidden">
              {/* window chrome */}
              <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-content-faint/40" />
                <span className="h-3 w-3 rounded-full bg-content-faint/40" />
                <span className="h-3 w-3 rounded-full bg-content-faint/40" />
                <span className="ml-3 font-mono text-xs text-content-faint">
                  devfolioapp.cloud/you
                </span>
              </div>
              <div className="space-y-5 p-7">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-aurora" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-36 rounded-full bg-content/80" />
                    <div className="h-2.5 w-24 rounded-full bg-accent/60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-content/15" />
                  <div className="h-2.5 w-5/6 rounded-full bg-content/15" />
                  <div className="h-2.5 w-2/3 rounded-full bg-content/15" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-line bg-surface-2/50 p-3.5"
                    >
                      <div className="mb-2 h-2.5 w-2/3 rounded-full bg-content/40" />
                      <div className="h-2 w-full rounded-full bg-content/12" />
                      <div className="mt-1.5 h-2 w-4/5 rounded-full bg-content/12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* floating accent badge */}
            <div className="absolute -bottom-5 -left-5 hidden animate-float-slow rounded-2xl border border-line bg-surface-2/90 px-4 py-3 backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
                  <IconChart className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-display text-sm font-semibold">1,204 views</div>
                  <div className="text-xs text-content-faint">this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / trust strip */}
      <section className="border-y border-line bg-surface/40 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-sm text-content-faint">
          <span>Deploy to Vercel</span>
          <span className="text-content-faint/40">·</span>
          <span>Netlify</span>
          <span className="text-content-faint/40">·</span>
          <span>GitHub Pages</span>
          <span className="text-content-faint/40">·</span>
          <span>Cloudflare</span>
          <span className="text-content-faint/40">·</span>
          <span>Any static host</span>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to ship a portfolio that gets noticed
            </h2>
            <p className="mt-4 text-content-muted">
              Thoughtful defaults, total control, and zero lock-in.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="df-card df-card-hover group p-6">
                <span className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface-2 text-accent transition-colors group-hover:border-accent/40">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="df-card overflow-hidden p-8 md:p-12">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Live in three steps
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="relative">
                  <span className="aurora-text font-mono text-sm font-semibold">{s.n}</span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-content-muted">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-line bg-surface px-8 py-16 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-64 w-64 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Ready to <span className="aurora-text">stand out</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-content-muted">
            Join developers shipping portfolios recruiters actually remember.
          </p>
          <Link
            href="/register"
            className="df-btn df-btn-primary mt-9 px-8 py-4 text-base"
          >
            Create your portfolio free
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-10 text-center text-sm text-content-faint">
        <p>DevFolio — Open-source portfolio &amp; resume builder · MIT License</p>
      </footer>
    </main>
  );
}
