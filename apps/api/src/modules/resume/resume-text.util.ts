import type { Resume, ResumeSection } from '@devfolio/shared';

/**
 * Serialize a resume's structured JSON into clean, section-tagged plain text
 * for the ATS matching engine. Because we start from structured data (not a
 * parsed PDF), the engine sees exactly what the resume says — no OCR noise.
 */

/** Tiptap stores rich text as HTML — flatten it to plain text. */
function stripHtml(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function lines(...parts: Array<string | undefined | null | false>): string {
  return parts.filter(Boolean).join('\n');
}

function serializeSection(section: ResumeSection): string {
  if (!section.visible) return '';
  const d = section.data as Record<string, unknown>;

  switch (section.type) {
    case 'header': {
      const h = section.data;
      return lines(h.name, h.title, h.location);
    }
    case 'summary':
      return lines(section.data.heading, stripHtml(section.data.body));
    case 'experience':
      return lines(
        section.data.heading,
        ...section.data.items.map((it) =>
          lines(
            `${it.role} at ${it.company} (${it.startDate} – ${it.current ? 'Present' : (it.endDate ?? '')})`,
            stripHtml(it.summary),
            ...it.bullets.map((b) => `- ${stripHtml(b)}`),
            it.technologies.length > 0 && `Technologies: ${it.technologies.join(', ')}`,
          ),
        ),
      );
    case 'projects':
      return lines(
        section.data.heading,
        ...section.data.items.map((it) =>
          lines(
            it.name,
            stripHtml(it.description),
            ...it.bullets.map((b) => `- ${stripHtml(b)}`),
            it.technologies.length > 0 && `Technologies: ${it.technologies.join(', ')}`,
          ),
        ),
      );
    case 'education':
      return lines(
        section.data.heading,
        ...section.data.items.map((it) =>
          lines(
            `${it.degree}${it.field ? ` in ${it.field}` : ''}, ${it.institution}`,
            ...it.details.map((x) => `- ${stripHtml(x)}`),
          ),
        ),
      );
    case 'skills':
      return lines(
        section.data.heading,
        ...section.data.groups.map((g) => `${g.category}: ${g.items.join(', ')}`),
      );
    case 'certifications':
      return lines(
        section.data.heading,
        ...section.data.items.map((it) => `${it.name}${it.issuer ? ` — ${it.issuer}` : ''}`),
      );
    case 'awards':
      return lines(
        section.data.heading,
        ...section.data.items.map((it) =>
          lines(`${it.name}${it.issuer ? ` — ${it.issuer}` : ''}`, stripHtml(it.description)),
        ),
      );
    case 'languages':
      return lines(
        section.data.heading,
        section.data.items.map((it) => `${it.name} (${it.proficiency})`).join(', '),
      );
    case 'custom':
      return lines(
        section.data.heading,
        ...section.data.items.map((it) =>
          lines(
            it.title,
            it.subtitle,
            stripHtml(it.description),
            ...it.bullets.map((b) => `- ${stripHtml(b)}`),
          ),
        ),
      );
    default:
      return typeof d.heading === 'string' ? d.heading : '';
  }
}

export function resumeToPlainText(resume: Resume): string {
  const byId = new Map(resume.sections.map((s) => [s.id, s]));
  const ordered = resume.layout.sectionsOrder
    .map((id) => byId.get(id))
    .filter((s): s is ResumeSection => s !== undefined);
  // Sections not in the order array still count — append them.
  const rest = resume.sections.filter((s) => !resume.layout.sectionsOrder.includes(s.id));

  return [...ordered, ...rest]
    .map(serializeSection)
    .filter(Boolean)
    .join('\n\n');
}
