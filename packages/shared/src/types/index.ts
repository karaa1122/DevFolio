// ─── API Response Shapes ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  githubUsername?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Portfolio Entity Response (returned by all portfolio API endpoints) ───

export interface PortfolioResponse {
  id: string;
  slug: string;
  userId: string;
  isPublished: boolean;
  viewCount: number;
  data: Portfolio;
  createdAt: string;
  updatedAt: string;
}

// ─── Portfolio List Item ────────────────────────────────────────────────────

export interface PortfolioListItem {
  id: string;
  slug: string;
  title?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
}

// ─── Export Job ─────────────────────────────────────────────────────────────

export type ExportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportJob {
  id: string;
  portfolioId: string;
  status: ExportJobStatus;
  fileUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export type AnalyticsEventType =
  | 'page_view'
  | 'section_view'
  | 'project_click'
  | 'resume_download'
  | 'contact_form_submit'
  | 'social_click'
  | 'cta_click';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  portfolioId: string;
  sectionId?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export interface PortfolioAnalytics {
  portfolioId: string;
  totalViews: number;
  uniqueVisitors: number;
  topSections: Array<{ sectionId: string; views: number }>;
  viewsByDay: Array<{ date: string; views: number }>;
}

// ─── GitHub Integration ─────────────────────────────────────────────────────

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  homepage?: string;
  stars: number;
  forks: number;
  language?: string;
  topics: string[];
  isPrivate: boolean;
  updatedAt: string;
}

// ─── Theme presets ─────────────────────────────────────────────────────────

import type { Theme, Portfolio } from '../schema/portfolio';

export interface ThemePreset {
  id: string;
  name: string;
  preview: string;
  theme: Theme;
}

// Re-export from schema for convenience
export type { Portfolio, Section, Theme, SectionType } from '../schema/portfolio';
