// All six fonts used by resume templates, mirroring FONT_URL in print.css.ts.
const FONT_CSS_URLS: Record<string, string> = {
  inter:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'source-sans':
    'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap',
  'ibm-plex-sans':
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
  merriweather:
    'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap',
  'jetbrains-mono':
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
};

// Pretend to be a modern Chrome so Google Fonts returns woff2 (not ttf/woff).
const CHROME_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const cache = new Map<string, string>(); // fontKey → fully-inlined CSS
let warmPromise: Promise<void> | null = null;

async function fetchAndInline(cssUrl: string): Promise<string> {
  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': CHROME_UA } });
  if (!cssRes.ok) throw new Error(`HTTP ${cssRes.status} fetching font CSS`);
  let css = await cssRes.text();

  // Collect every unique font-file URL referenced in the CSS.
  const fontFileUrls = new Set<string>();
  for (const [, url] of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)) {
    fontFileUrls.add(url);
  }

  // Download all font files in parallel and encode as data URIs.
  const dataUris = new Map<string, string>();
  await Promise.all(
    Array.from(fontFileUrls).map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
      const buf = await res.arrayBuffer();
      dataUris.set(url, `data:font/woff2;base64,${Buffer.from(buf).toString('base64')}`);
    }),
  );

  // Splice in data URIs so the resulting CSS is self-contained.
  css = css.replace(
    /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g,
    (_, url: string) => `url(${dataUris.get(url) ?? url})`,
  );

  return css;
}

/**
 * Begin warming the font cache in the background.  Safe to call multiple
 * times — only the first call starts the work; subsequent calls share the
 * same promise.
 */
export function startWarmFontCache(): Promise<void> {
  if (warmPromise) return warmPromise;

  warmPromise = Promise.all(
    Object.entries(FONT_CSS_URLS).map(async ([key, url]) => {
      try {
        cache.set(key, await fetchAndInline(url));
      } catch (err) {
        console.warn(`[FontCache] Failed to inline font "${key}":`, err);
      }
    }),
  ).then(() => {
    console.log(`[FontCache] ${cache.size}/${Object.keys(FONT_CSS_URLS).length} fonts warmed`);
  });

  return warmPromise;
}

/**
 * Returns the fully-inlined font CSS for a given font key, or null if the
 * cache hasn't finished warming for that font yet (caller should fall back
 * to the Google Fonts <link> tag).
 */
export function getInlinedFontCss(fontKey: string): string | null {
  return cache.get(fontKey) ?? null;
}
