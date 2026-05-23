const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Accepts ISO `YYYY-MM-DD`, `YYYY-MM`, or `YYYY` and returns `MMM YYYY` / `YYYY`.
 * If the input doesn't parse cleanly it's returned untouched — users sometimes
 * type 'Summer 2023' and we should respect that.
 */
export function formatDate(input: string | undefined): string {
  if (!input) return '';
  const m = /^(\d{4})(?:-(\d{1,2}))?(?:-\d{1,2})?$/.exec(input.trim());
  if (!m) return input;
  const year = m[1];
  if (!m[2]) return year;
  const month = parseInt(m[2], 10) - 1;
  if (month < 0 || month > 11) return year;
  return `${MONTH_SHORT[month]} ${year}`;
}

export function formatDateRange(
  start: string,
  end: string | undefined,
  current: boolean,
): string {
  const a = formatDate(start);
  const b = current ? 'Present' : formatDate(end ?? '');
  if (!a && !b) return '';
  if (!b) return a;
  if (!a) return b;
  if (a === b) return a;
  return `${a} – ${b}`;
}
