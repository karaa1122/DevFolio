'use client';

import { useEffect } from 'react';
import { analyticsApi } from '@/lib/api';

export function PortfolioViewTracker({ portfolioId }: { portfolioId: string }) {
  useEffect(() => {
    analyticsApi.track({ portfolioId, type: 'page_view' }).catch(() => {});
  }, [portfolioId]);

  return null;
}
