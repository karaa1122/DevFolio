'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-bold text-accent block mb-10">
          DevFolio
        </Link>
        <div className="bg-surface border border-line rounded-2xl p-10">
          <div className="w-14 h-14 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-content mb-2">Something went wrong</h1>
          <p className="text-content-muted text-sm mb-6">
            An unexpected error occurred. You can try again or go back home.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="df-btn df-btn-primary font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="bg-surface-2 hover:bg-surface-3 text-content font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
