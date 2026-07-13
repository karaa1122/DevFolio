import { ThemeSchema, type PortfolioTemplateId, type Theme } from './portfolio';

// ─── Portfolio template catalog ──────────────────────────────────────────────
// Metadata that powers the template marketplace gallery and the editor's
// Template panel. The React components themselves live in @devfolio/renderer
// (templates/registry) — this catalog is renderer-free so the API and web app
// can consume it without pulling in React.

export interface PortfolioTemplateMeta {
  id: PortfolioTemplateId;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  /** Typography character, used by marketplace preview cards. */
  typography: 'sans' | 'serif' | 'mono';
  /**
   * A complete theme that shows the template at its best. Switching templates
   * never overwrites the user's theme automatically — this is opt-in.
   */
  suggestedTheme: Theme;
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplateMeta[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Electric glass on near-black',
    description:
      'The signature DevFolio look — a premium near-black canvas with glass surfaces, an electric lime→cyan accent, and subtle motion throughout.',
    tags: ['dark', 'modern', 'animated'],
    typography: 'sans',
    suggestedTheme: ThemeSchema.parse({}),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Quiet, airy, typographic',
    description:
      'A calm, light-first layout with generous whitespace, hairline rules, and no visual noise. Lets your work speak for itself.',
    tags: ['light', 'clean', 'whitespace'],
    typography: 'sans',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#18181b',
        secondary: '#3f3f46',
        background: '#fafaf9',
        foreground: '#18181b',
        muted: '#71717a',
        accent: '#2563eb',
        card: '#ffffff',
        border: '#e7e5e4',
      },
      font: 'inter',
      radius: 'sm',
      darkMode: false,
      spacing: 'relaxed',
    }),
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Magazine serifs on warm paper',
    description:
      'Oversized serif headlines, warm paper tones, and print-inspired rules — a portfolio that reads like a well-set feature story.',
    tags: ['light', 'serif', 'print'],
    typography: 'serif',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#9a3412',
        secondary: '#c2410c',
        background: '#f8f4ec',
        foreground: '#1c1917',
        muted: '#78716c',
        accent: '#1c1917',
        card: '#fffdf7',
        border: '#e7dfd0',
      },
      font: 'inter',
      radius: 'none',
      darkMode: false,
      spacing: 'relaxed',
    }),
  },
  {
    id: 'terminal',
    name: 'Terminal',
    tagline: 'Monospace, green-on-dark, no fluff',
    description:
      'A developer console aesthetic — monospace everything, phosphor-green accents, square corners, and a prompt for a nav. Built for people who live in the shell.',
    tags: ['dark', 'mono', 'developer'],
    typography: 'mono',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#4ade80',
        secondary: '#22c55e',
        background: '#0a0e0b',
        foreground: '#d4dbd6',
        muted: '#7c877f',
        accent: '#22d3ee',
        card: '#101612',
        border: '#1e2a21',
      },
      font: 'jetbrains-mono',
      radius: 'none',
      darkMode: true,
      spacing: 'normal',
    }),
  },
  {
    id: 'retro-os',
    name: 'Retro OS',
    tagline: 'Your portfolio as a desktop of windows',
    description:
      'Every section is a floating window — traffic lights, title bars, a menu-bar nav and a wallpaper backdrop. A portfolio that feels like booting into someone’s machine.',
    tags: ['playful', 'unique', 'windows'],
    typography: 'sans',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#4f7cff',
        secondary: '#3b5fd9',
        background: '#eef1f6',
        foreground: '#1d2433',
        muted: '#5c6675',
        accent: '#e0447c',
        card: '#ffffff',
        border: '#c9cfd9',
      },
      font: 'inter',
      radius: 'md',
      darkMode: false,
      spacing: 'compact',
    }),
  },
  {
    id: 'dimension',
    name: 'Dimension',
    tagline: 'A starfield warp with 3D depth',
    description:
      'Fly through space — a real-time starfield streams past while cards tilt into view with 3D perspective and glow on hover. Deep-space chrome, zero dependencies.',
    tags: ['dark', '3d', 'animated'],
    typography: 'sans',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#8b7cff',
        secondary: '#6d5ce6',
        background: '#05060f',
        foreground: '#e8eaf6',
        muted: '#8d93b3',
        accent: '#00e5ff',
        card: '#0d1020',
        border: '#222848',
      },
      font: 'poppins',
      radius: 'lg',
      darkMode: true,
      spacing: 'normal',
    }),
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    tagline: 'Loud borders, louder type',
    description:
      'Neo-brutalism — thick ink borders, hard offset shadows, huge uppercase headlines and one screaming accent color. Impossible to scroll past.',
    tags: ['bold', 'raw', 'statement'],
    typography: 'sans',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#ff4911',
        secondary: '#111111',
        background: '#f5f1e8',
        foreground: '#111111',
        muted: '#57534e',
        accent: '#1400ff',
        card: '#ffffff',
        border: '#111111',
      },
      font: 'inter',
      radius: 'none',
      darkMode: false,
      spacing: 'normal',
    }),
  },
  {
    id: 'glitch',
    name: 'Glitch',
    tagline: 'Cyberpunk chromatic chaos',
    description:
      'RGB-split headlines that glitch and jitter, animated neon card borders, and a scanline haze — a portfolio transmitted from a broken future.',
    tags: ['dark', 'cyberpunk', 'animated'],
    typography: 'sans',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#ff2ec4',
        secondary: '#d916a8',
        background: '#0b0b12',
        foreground: '#eceaf4',
        muted: '#8f8ba6',
        accent: '#00f0ff',
        card: '#12121d',
        border: '#28283d',
      },
      font: 'poppins',
      radius: 'sm',
      darkMode: true,
      spacing: 'normal',
    }),
  },
  {
    id: 'arcade',
    name: 'Arcade',
    tagline: '8-bit pixels behind CRT glass',
    description:
      'Press Start 2P headlines, pixel-hard buttons with chunky drop edges, CRT scanlines and a blinking INSERT COIN — your career as the greatest game ever shipped.',
    tags: ['retro', '8-bit', 'playful'],
    typography: 'mono',
    suggestedTheme: ThemeSchema.parse({
      colors: {
        primary: '#facc15',
        secondary: '#eab308',
        background: '#10141f',
        foreground: '#f6f5e8',
        muted: '#94a0b8',
        accent: '#22d3ee',
        card: '#1a2030',
        border: '#38415c',
      },
      font: 'jetbrains-mono',
      radius: 'none',
      darkMode: true,
      spacing: 'compact',
    }),
  },
];

export function getPortfolioTemplate(id: string | undefined): PortfolioTemplateMeta {
  return PORTFOLIO_TEMPLATES.find((t) => t.id === id) ?? PORTFOLIO_TEMPLATES[0];
}
