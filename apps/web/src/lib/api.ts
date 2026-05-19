import type {
  Portfolio,
  PortfolioResponse,
  AuthTokens,
  UserProfile,
  ExportJob,
  PortfolioAnalytics,
  GitHubRepo,
  ThemePreset,
} from '@devfolio/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('devfolio_access_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (!res.ok) {
    if (
      res.status === 401 &&
      typeof window !== 'undefined' &&
      path !== '/auth/login' &&
      path !== '/auth/register'
    ) {
      localStorage.removeItem('devfolio_access_token');
      localStorage.removeItem('devfolio_refresh_token');
      window.location.href = '/login';
      return undefined as T; // stop execution — navigation is in progress
    }
    throw new ApiError(res.status, json.message ?? 'Request failed', json);
  }

  // Unwrap the { data, message } envelope
  return (json.data ?? json) as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthTokens & { user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),

  me: () =>
    request<UserProfile>('/auth/me'),

  verifyEmail: (token: string) =>
    request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email: string) =>
    request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// ─── Portfolios ────────────────────────────────────────────────────────────

export const portfolioApi = {
  create: (data: { slug: string; title?: string }) =>
    request<PortfolioResponse>('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () =>
    request<PortfolioResponse[]>('/portfolios/mine'),

  getById: (id: string) =>
    request<PortfolioResponse>(`/portfolios/${id}`),

  getBySlug: (slug: string) =>
    request<PortfolioResponse>(`/portfolios/by-slug/${slug}`),

  update: (id: string, data: Partial<Portfolio>) =>
    request<PortfolioResponse>(`/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data }),
    }),

  publish: (id: string) =>
    request<PortfolioResponse>(`/portfolios/${id}/publish`, { method: 'POST' }),

  unpublish: (id: string) =>
    request<PortfolioResponse>(`/portfolios/${id}/unpublish`, { method: 'POST' }),

  delete: (id: string) =>
    request<void>(`/portfolios/${id}`, { method: 'DELETE' }),
};

// ─── Exports ───────────────────────────────────────────────────────────────

export const exportApi = {
  create: (portfolioId: string) =>
    request<ExportJob>('/exports', {
      method: 'POST',
      body: JSON.stringify({ portfolioId }),
    }),

  getStatus: (jobId: string) =>
    request<ExportJob>(`/exports/${jobId}`),

  listByPortfolio: (portfolioId: string) =>
    request<ExportJob[]>(`/exports/portfolio/${portfolioId}`),
};

// ─── GitHub ────────────────────────────────────────────────────────────────

export const githubApi = {
  status: () =>
    request<{ connected: boolean; username?: string }>('/github/status'),

  repos: () =>
    request<GitHubRepo[]>('/github/repos'),

  sync: (portfolioId: string, repoIds: number[]) =>
    request<PortfolioResponse>('/github/sync', {
      method: 'POST',
      body: JSON.stringify({ portfolioId, repoIds }),
    }),

  disconnect: () =>
    request<void>('/github/disconnect', { method: 'DELETE' }),
};

// ─── Analytics ─────────────────────────────────────────────────────────────

export const analyticsApi = {
  track: (data: {
    portfolioId: string;
    type: string;
    sectionId?: string;
    metadata?: Record<string, unknown>;
  }) =>
    request<void>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPortfolioStats: (portfolioId: string, days = 30) =>
    request<PortfolioAnalytics>(`/analytics/portfolio/${portfolioId}?days=${days}`),
};

// ─── Users ─────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () =>
    request<UserProfile>('/users/me'),

  update: (data: { name?: string; bio?: string; avatar?: string }) =>
    request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: () =>
    request<void>('/users/me', { method: 'DELETE' }),
};

// ─── Themes ────────────────────────────────────────────────────────────────

export const themesApi = {
  list: () =>
    request<ThemePreset[]>('/themes'),
};

export { ApiError };
