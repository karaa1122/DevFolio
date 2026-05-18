import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('devfolio_access_token', accessToken);
  localStorage.setItem('devfolio_refresh_token', refreshToken);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('devfolio_access_token');
  localStorage.removeItem('devfolio_refresh_token');
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('devfolio_access_token');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}
