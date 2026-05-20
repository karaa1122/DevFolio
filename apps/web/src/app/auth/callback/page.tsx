'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { saveTokens } from '@/lib/utils';

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

    fetch(`${API_BASE}/api/v1/auth/github/exchange?code=${encodeURIComponent(code)}`, {
      method: 'POST',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Exchange failed');
        return res.json();
      })
      .then((data: { accessToken: string; refreshToken: string }) => {
        saveTokens(data.accessToken, data.refreshToken);
        router.replace('/dashboard');
      })
      .catch(() => {
        router.replace('/login?error=oauth_failed');
      });
  }, [params, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-400 animate-pulse">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-slate-950">
          <p className="text-slate-400 animate-pulse">Signing you in...</p>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
