'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-2xl font-bold text-accent block mb-10">
            DevFolio
          </Link>
          <div className="bg-surface border border-line rounded-2xl p-10">
            <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-content mb-2">Check your inbox</h1>
            <p className="text-content-muted text-sm leading-relaxed">
              If <span className="text-accent">{email}</span> has an account, we&apos;ve sent a reset
              link. It expires in 1 hour.
            </p>
            <p className="mt-6">
              <Link
                href="/login"
                className="text-accent hover:text-accent text-sm font-medium transition-colors"
              >
                Back to sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-accent">
            DevFolio
          </Link>
          <h1 className="text-2xl font-bold text-content mt-4">Forgot your password?</h1>
          <p className="text-content-muted mt-1">We&apos;ll send a reset link to your email</p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-8">
          {error && (
            <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-content-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="w-full bg-surface-2 border border-line rounded-lg px-4 py-3 text-content placeholder-content-faint focus:outline-none focus:border-accent/60 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full df-btn df-btn-primary font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="text-center text-sm text-content-faint mt-6">
            <Link href="/login" className="text-accent hover:text-accent">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
