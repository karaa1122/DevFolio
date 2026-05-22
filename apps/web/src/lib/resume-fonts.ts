export type FontCategory = 'sans' | 'serif' | 'mono';

export interface FontDef {
  id: string;
  name: string;
  googleName?: string;       // Google Fonts family name (undefined = system font)
  weights?: string;          // e.g. "300;400;500;600;700;800"
  css: string;               // CSS font-family stack
  category: FontCategory;
}

export const FONTS: FontDef[] = [
  // ─── Sans-Serif ───────────────────────────────────────────────────────────
  { id: 'inter',       name: 'Inter',           css: "'Inter', system-ui, sans-serif",                        category: 'sans' },
  { id: 'roboto',      name: 'Roboto',          googleName: 'Roboto',          weights: '300;400;500;700',    css: "'Roboto', sans-serif",          category: 'sans' },
  { id: 'opensans',    name: 'Open Sans',       googleName: 'Open+Sans',       weights: '300;400;600;700',    css: "'Open Sans', sans-serif",       category: 'sans' },
  { id: 'lato',        name: 'Lato',            googleName: 'Lato',            weights: '300;400;700',        css: "'Lato', sans-serif",            category: 'sans' },
  { id: 'sourcesans',  name: 'Source Sans 3',   googleName: 'Source+Sans+3',   weights: '300;400;500;600;700',css: "'Source Sans 3', sans-serif",   category: 'sans' },
  { id: 'nunito',      name: 'Nunito',          googleName: 'Nunito',          weights: '300;400;500;600;700',css: "'Nunito', sans-serif",          category: 'sans' },
  { id: 'mulish',      name: 'Mulish',          googleName: 'Mulish',          weights: '300;400;500;600;700',css: "'Mulish', sans-serif",          category: 'sans' },
  { id: 'karla',       name: 'Karla',           googleName: 'Karla',           weights: '300;400;500;600;700',css: "'Karla', sans-serif",           category: 'sans' },
  { id: 'worksans',    name: 'Work Sans',       googleName: 'Work+Sans',       weights: '300;400;500;600;700',css: "'Work Sans', sans-serif",       category: 'sans' },
  { id: 'barlow',      name: 'Barlow',          googleName: 'Barlow',          weights: '300;400;500;600;700',css: "'Barlow', sans-serif",          category: 'sans' },
  { id: 'firasans',    name: 'Fira Sans',       googleName: 'Fira+Sans',       weights: '300;400;500;600;700',css: "'Fira Sans', sans-serif",       category: 'sans' },
  { id: 'jost',        name: 'Jost',            googleName: 'Jost',            weights: '300;400;500;600;700',css: "'Jost', sans-serif",            category: 'sans' },
  { id: 'ibmplexsans', name: 'IBM Plex Sans',   googleName: 'IBM+Plex+Sans',   weights: '300;400;500;600;700',css: "'IBM Plex Sans', sans-serif",   category: 'sans' },
  { id: 'rubik',       name: 'Rubik',           googleName: 'Rubik',           weights: '300;400;500;600;700',css: "'Rubik', sans-serif",           category: 'sans' },
  { id: 'raleway',     name: 'Raleway',         googleName: 'Raleway',         weights: '300;400;500;600;700',css: "'Raleway', sans-serif",         category: 'sans' },
  { id: 'asap',        name: 'Asap',            googleName: 'Asap',            weights: '400;500;600;700',    css: "'Asap', sans-serif",            category: 'sans' },

  // ─── Serif ────────────────────────────────────────────────────────────────
  { id: 'georgia',     name: 'Georgia',         css: "Georgia, 'Times New Roman', serif",                     category: 'serif' },
  { id: 'lora',        name: 'Lora',            googleName: 'Lora',            weights: '400;500;600;700',    css: "'Lora', serif",                 category: 'serif' },
  { id: 'merriweather',name: 'Merriweather',    googleName: 'Merriweather',    weights: '300;400;700',        css: "'Merriweather', serif",         category: 'serif' },
  { id: 'playfair',    name: 'Playfair Display',googleName: 'Playfair+Display',weights: '400;500;600;700;800',css: "'Playfair Display', serif",     category: 'serif' },
  { id: 'garamond',    name: 'EB Garamond',     googleName: 'EB+Garamond',     weights: '400;500;600;700',    css: "'EB Garamond', serif",          category: 'serif' },

  // ─── Monospace ────────────────────────────────────────────────────────────
  { id: 'jetbrains',   name: 'JetBrains Mono',  googleName: 'JetBrains+Mono',  weights: '300;400;500;700',    css: "'JetBrains Mono', monospace",   category: 'mono' },
  { id: 'firacode',    name: 'Fira Code',       googleName: 'Fira+Code',       weights: '300;400;500;700',    css: "'Fira Code', monospace",        category: 'mono' },
  { id: 'ibmplexmono', name: 'IBM Plex Mono',   googleName: 'IBM+Plex+Mono',   weights: '300;400;500;700',    css: "'IBM Plex Mono', monospace",    category: 'mono' },
];

export const FONT_MAP = Object.fromEntries(FONTS.map(f => [f.id, f]));

export function getFontCss(fontId: string): string {
  return FONT_MAP[fontId]?.css ?? FONTS[0].css;
}

export function getGoogleFontUrl(fontId: string): string | null {
  const def = FONT_MAP[fontId];
  if (!def?.googleName) return null;
  const weights = def.weights ?? '400;700';
  return `https://fonts.googleapis.com/css2?family=${def.googleName}:wght@${weights}&display=swap`;
}
