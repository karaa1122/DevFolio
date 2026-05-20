import Link from 'next/link';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'DevFolio — Build Your Developer Portfolio',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-violet-400">DevFolio</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-800/50 text-violet-300 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-slow" />
            Open Source · Built for Developers
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Your Portfolio, <span className="text-violet-400">Built Different</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            DevFolio is a JSON-first portfolio builder. Design visually, own your data, export
            static websites — no lock-in, ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
            >
              Start Building Free →
            </Link>
            <a
              href="https://github.com/karaa1122/DevFolio"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-100">
            Everything you need to ship a great portfolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Visual Editor',
                desc: 'Drag & drop sections, live preview, theme customization — no code required.',
              },
              {
                icon: '⚡',
                title: 'JSON-First Architecture',
                desc: 'Your portfolio is pure data. Version it, fork it, and own it forever.',
              },
              {
                icon: '📦',
                title: 'Static Export',
                desc: 'Export as a fully self-contained ZIP with HTML, CSS, and JS. Deploy anywhere.',
              },
              {
                icon: '🔗',
                title: 'GitHub Integration',
                desc: 'Auto-import your GitHub repos into your portfolio with one click.',
              },
              {
                icon: '📊',
                title: 'Analytics',
                desc: 'Track page views, section engagement, and project clicks — privacy-first.',
              },
              {
                icon: '🚀',
                title: 'Custom Domains',
                desc: 'Publish at yourname.devfolioapp.cloud or bring your own domain.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-violet-800/50 transition-colors"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-100 mb-4">Ready to stand out?</h2>
          <p className="text-slate-400 mb-8">
            Join developers who ship portfolios that get noticed.
          </p>
          <Link
            href="/register"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105"
          >
            Create Your Portfolio Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>DevFolio — Open Source Portfolio Builder · MIT License</p>
      </footer>
    </main>
  );
}
