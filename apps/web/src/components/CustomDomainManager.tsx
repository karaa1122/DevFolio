'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { portfolioApi } from '@/lib/api';
import type { DomainStatusResponse } from '@devfolio/shared';

interface Props {
  portfolioId: string;
}

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"
    />
  </svg>
);

/**
 * Custom-domain management. The dashboard card shows a clear trigger row with
 * the current status; clicking it opens a spacious modal with the full
 * add → DNS records → verify flow.
 */
export function CustomDomainManager({ portfolioId }: Props) {
  const { data: status, mutate } = useSWR<DomainStatusResponse>(
    `portfolio-domain-${portfolioId}`,
    () => portfolioApi.getDomain(portfolioId),
    { revalidateOnFocus: false },
  );

  const [open, setOpen] = useState(false);
  const domain = status?.domain ?? null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-3 flex items-center justify-between gap-2 rounded-lg border border-line hover:border-accent/50/60 bg-surface-2/40 hover:bg-surface-2/70 px-3 py-2.5 text-left transition-colors group"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-content-faint group-hover:text-accent transition-colors">
            <LinkIcon />
          </span>
          {domain ? (
            <span className="truncate text-sm font-mono text-content">{domain}</span>
          ) : (
            <span className="text-sm text-content-muted group-hover:text-content transition-colors">
              Add custom domain
            </span>
          )}
        </span>
        {domain ? (
          <StatusBadge verified={!!status?.verified} />
        ) : (
          <span className="text-xs text-content-faint group-hover:text-accent transition-colors shrink-0">
            Set up →
          </span>
        )}
      </button>

      {open && (
        <CustomDomainModal
          portfolioId={portfolioId}
          status={status}
          onClose={() => setOpen(false)}
          onChange={(next) => mutate(next, { revalidate: false })}
        />
      )}
    </>
  );
}

function StatusBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
      Verified
    </span>
  ) : (
    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
      Pending
    </span>
  );
}

interface ModalProps {
  portfolioId: string;
  status: DomainStatusResponse | undefined;
  onClose: () => void;
  onChange: (next: DomainStatusResponse) => void;
}

function CustomDomainModal({ portfolioId, status, onClose, onChange }: ModalProps) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<DomainStatusResponse>) => {
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      onChange(next);
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const domain = status?.domain ?? null;
  const verified = !!status?.verified;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-line">
          <div className="flex items-center gap-3">
            <span className="text-accent">
              <LinkIcon />
            </span>
            <div>
              <h2 className="text-lg font-bold text-content">Custom domain</h2>
              <p className="text-sm text-content-muted mt-0.5">
                Serve your portfolio on a domain you own.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-content-faint hover:text-content transition-colors -mt-1 -mr-1 p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* No domain yet — entry form */}
          {!domain && (
            <div>
              <label className="block text-sm font-medium text-content mb-2">
                Your domain
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim() && !busy) {
                      run(() => portfolioApi.setDomain(portfolioId, input.trim()));
                    }
                  }}
                  placeholder="portfolio.yourdomain.com"
                  className="flex-1 bg-surface-2 border border-line rounded-lg px-3.5 py-2.5 text-sm text-content focus:outline-none focus:border-accent/60"
                />
                <button
                  disabled={busy || !input.trim()}
                  onClick={() => run(() => portfolioApi.setDomain(portfolioId, input.trim()))}
                  className="df-btn df-btn-primary font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shrink-0"
                >
                  {busy ? 'Adding…' : 'Add domain'}
                </button>
              </div>
              <p className="text-xs text-content-faint mt-2">
                Enter a domain or subdomain you control, e.g. <span className="font-mono">me.dev</span>{' '}
                or <span className="font-mono">portfolio.me.dev</span>.
              </p>
            </div>
          )}

          {/* Domain set */}
          {domain && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-mono text-accent hover:underline break-all"
                >
                  {domain}
                </a>
                <StatusBadge verified={verified} />
              </div>

              {verified ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3.5 py-3">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Your domain is verified and live.
                </div>
              ) : (
                status?.instructions && (
                  <div className="space-y-3">
                    <p className="text-sm text-content">
                      Add these records at your DNS provider, then verify:
                    </p>
                    <DnsRecord label="Ownership (TXT)" record={status.instructions.txt} />
                    <DnsRecord label="Routing (CNAME)" record={status.instructions.cname} />
                    <p className="text-xs text-content-faint">
                      DNS changes can take a few minutes to propagate before verification succeeds.
                    </p>
                  </div>
                )
              )}

              <div className="flex gap-2 pt-1">
                {!verified && (
                  <button
                    disabled={busy}
                    onClick={() => run(() => portfolioApi.verifyDomain(portfolioId))}
                    className="flex-1 df-btn df-btn-primary font-semibold py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {busy ? 'Checking DNS…' : 'Verify domain'}
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => run(() => portfolioApi.removeDomain(portfolioId))}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-line text-content-muted hover:text-red-400 hover:border-red-500/50 disabled:opacity-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DnsRecord({
  label,
  record,
}: {
  label: string;
  record: { type: string; name: string; value: string };
}) {
  return (
    <div className="bg-surface-2/60 border border-line rounded-lg p-3.5">
      <p className="text-xs font-medium text-content-muted mb-2.5">{label}</p>
      <dl className="space-y-2">
        <Field label="Type" value={record.type} />
        <Field label="Name" value={record.name} />
        <Field label="Value" value={record.value} />
      </dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  };

  return (
    <div className="flex items-center gap-3">
      <dt className="text-xs text-content-faint w-12 shrink-0">{label}</dt>
      <dd className="flex-1 min-w-0 flex items-center gap-2">
        <code className="flex-1 truncate text-xs text-content font-mono">{value}</code>
        <button
          onClick={copy}
          className="shrink-0 text-xs text-content-faint hover:text-accent transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </dd>
    </div>
  );
}
