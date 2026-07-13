import Link from 'next/link';
import type { Metadata } from 'next';
import { DEMO_RESUMES } from '@/lib/demo-data';
import { DemoResumePreview } from '@/components/DemoResumePreview';
import { PublicNav } from '@/components/PublicNav';
import { IconArrowRight, IconSparkle } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Developer Resume Examples — ATS-friendly templates | DevFolio',
  description:
    'Real developer resume examples generated with DevFolio: backend engineer, full stack, junior developer and internship resumes. ATS-safe, exportable to PDF.',
  alternates: { canonical: '/resumes' },
  openGraph: {
    title: 'Developer Resume Examples — DevFolio',
    description:
      'Backend, full stack, junior and internship resume examples — built with DevFolio’s resume builder and exportable as print-perfect PDFs.',
    type: 'website',
    url: '/resumes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Resume Examples — DevFolio',
    description: 'ATS-friendly developer resume examples built with DevFolio.',
  },
};

export default function ResumeShowcasePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink text-content">
      <div className="pointer-events-none fixed left-1/2 top-[-14rem] -z-10 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full bg-accent/8 blur-[150px]" />
      <PublicNav active="resumes" />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-content-muted">
            <IconSparkle className="h-3.5 w-3.5 text-accent" />
            {DEMO_RESUMES.length} examples · exported from the real builder
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Resume examples</h1>
          <p className="mt-3 text-content-muted">
            Every resume below was built with DevFolio&apos;s resume builder — the previews are the
            actual renderer output, not screenshots. Each exports to a print-perfect,
            ATS-friendly PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {DEMO_RESUMES.map((d) => (
            <article key={d.slug} className="df-card df-card-hover flex gap-5 p-5">
              <Link href={`/resumes/${d.slug}`} className="shrink-0">
                <div className="rounded-lg border border-line bg-white shadow-lg shadow-black/30">
                  <DemoResumePreview resume={d.resume} scale={0.24} />
                </div>
              </Link>
              <div className="flex min-w-0 flex-col">
                <span className="mb-1.5 self-start rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-content-faint">
                  Demo
                </span>
                <h2 className="font-display text-lg font-bold leading-tight">{d.label}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{d.description}</p>
                <p className="mt-2 text-xs text-content-faint">
                  Template: <span className="capitalize text-content-muted">{d.resume.template}</span>
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Link href={`/resumes/${d.slug}`} className="df-btn df-btn-ghost px-4 py-2 text-xs">
                    View full size
                  </Link>
                  <Link href="/register" className="df-btn df-btn-primary px-4 py-2 text-xs">
                    Create similar resume
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-surface p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Your resume, tailored per application</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-content-muted">
            Six templates, an ATS-safe mode, and a built-in ATS match score against any job
            description — duplicate a resume and tailor it in minutes.
          </p>
          <Link href="/register" className="df-btn df-btn-primary mt-6 px-6 py-3 text-sm">
            Build your resume free
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
