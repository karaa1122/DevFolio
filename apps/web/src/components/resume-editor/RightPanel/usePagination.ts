'use client';

import { useEffect, useState, type RefObject } from 'react';

// 96dpi conversions: 1mm ≈ 3.7795px
const MM_TO_PX = 96 / 25.4;

const PAGE_HEIGHT_MM: Record<string, number> = { A4: 297, Letter: 279.4 };
const MARGIN_MM: Record<string, number> = { narrow: 10, normal: 14, wide: 20 };

interface PaginationOptions {
  format: 'A4' | 'Letter';
  margin: 'narrow' | 'normal' | 'wide';
  /** Section ids in document order. */
  sectionIds: string[];
}

/**
 * Measurement-based paginator. Watches the rendered `.resume-section` elements
 * inside `containerRef` and groups them into pages based on the current page
 * format + margin. Returns an array of arrays of section ids.
 *
 * Edge case: if a single section is taller than a page (very long bullet list)
 * we still put it on its own page — Chromium handles the actual mid-section
 * break via CSS `break-inside: avoid` at print time.
 */
export function usePagination(
  containerRef: RefObject<HTMLElement | null>,
  opts: PaginationOptions,
): string[][] {
  const [pages, setPages] = useState<string[][]>(() => [opts.sectionIds]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const recompute = () => {
      const pageContentHeightPx =
        (PAGE_HEIGHT_MM[opts.format] - 2 * MARGIN_MM[opts.margin]) * MM_TO_PX;

      // Inside the rendered first page, find each top-level section by id.
      // Header is rendered as <header class="resume-header"> and is not in
      // sectionIds but is part of the page budget — we deduct it once.
      const headerEl = node.querySelector('.resume-header') as HTMLElement | null;
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;

      const sectionEls = Array.from(node.querySelectorAll('.resume-section')) as HTMLElement[];

      // Map ids to heights in the order they appear in the DOM
      const heights = sectionEls.map((el) => el.getBoundingClientRect().height);

      const ids = opts.sectionIds;
      // The first non-header section is at index 0 in sectionEls; ids[0] is
      // either the header (skip) or the first non-header section. We align
      // by skipping the header id if present.
      const nonHeaderIds = ids.filter((id) => {
        const el = node.querySelector(`[data-section-id="${id}"]`);
        // we don't actually mark with data-section-id — fall back to assuming
        // ordering matches. The renderer renders header first, then sections
        // in layout order.
        return !!el || true;
      });

      const next: string[][] = [[]];
      let budget = pageContentHeightPx - headerHeight; // first page also has header
      let pageIdx = 0;

      for (let i = 0; i < nonHeaderIds.length && i < heights.length; i++) {
        const h = heights[i];
        if (h <= budget || next[pageIdx].length === 0) {
          // fits, or is the first item on this page (always place it)
          next[pageIdx].push(nonHeaderIds[i]);
          budget -= h;
        } else {
          // new page
          pageIdx += 1;
          next.push([nonHeaderIds[i]]);
          budget = pageContentHeightPx - h;
        }
      }

      // Skip update when the new pages match current to avoid render loops
      setPages((prev) => {
        if (prev.length === next.length && prev.every((p, i) => arraysEqual(p, next[i]))) {
          return prev;
        }
        return next;
      });
    };

    // Run once after mount + on resize / mutation
    const ro = new ResizeObserver(() => {
      // debounce
      window.clearTimeout((recompute as unknown as { _t?: number })._t);
      (recompute as unknown as { _t?: number })._t = window.setTimeout(recompute, 80);
    });
    ro.observe(node);

    const mo = new MutationObserver(() => {
      window.clearTimeout((recompute as unknown as { _t?: number })._t);
      (recompute as unknown as { _t?: number })._t = window.setTimeout(recompute, 80);
    });
    mo.observe(node, { childList: true, subtree: true, characterData: true });

    // initial run on next frame so the DOM is laid out
    requestAnimationFrame(recompute);

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [containerRef, opts.format, opts.margin, opts.sectionIds.join(',')]);

  return pages;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
