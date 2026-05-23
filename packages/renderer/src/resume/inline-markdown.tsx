import React from 'react';

/**
 * Parses a tiny subset of Markdown for inline use inside resume bodies:
 *
 *   `**bold**`   → <strong>bold</strong>
 *   `*italic*`   → <em>italic</em>
 *   `***both***` → <strong><em>both</em></strong>
 *
 * Returns React nodes — no `dangerouslySetInnerHTML`, so user input can never
 * inject HTML or script. Lone `*` characters (e.g. in "5 * 5") are preserved
 * as text whenever no matching closing delimiter is found.
 *
 * Why a hand-rolled parser instead of remark/marked: every resume field that
 * uses this is one paragraph at most, runs inside the print path, and we
 * already strip blocks like headings and lists at the section boundary.
 * Pulling in a real markdown engine would balloon the renderer bundle and
 * the Chromium PDF cold-start without buying us anything.
 */
export function renderInlineMarkdown(input: string | undefined | null): React.ReactNode {
  if (!input) return null;
  return <>{tokenize(input).map((node, i) => <React.Fragment key={i}>{node}</React.Fragment>)}</>;
}

function tokenize(input: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let buffer = '';

  const flushBuffer = () => {
    if (buffer) {
      out.push(buffer);
      buffer = '';
    }
  };

  while (i < input.length) {
    const c = input[i];

    // Bold: **...**
    if (c === '*' && input[i + 1] === '*') {
      const end = findClosing(input, i + 2, '**');
      if (end !== -1) {
        flushBuffer();
        out.push(<strong>{tokenize(input.slice(i + 2, end))}</strong>);
        i = end + 2;
        continue;
      }
    }

    // Italic: *...*  — but only when the closing `*` isn't immediately followed
    // by another `*` (that would be the start of a bold marker).
    if (c === '*') {
      const end = findClosing(input, i + 1, '*');
      if (end !== -1 && end !== i + 1) {
        flushBuffer();
        out.push(<em>{tokenize(input.slice(i + 1, end))}</em>);
        i = end + 1;
        continue;
      }
    }

    buffer += c;
    i++;
  }

  flushBuffer();
  return out;
}

function findClosing(input: string, from: number, marker: string): number {
  // Skip past any escaped occurrences (we don't support escape syntax yet,
  // but reserving the position-scan helper keeps the parser easy to extend).
  let i = from;
  while (i <= input.length - marker.length) {
    if (input.slice(i, i + marker.length) === marker) {
      // For `**` (bold), don't get confused by `***` (bold-italic open).
      // For `*` (italic), don't match the first `*` of an adjacent `**`.
      if (marker === '*' && input[i + 1] === '*') {
        i++;
        continue;
      }
      return i;
    }
    i++;
  }
  return -1;
}
