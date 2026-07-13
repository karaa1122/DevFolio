import Link from 'next/link';
import { Logo } from '@/components/Logo';

/** Shared header for public marketing pages (server-safe, no auth state). */
export function PublicNav({ active }: { active?: 'showcase' | 'templates' | 'resumes' }) {
  const links = [
    { href: '/showcase', label: 'Examples', id: 'showcase' },
    { href: '/templates', label: 'Templates', id: 'templates' },
    { href: '/resumes', label: 'Resumes', id: 'resumes' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="DevFolio home">
          <Logo withWordmark />
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              className={`hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:block ${
                active === l.id ? 'text-content' : 'text-content-muted hover:text-content'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
          >
            Sign in
          </Link>
          <Link href="/register" className="df-btn df-btn-primary ml-1 px-4 py-2 text-sm">
            Create portfolio
          </Link>
        </nav>
      </div>
    </header>
  );
}
