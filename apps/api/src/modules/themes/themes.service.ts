import { Injectable } from '@nestjs/common';
import type { Theme } from '@devfolio/shared';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: string;
  theme: Theme;
}

@Injectable()
export class ThemesService {
  private readonly presets: ThemePreset[] = [
    {
      id: 'midnight',
      name: 'Midnight',
      description: 'Deep dark with violet accents',
      preview: '#7c3aed',
      theme: {
        colors: {
          primary: '#7c3aed',
          secondary: '#a78bfa',
          background: '#0f172a',
          foreground: '#f8fafc',
          muted: '#94a3b8',
          accent: '#06b6d4',
          card: '#1e293b',
          border: '#334155',
        },
        font: 'inter',
        radius: 'md',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'ocean',
      name: 'Ocean',
      description: 'Cool blues and teals',
      preview: '#0ea5e9',
      theme: {
        colors: {
          primary: '#0ea5e9',
          secondary: '#38bdf8',
          background: '#0c1a2e',
          foreground: '#f0f9ff',
          muted: '#7dd3fc',
          accent: '#22d3ee',
          card: '#0f2744',
          border: '#1e3a5f',
        },
        font: 'inter',
        radius: 'lg',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'forest',
      name: 'Forest',
      description: 'Natural greens and earth tones',
      preview: '#16a34a',
      theme: {
        colors: {
          primary: '#16a34a',
          secondary: '#4ade80',
          background: '#0a1a0f',
          foreground: '#f0fdf4',
          muted: '#86efac',
          accent: '#84cc16',
          card: '#14291c',
          border: '#166534',
        },
        font: 'inter',
        radius: 'md',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'sunset',
      name: 'Sunset',
      description: 'Warm oranges and reds',
      preview: '#f97316',
      theme: {
        colors: {
          primary: '#f97316',
          secondary: '#fb923c',
          background: '#1a0a00',
          foreground: '#fff7ed',
          muted: '#fdba74',
          accent: '#fbbf24',
          card: '#2a1200',
          border: '#7c2d12',
        },
        font: 'poppins',
        radius: 'md',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'minimal-light',
      name: 'Minimal Light',
      description: 'Clean white with subtle accents',
      preview: '#1e293b',
      theme: {
        colors: {
          primary: '#1e293b',
          secondary: '#475569',
          background: '#ffffff',
          foreground: '#0f172a',
          muted: '#64748b',
          accent: '#3b82f6',
          card: '#f8fafc',
          border: '#e2e8f0',
        },
        font: 'inter',
        radius: 'sm',
        darkMode: false,
        spacing: 'relaxed',
      },
    },
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'Retro green-on-black developer look',
      preview: '#00ff41',
      theme: {
        colors: {
          primary: '#00ff41',
          secondary: '#39ff14',
          background: '#000000',
          foreground: '#00ff41',
          muted: '#008f11',
          accent: '#00b4d8',
          card: '#0d0d0d',
          border: '#003b00',
        },
        font: 'fira-code',
        radius: 'none',
        darkMode: true,
        spacing: 'compact',
      },
    },
  ];

  findAll(): ThemePreset[] {
    return this.presets;
  }

  findById(id: string): ThemePreset | undefined {
    return this.presets.find((p) => p.id === id);
  }
}
