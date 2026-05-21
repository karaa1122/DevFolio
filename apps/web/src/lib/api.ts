import type {
  Portfolio,
  PortfolioResponse,
  UserProfile,
  ExportJob,
  PortfolioAnalytics,
  GitHubRepo,
  ThemePreset,
  Resume,
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (!res.ok) {
    if (
      res.status === 401 &&
      typeof window !== 'undefined' &&
      path !== '/auth/login' &&
      path !== '/auth/register'
    ) {
      // Try silent refresh before giving up
      if (path !== '/auth/refresh') {
        try {
          const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshRes.ok) {
            // Retry original request with the new access cookie
            const retryRes = await fetch(`${API_BASE}/api/v1${path}`, {
              ...options,
              headers,
              credentials: 'include',
            });
            if (retryRes.status === 204) return undefined as T;
            const retryJson = await retryRes.json();
            if (!retryRes.ok) throw new ApiError(retryRes.status, retryJson.message ?? 'Request failed', retryJson);
            return (retryJson.data ?? retryJson) as T;
          }
        } catch {
          // fall through to redirect
        }
      }
      window.location.href = '/login';
      return undefined as T;
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
    request<{ user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: () => request<void>('/auth/refresh', { method: 'POST' }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  me: () => request<UserProfile>('/auth/me'),

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

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// ─── Portfolios ────────────────────────────────────────────────────────────

export const portfolioApi = {
  create: (data: { slug: string; title?: string }) =>
    request<PortfolioResponse>('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => request<PortfolioResponse[]>('/portfolios/mine'),

  getById: (id: string) => request<PortfolioResponse>(`/portfolios/${id}`),

  getBySlug: (slug: string) => request<PortfolioResponse>(`/portfolios/by-slug/${slug}`),

  update: (id: string, data: Partial<Portfolio>) =>
    request<PortfolioResponse>(`/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data }),
    }),

  publish: (id: string) =>
    request<PortfolioResponse>(`/portfolios/${id}/publish`, { method: 'POST' }),

  unpublish: (id: string) =>
    request<PortfolioResponse>(`/portfolios/${id}/unpublish`, { method: 'POST' }),

  updateSlug: (id: string, slug: string) =>
    request<PortfolioResponse>(`/portfolios/${id}/slug`, {
      method: 'PATCH',
      body: JSON.stringify({ slug }),
    }),

  delete: (id: string) => request<void>(`/portfolios/${id}`, { method: 'DELETE' }),
};

// ─── Exports ───────────────────────────────────────────────────────────────

export const exportApi = {
  create: (portfolioId: string) =>
    request<ExportJob>('/exports', {
      method: 'POST',
      body: JSON.stringify({ portfolioId }),
    }),

  getStatus: (jobId: string) => request<ExportJob>(`/exports/${jobId}`),

  listByPortfolio: (portfolioId: string) =>
    request<ExportJob[]>(`/exports/portfolio/${portfolioId}`),
};

// ─── GitHub ────────────────────────────────────────────────────────────────

export const githubApi = {
  status: () => request<{ connected: boolean; username?: string }>('/github/status'),

  repos: () => request<GitHubRepo[]>('/github/repos'),

  sync: (portfolioId: string, repoIds: number[]) =>
    request<PortfolioResponse>('/github/sync', {
      method: 'POST',
      body: JSON.stringify({ portfolioId, repoIds }),
    }),

  disconnect: () => request<void>('/github/disconnect', { method: 'DELETE' }),
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
  me: () => request<UserProfile>('/users/me'),

  update: (data: { name?: string; bio?: string; avatar?: string }) =>
    request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: () => request<void>('/users/me', { method: 'DELETE' }),
};

// ─── Themes ────────────────────────────────────────────────────────────────

export const themesApi = {
  list: () => request<ThemePreset[]>('/themes'),
};

// ─── Resumes ───────────────────────────────────────────────────────────────

export interface ResumeRecord {
  id: string;
  userId: string;
  portfolioId?: string;
  data: Resume;
  createdAt: string;
  updatedAt: string;
}

export const resumeApi = {
  create: (data: { title?: string; portfolioId?: string }) =>
    request<ResumeRecord>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => request<ResumeRecord[]>('/resumes'),

  getById: (id: string) => request<ResumeRecord>(`/resumes/${id}`),

  update: (id: string, data: Partial<Resume>) =>
    request<ResumeRecord>(`/resumes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data }),
    }),

  delete: (id: string) => request<void>(`/resumes/${id}`, { method: 'DELETE' }),

  export: (id: string) => request<ExportJob>(`/resumes/${id}/export`, { method: 'POST' }),

  listExports: (id: string) => request<ExportJob[]>(`/resumes/${id}/exports`),
};

export { ApiError };
