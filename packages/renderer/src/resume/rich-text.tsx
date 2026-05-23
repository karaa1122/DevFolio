import React from 'react';
import sanitizeHtml from 'sanitize-html';
import { renderInlineMarkdown } from './inline-markdown';

// Tags + attributes allowed in resume rich-text fields. Anything outside this
// whitelist is stripped at render time, so even if the DB is somehow poisoned
// the print path can't execute scripts or load external resources.
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
];

const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    p: ['class', 'style'],
    li: ['class'],
  },
  // Only safe URL schemes inside <a href>. No `javascript:` URIs.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href'],
  // Whitelist alignment classes Tiptap emits via @tiptap/extension-text-align,
  // plus the bare `text-align: …` inline styles it may produce instead.
  allowedClasses: {
    p: ['text-left', 'text-center', 'text-right', 'text-justify'],
    li: ['text-left', 'text-center', 'text-right', 'text-justify'],
  },
  allowedStyles: {
    p: {
      'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/],
    },
  },
  // Always open external links in a new tab + isolate the opener.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  },
};

/**
 * Renders a resume rich-text field. The field is either:
 *   • Tiptap HTML (contains `<` and one of the allowed tags) — sanitized and
 *     mounted via dangerouslySetInnerHTML.
 *   • Legacy markdown / plain text (`**bold**` / `*italic*`) — parsed into
 *     React nodes so older resumes keep working until the user edits them.
 *
 * The `as` prop picks the wrapping element so the caller can keep semantic
 * meaning (paragraph for prose, fragment for list-item content, etc.).
 */
export function renderResumeContent(
  input: string | undefined | null,
  options: { as?: 'p' | 'div' | 'fragment'; className?: string } = {},
): React.ReactNode {
  if (!input) return null;

  const isHtml = looksLikeHtml(input);
  const { as = 'p', className } = options;

  if (isHtml) {
    const clean = sanitizeHtml(input, SANITIZE_CONFIG);
    if (as === 'fragment') {
      return <span className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
    }
    const Tag = as;
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  const content = renderInlineMarkdown(input);
  if (as === 'fragment') return <>{content}</>;
  const Tag = as;
  return <Tag className={className}>{content}</Tag>;
}

function looksLikeHtml(input: string): boolean {
  return /<\s*(p|br|strong|em|u|s|a|ul|ol|li)\b/i.test(input);
}

// ─── Editor → string helpers ──────────────────────────────────────────────

/**
 * Naively converts our supported markdown subset to HTML so we can hand a
 * legacy field straight to Tiptap on the first edit. Keeps content live
 * during the silent migration — users never see their formatting vanish.
 */
export function markdownToHtml(input: string | undefined | null): string {
  if (!input) return '';
  const lines = input.split(/\r?\n/);
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const joined = buffer.join('<br />');
    paragraphs.push(`<p>${inline(joined)}</p>`);
    buffer = [];
  };

  for (const line of lines) {
    if (line.trim() === '') {
      flush();
    } else {
      buffer.push(escapeHtml(line));
    }
  }
  flush();

  return paragraphs.join('');
}

function inline(text: string): string {
  // Bold first so the inner italic regex doesn't eat the `**` markers.
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** True if the value already contains HTML tags we recognise. */
export function isResumeHtml(input: string | undefined | null): boolean {
  if (!input) return false;
  return looksLikeHtml(input);
}
