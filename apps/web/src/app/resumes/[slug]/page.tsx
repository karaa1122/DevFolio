import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DEMO_RESUMES, getDemoResume } from '@/lib/demo-data';
import { DemoResumePreview } from '@/components/DemoResumePreview';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return DEMO_RESUMES.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const demo = getDemoResume(params.slug);
  if (!demo) return { title: 'Example not found' };
  const title = `${demo.label} — Example | DevFolio`;
  return {
    title,
    description: `${demo.description} Built with DevFolio's resume builder.`,
    alternates: { canonical: `/resumes/${demo.slug}` },
    openGraph: { title, description: demo.description, type: 'website', url: `/resumes/${demo.slug}` },
    twitter: { card: 'summary', title, description: demo.description },
  };
}

export default function ResumeExamplePage({ params }: Props) {
  const demo = getDemoResume(params.slug);
  if (!demo) notFound();

  return (
    <div className="min-h-screen bg-ink text-content">
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink/90 px-4 py-2.5 backdrop-blur-xl sm:px-6">
        <p className="text-xs text-content-muted sm:text-sm">
          <span className="mr-2 rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-content-faint">
            Demo
          </span>
          {demo.label} — example content, not a real person.
        </p>
        <div className="flex items-center gap-2">
          <Link href="/resumes" className="df-btn df-btn-ghost px-3 py-1.5 text-xs">
            ← All examples
          </Link>
          <Link href="/register" className="df-btn df-btn-primary px-4 py-1.5 text-xs">
            Create similar resume
          </Link>
        </div>
      </div>

      <main className="flex justify-center px-4 py-10">
        <div className="rounded-xl border border-line bg-white shadow-2xl shadow-black/40">
          <DemoResumePreview resume={demo.resume} scale={0.9} />
        </div>
      </main>
    </div>
  );
}
