'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('devfolio_access_token', token);
    }
    router.replace('/dashboard');
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
