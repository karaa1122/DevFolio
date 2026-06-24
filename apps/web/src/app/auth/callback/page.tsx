'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');
    if (!code) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    // Exchange the one-time code; the API sets httpOnly auth cookies in the response.
    fetch(`${API_BASE}/api/v1/auth/github/exchange?code=${encodeURIComponent(code)}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Exchange failed');
        router.replace('/dashboard');
      })
      .catch(() => {
        router.replace('/login?error=oauth_failed');
      });
  }, [params, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-ink">
      <p className="text-content-muted animate-pulse">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-ink">
          <p className="text-content-muted animate-pulse">Signing you in...</p>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
