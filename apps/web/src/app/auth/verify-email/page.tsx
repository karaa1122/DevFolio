'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

type State = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMessage('No verification token found in the link.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setState('success');
        localStorage.setItem('devfolio_email_verified', 'true');
        setTimeout(() => router.push('/login?verified=true'), 2500);
      })
      .catch((err: unknown) => {
        setState('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Verification failed. The link may have expired.',
        );
      });
  }, [token, router]);

  const handleResend = async () => {
    const email = prompt('Enter your email to receive a new link:');
    if (!email) return;
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-bold text-violet-400 block mb-10">
          DevFolio
        </Link>

        {state === 'loading' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-300 font-medium">Verifying your email...</p>
          </div>
        )}

        {state === 'success' && (
          <div className="bg-slate-900 border border-green-900/50 rounded-2xl p-10">
            <div className="w-14 h-14 bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">Email verified!</h1>
            <p className="text-slate-400 text-sm">Redirecting you to sign in...</p>
          </div>
        )}

        {state === 'error' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10">
            <div className="w-14 h-14 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">Verification failed</h1>
            <p className="text-slate-400 text-sm mb-6">{errorMessage}</p>

            {resent ? (
              <p className="text-green-400 text-sm">New link sent — check your inbox.</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            )}

            <p className="mt-4">
              <Link
                href="/login"
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
