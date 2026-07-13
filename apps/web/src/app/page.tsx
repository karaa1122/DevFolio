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
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { DemoResumePreview } from '@/components/DemoResumePreview';
import { DEMO_PROFILES, DEMO_RESUMES } from '@/lib/demo-data';
import { getPortfolioTemplate, PORTFOLIO_TEMPLATES } from '@devfolio/shared';

export const metadata: Metadata = {
  title: 'Build a developer portfolio that gets you noticed | DevFolio',
  description:
    'Turn your GitHub projects, skills, and experience into a professional developer profile. Portfolios, ATS-friendly resumes, templates and analytics — open source.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Build a developer portfolio that gets you noticed',
    description:
      'Turn your GitHub projects, skills, and experience into a professional developer profile.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build a developer portfolio that gets you noticed | DevFolio',
    description:
      'Turn your GitHub projects, skills, and experience into a professional developer profile.',
  },
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
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/showcase"
              className="hidden px-3 py-2 text-sm text-content-muted transition-colors hover:text-content md:block"
            >
              Examples
            </Link>
            <Link
              href="/templates"
              className="hidden px-3 py-2 text-sm text-content-muted transition-colors hover:text-content md:block"
            >
              Templates
            </Link>
            <Link
              href="/resumes"
              className="hidden px-3 py-2 text-sm text-content-muted transition-colors hover:text-content md:block"
            >
              Resumes
            </Link>
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
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Build a developer portfolio that{' '}
              <span className="aurora-text">gets you noticed.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-content-muted">
              Turn your GitHub projects, skills, and experience into a professional developer
              profile — plus an ATS-friendly resume, built from the same data.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="df-btn df-btn-primary px-7 py-3.5 text-base">
                Create Portfolio
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/showcase" className="df-btn df-btn-ghost px-7 py-3.5 text-base">
                Explore Examples
              </Link>
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

      {/* Example portfolios — one card per flagship template, each styled like its template */}
      <section className="px-6 py-28">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        />
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                See what you could build
              </h2>
              <p className="mt-3 max-w-xl text-content-muted">
                Four templates, four completely different portfolios — every card below renders
                with the exact colors and type of its real template.
              </p>
            </div>
            <Link href="/showcase" className="df-btn df-btn-ghost px-5 py-2.5 text-sm">
              Explore all examples
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(['aram-rostam', 'soran-latif', 'zhala-amin', 'sara-hiwa'] as const).map((slug) => {
              const p = DEMO_PROFILES.find((d) => d.slug === slug);
              if (!p) return null;
              const { colors } = getPortfolioTemplate(p.template).suggestedTheme;
              const initials = p.name.split(' ').map((w) => w[0]).join('');

              if (p.template === 'glitch') {
                return (
                  <Link
                    key={slug}
                    href={`/showcase/${p.slug}`}
                    className="group relative overflow-hidden rounded-2xl border transition-transform duration-300 hover:-translate-y-1.5"
                    style={{ backgroundColor: colors.background, borderColor: `${colors.primary}55` }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 z-10 opacity-40"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.35) 3px 4px)',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${colors.primary}, 0 0 40px -8px ${colors.primary}`,
                      }}
                    />
                    <div className="relative z-20 flex items-center justify-between px-5 pt-4 text-[10px] font-bold uppercase tracking-widest">
                      <span style={{ color: colors.accent }}>SYS://</span>
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{ color: colors.accent, border: `1px solid ${colors.accent}55` }}
                      >
                        Glitch
                      </span>
                    </div>
                    <div className="relative z-20 p-5 pt-4">
                      <h3
                        className="font-display text-xl font-bold leading-tight"
                        style={{
                          color: colors.foreground,
                          textShadow: `2px 0 0 ${colors.primary}99, -2px 0 0 ${colors.accent}99`,
                        }}
                      >
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs" style={{ color: `${colors.foreground}99` }}>
                        {p.title}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed" style={{ color: `${colors.foreground}bb` }}>
                        {p.bio}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full px-2 py-0.5 text-[10px]"
                            style={{ border: `1px solid ${colors.primary}66`, color: colors.primary }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              }

              if (p.template === 'arcade') {
                return (
                  <Link
                    key={slug}
                    href={`/showcase/${p.slug}`}
                    className="group relative overflow-hidden rounded-none p-5 transition-transform duration-200 hover:-translate-y-1"
                    style={{
                      backgroundColor: colors.background,
                      border: `3px solid ${colors.border}`,
                      boxShadow: `0 6px 0 -2px ${colors.border}cc`,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.25) 2px 3px)',
                      }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ fontFamily: "'Press Start 2P', monospace", color: colors.primary }}
                      >
                        Arcade
                      </span>
                      <span
                        className="grid h-9 w-9 place-items-center text-[10px] font-bold"
                        style={{ backgroundColor: colors.primary, color: colors.background }}
                      >
                        {initials}
                      </span>
                    </div>
                    <h3
                      className="relative mt-4 text-sm leading-relaxed"
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        color: colors.foreground,
                        textShadow: `2px 2px 0 ${colors.background === '#ffffff' ? '#00000030' : '#00000080'}`,
                      }}
                    >
                      {p.name}
                    </h3>
                    <p className="relative mt-3 text-xs" style={{ color: `${colors.foreground}99` }}>
                      {p.title}
                    </p>
                    <p
                      className="relative mt-3 text-xs leading-relaxed"
                      style={{ color: `${colors.foreground}bb` }}
                    >
                      {p.bio}
                    </p>
                    <div className="relative mt-4 flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-[10px]"
                          style={{ border: `2px solid ${colors.border}`, color: colors.muted }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              }

              if (p.template === 'dimension') {
                return (
                  <Link
                    key={slug}
                    href={`/showcase/${p.slug}`}
                    className="group relative overflow-hidden rounded-2xl border p-5 transition-transform duration-500 [transform-style:preserve-3d] hover:-translate-y-1.5 hover:[transform:perspective(700px)_rotateX(3deg)]"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: `${colors.border}`,
                      backgroundImage: `radial-gradient(1px 1px at 20% 30%, ${colors.accent}88 0, transparent 60%),
                        radial-gradient(1px 1px at 70% 60%, ${colors.primary}88 0, transparent 60%),
                        radial-gradient(1px 1px at 40% 80%, #ffffff66 0, transparent 60%),
                        radial-gradient(1px 1px at 85% 20%, #ffffff44 0, transparent 60%)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: colors.accent, border: `1px solid ${colors.accent}55` }}
                      >
                        Dimension
                      </span>
                      <span
                        className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                          color: colors.background,
                        }}
                      >
                        {initials}
                      </span>
                    </div>
                    <h3
                      className="mt-4 font-display text-xl font-bold leading-tight"
                      style={{ color: colors.foreground, textShadow: `0 0 18px ${colors.accent}66` }}
                    >
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                      {p.title}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed" style={{ color: `${colors.foreground}bb` }}>
                      {p.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full px-2 py-0.5 text-[10px]"
                          style={{ border: `1px solid ${colors.accent}55`, color: colors.accent }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              }

              // retro-os — a little floating desktop window
              return (
                <Link
                  key={slug}
                  href={`/showcase/${p.slug}`}
                  className="group overflow-hidden rounded-xl border shadow-lg transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <div
                    className="flex items-center gap-1.5 border-b px-3 py-2"
                    style={{ borderColor: colors.border, backgroundColor: `${colors.background}` }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#febc2e' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#28c840' }} />
                    <span
                      className="ml-2 truncate text-[11px] font-medium"
                      style={{ color: colors.muted }}
                    >
                      {p.name.toLowerCase().replace(' ', '-')}.app
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-10 w-10 place-items-center rounded-lg text-sm font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                          color: '#ffffff',
                        }}
                      >
                        {initials}
                      </span>
                      <div>
                        <h3
                          className="font-display text-base font-bold leading-tight"
                          style={{ color: colors.foreground }}
                        >
                          {p.name}
                        </h3>
                        <p className="text-xs" style={{ color: colors.muted }}>
                          {p.title}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed" style={{ color: colors.muted }}>
                      {p.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `${colors.primary}18`, color: colors.primary }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="border-y border-line bg-surface/40 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Nine templates, one click apart
              </h2>
              <p className="mt-3 max-w-xl text-content-muted">
                From quiet and minimal to a desktop of floating windows — switch anytime, your
                content carries over.
              </p>
            </div>
            <Link href="/templates" className="df-btn df-btn-ghost px-5 py-2.5 text-sm">
              Browse all templates
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {PORTFOLIO_TEMPLATES.filter((t) =>
              ['aurora', 'minimal', 'retro-os', 'arcade'].includes(t.id),
            ).map((meta) => (
              <Link
                key={meta.id}
                href="/templates"
                className="df-card df-card-hover group overflow-hidden p-0"
              >
                <TemplatePreview meta={meta} className="w-full text-[8px] sm:text-[10px]" />
                <div className="flex items-center justify-between border-t border-line px-4 py-3">
                  <span className="font-display text-sm font-semibold transition-colors group-hover:text-accent">
                    {meta.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Resume examples */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                And the resume to match
              </h2>
              <p className="mt-3 max-w-xl text-content-muted">
                Six resume templates, an ATS-safe mode, PDF export, and a built-in ATS match
                score against any job description.
              </p>
            </div>
            <Link href="/resumes" className="df-btn df-btn-ghost px-5 py-2.5 text-sm">
              See resume examples
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:justify-between">
            {DEMO_RESUMES.map((d) => (
              <Link key={d.slug} href={`/resumes/${d.slug}`} className="group">
                <div className="rounded-lg border border-line bg-white shadow-xl shadow-black/30 transition-transform group-hover:-translate-y-1.5">
                  <DemoResumePreview resume={d.resume} scale={0.28} />
                </div>
                <p className="mt-3 text-center text-xs text-content-faint transition-colors group-hover:text-content">
                  {d.label}
                </p>
              </Link>
            ))}
          </div>
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

      {/* Open source */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="df-card flex flex-col items-start gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface-2 text-accent">
                <IconGithub className="h-5 w-5" />
              </span>
              <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                Open source, MIT licensed
              </h2>
              <p className="mt-3 max-w-xl text-content-muted">
                DevFolio is built in the open — NestJS, Next.js, TypeScript end to end, plus a
                Python matching engine. Self-host the whole stack with Docker Compose, or star
                it and steal ideas. Contributions welcome.
              </p>
            </div>
            <a
              href="https://github.com/karaa1122/DevFolio"
              target="_blank"
              rel="noopener noreferrer"
              className="df-btn df-btn-ghost shrink-0 px-6 py-3 text-sm"
            >
              <IconGithub className="h-4 w-4" />
              Star on GitHub
            </a>
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
