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
      id: 'aurora',
      name: 'Aurora',
      description: 'Warm near-black with an electric lime→cyan glow',
      preview: '#bef264',
      theme: {
        colors: {
          primary: '#bef264',
          secondary: '#a3e635',
          background: '#0a0a0c',
          foreground: '#ededf0',
          muted: '#8a8a93',
          accent: '#22d3ee',
          card: '#141417',
          border: '#26262b',
        },
        font: 'inter',
        radius: 'lg',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'nebula',
      name: 'Nebula',
      description: 'Deep cosmic violet melting into hot pink',
      preview: '#a78bfa',
      theme: {
        colors: {
          primary: '#a78bfa',
          secondary: '#c4b5fd',
          background: '#0b0918',
          foreground: '#f4f1ff',
          muted: '#9a93b8',
          accent: '#f472b6',
          card: '#161033',
          border: '#2a2150',
        },
        font: 'inter',
        radius: 'lg',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'ember',
      name: 'Ember',
      description: 'Toasted charcoal with amber and rose heat',
      preview: '#fb923c',
      theme: {
        colors: {
          primary: '#fb923c',
          secondary: '#fdba74',
          background: '#140d0a',
          foreground: '#fff4ed',
          muted: '#b79b8c',
          accent: '#f43f5e',
          card: '#221511',
          border: '#3a241b',
        },
        font: 'poppins',
        radius: 'md',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'tide',
      name: 'Tide',
      description: 'Midnight ocean with sky-blue and teal currents',
      preview: '#38bdf8',
      theme: {
        colors: {
          primary: '#38bdf8',
          secondary: '#7dd3fc',
          background: '#07131d',
          foreground: '#ecfeff',
          muted: '#7c98a8',
          accent: '#2dd4bf',
          card: '#0c2233',
          border: '#16384f',
        },
        font: 'inter',
        radius: 'lg',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'noir',
      name: 'Noir',
      description: 'Minimal monochrome luxe with one electric pop',
      preview: '#fafafa',
      theme: {
        colors: {
          primary: '#fafafa',
          secondary: '#d4d4d4',
          background: '#0a0a0a',
          foreground: '#fafafa',
          muted: '#8a8a8a',
          accent: '#6366f1',
          card: '#161616',
          border: '#2a2a2a',
        },
        font: 'jetbrains-mono',
        radius: 'sm',
        darkMode: true,
        spacing: 'normal',
      },
    },
    {
      id: 'rose-quartz',
      name: 'Rose Quartz',
      description: 'Airy light theme with violet and magenta accents',
      preview: '#7c3aed',
      theme: {
        colors: {
          primary: '#7c3aed',
          secondary: '#a78bfa',
          background: '#fbfafc',
          foreground: '#1a1523',
          muted: '#6b6577',
          accent: '#ec4899',
          card: '#ffffff',
          border: '#ece9f1',
        },
        font: 'inter',
        radius: 'lg',
        darkMode: false,
        spacing: 'relaxed',
      },
    },
    {
      id: 'sandstone',
      name: 'Sandstone',
      description: 'Warm editorial paper with terracotta and teal',
      preview: '#c2410c',
      theme: {
        colors: {
          primary: '#c2410c',
          secondary: '#ea580c',
          background: '#faf7f0',
          foreground: '#1c1917',
          muted: '#78716c',
          accent: '#0d9488',
          card: '#ffffff',
          border: '#ece5d8',
        },
        font: 'poppins',
        radius: 'md',
        darkMode: false,
        spacing: 'relaxed',
      },
    },
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'Retro green-on-black hacker aesthetic',
      preview: '#22ff88',
      theme: {
        colors: {
          primary: '#22ff88',
          secondary: '#4ade80',
          background: '#050705',
          foreground: '#d7ffe0',
          muted: '#5fa47a',
          accent: '#2dd4bf',
          card: '#0b0f0b',
          border: '#14301c',
        },
        font: 'jetbrains-mono',
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
