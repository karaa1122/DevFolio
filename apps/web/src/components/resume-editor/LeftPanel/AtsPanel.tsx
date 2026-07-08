'use client';

import { useState } from 'react';
import { resumeApi } from '@/lib/api';
import type { AtsMatchResult } from '@devfolio/shared';

interface Props {
  resumeId: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#4ade80';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

function ScoreDial({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-100">{Math.round(score)}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

const RECOMMENDATION_STYLE: Record<string, string> = {
  shortlist: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  review: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  reject: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export function AtsPanel({ resumeId }: Props) {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<AtsMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScore = async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await resumeApi.atsMatch(resumeId, jd));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">ATS Match</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Paste a job description and see how well this resume covers it — matched and missing
          keywords, experience fit, and an overall score. Tailor, then re-score.
        </p>
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={8}
        placeholder="Paste the job description here…"
        className="w-full resize-y rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-xs leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-violet-500/60 focus:outline-none"
      />

      <button
        onClick={handleScore}
        disabled={loading || jd.trim().length < 30}
        className="w-full rounded-lg bg-violet-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? 'Scoring…' : result ? 'Re-score' : 'Score against this job'}
      </button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 border-t border-slate-800/70 pt-4">
          <ScoreDial score={result.score} />

          <div className="flex justify-center">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                RECOMMENDATION_STYLE[
                  result.score >= 80 ? 'shortlist' : result.score < 50 ? 'reject' : 'review'
                ]
              }`}
            >
              {result.recommendation}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-400">{result.summary}</p>

          {result.experienceGap && (
            <p className="rounded-lg bg-slate-900/60 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
              {result.experienceGap}
            </p>
          )}

          {result.matchedSkills.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Matched skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missingSkills.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Missing from your resume
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Worth adding where they honestly apply — the Skills section and recent experience
                bullets carry the most weight.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
