'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { portfolioApi } from '@/lib/api';
import type { DomainStatusResponse } from '@devfolio/shared';

interface Props {
  portfolioId: string;
}

/**
 * Self-contained custom-domain manager: add a domain, see the DNS records to
 * create, verify ownership, and remove. Collapsed by default so it stays
 * compact on the dashboard card; when a domain is set its status is shown in
 * the header even while collapsed.
 */
export function CustomDomainManager({ portfolioId }: Props) {
  const { data: status, mutate } = useSWR<DomainStatusResponse>(
    `portfolio-domain-${portfolioId}`,
    () => portfolioApi.getDomain(portfolioId),
    { revalidateOnFocus: false },
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<DomainStatusResponse>) => {
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      await mutate(next, { revalidate: false });
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const domain = status?.domain ?? null;

  return (
    <div className="border-t border-slate-800 mt-4 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
          </svg>
          Custom domain
        </span>
        <span className="flex items-center gap-2">
          {domain &&
            (status?.verified ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                Verified
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                Pending
              </span>
            ))}
          <svg
            className={`w-3.5 h-3.5 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {!open && domain && (
        <p className="text-xs text-violet-400 font-mono mt-1 break-all">{domain}</p>
      )}

      {open && (
        <div className="mt-3">
          {!domain && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="portfolio.yourdomain.com"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                />
                <button
                  disabled={busy || !input.trim()}
                  onClick={() => run(() => portfolioApi.setDomain(portfolioId, input.trim()))}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Connect a domain you own to serve your portfolio.
              </p>
            </>
          )}

          {domain && (
            <div className="space-y-3">
              <span className="text-sm text-violet-400 font-mono break-all">{domain}</span>

              {!status?.verified && status?.instructions && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-slate-400">
                    Add these DNS records at your registrar, then click Verify:
                  </p>
                  <DnsRow record={status.instructions.txt} />
                  <DnsRow record={status.instructions.cname} />
                  <p className="text-xs text-slate-600">
                    DNS changes can take a few minutes to propagate.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!status?.verified && (
                  <button
                    disabled={busy}
                    onClick={() => run(() => portfolioApi.verifyDomain(portfolioId))}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
                  >
                    {busy ? 'Checking…' : 'Verify'}
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => run(() => portfolioApi.removeDomain(portfolioId))}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

function DnsRow({ record }: { record: { type: string; name: string; value: string } }) {
  return (
    <div className="text-xs font-mono">
      <div className="flex gap-2 text-slate-300">
        <span className="text-slate-500 w-10 shrink-0">{record.type}</span>
        <span className="break-all">{record.name}</span>
      </div>
      <div className="flex gap-2 text-slate-400 mt-0.5">
        <span className="w-10 shrink-0" />
        <span className="break-all">→ {record.value}</span>
      </div>
    </div>
  );
}
