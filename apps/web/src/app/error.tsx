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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-bold text-violet-400 block mb-10">
          DevFolio
        </Link>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10">
          <div className="w-14 h-14 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm mb-6">
            An unexpected error occurred. You can try again or go back home.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
