'use client';

'use client';

import useSWR from 'swr';
import { portfolioApi } from '@/lib/api';
import type { PortfolioResponse } from '@devfolio/shared';

export function usePortfolio(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PortfolioResponse>(
    id ? `/portfolios/${id}` : null,
    () => portfolioApi.getById(id!),
    { revalidateOnFocus: false },
  );
  return { portfolio: data, error, isLoading, mutate };
}

export function usePortfolioList() {
  const { data, error, isLoading, mutate } = useSWR<PortfolioResponse[]>(
    '/portfolios/mine',
    portfolioApi.list,
    { revalidateOnFocus: false },
  );
  return { portfolios: data ?? [], error, isLoading, mutate };
}

export function usePublicPortfolio(slug: string | null) {
  const { data, error, isLoading } = useSWR<PortfolioResponse>(
    slug ? `/portfolios/by-slug/${slug}` : null,
    () => portfolioApi.getBySlug(slug!),
    { revalidateOnFocus: false },
  );
  return { portfolio: data, error, isLoading };
}
