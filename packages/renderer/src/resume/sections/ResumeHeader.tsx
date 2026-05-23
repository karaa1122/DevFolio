import React from 'react';
import type { ResumeHeaderSection } from '@devfolio/shared';

interface Props {
  section: ResumeHeaderSection;
}

interface ContactItem {
  key: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
}

const ICON_SIZE = 9; // pt — matches resume meta type

export function ResumeHeader({ section }: Props) {
  const d = section.data;
  const socials = d.socials ?? {};
  const items: ContactItem[] = [];

  if (d.email) {
    items.push({
      key: 'email',
      label: d.email,
      href: `mailto:${d.email}`,
      icon: <Icon.Email />,
    });
  }
  if (d.phone) {
    items.push({
      key: 'phone',
      label: d.phone,
      href: `tel:${d.phone.replace(/[^+\d]/g, '')}`,
      icon: <Icon.Phone />,
    });
  }
  if (d.location) {
    items.push({ key: 'location', label: d.location, icon: <Icon.Pin /> });
  }
  if (d.website) {
    items.push({
      key: 'website',
      label: stripScheme(d.website),
      href: ensureScheme(d.website),
      icon: <Icon.Globe />,
    });
  }
  if (socials.linkedin) {
    items.push({
      key: 'linkedin',
      label: extractHandle(socials.linkedin, 'in/'),
      href: ensureScheme(socials.linkedin),
      icon: <Icon.LinkedIn />,
    });
  }
  if (socials.github) {
    items.push({
      key: 'github',
      label: extractHandle(socials.github),
      href: ensureScheme(socials.github),
      icon: <Icon.GitHub />,
    });
  }
  if (socials.twitter) {
    items.push({
      key: 'twitter',
      label: `@${extractHandle(socials.twitter)}`,
      href: ensureScheme(socials.twitter),
      icon: <Icon.X />,
    });
  }
  if (socials.devto) {
    items.push({
      key: 'devto',
      label: extractHandle(socials.devto),
      href: ensureScheme(socials.devto),
      icon: <Icon.DevTo />,
    });
  }
  if (socials.stackoverflow) {
    items.push({
      key: 'stackoverflow',
      label: extractHandle(socials.stackoverflow),
      href: ensureScheme(socials.stackoverflow),
      icon: <Icon.StackOverflow />,
    });
  }
  if (socials.portfolio) {
    items.push({
      key: 'portfolio',
      label: stripScheme(socials.portfolio),
      href: ensureScheme(socials.portfolio),
      icon: <Icon.Globe />,
    });
  }

  return (
    <header className="resume-header">
      <h1 className="resume-header-name">{d.name}</h1>
      {d.title && <div className="resume-header-title">{d.title}</div>}
      {items.length > 0 && (
        <div className="resume-header-contacts">
          {items.map((c) => (
            <span key={c.key} className="resume-header-contact">
              <span
                className="resume-header-contact-icon"
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `${ICON_SIZE + 1}pt`,
                  height: `${ICON_SIZE + 1}pt`,
                  marginRight: '1mm',
                  color: 'var(--resume-color-accent)',
                  verticalAlign: '-1pt',
                }}
              >
                {c.icon}
              </span>
              {c.href ? <a href={c.href}>{c.label}</a> : c.label}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────

function ensureScheme(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^mailto:|^tel:/i.test(url)) return url;
  return `https://${url}`;
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function extractHandle(url: string, prefix = ''): string {
  const stripped = stripScheme(url);
  const parts = stripped.split('/').filter(Boolean);
  if (prefix && parts.includes(prefix.replace(/\/$/, ''))) {
    const idx = parts.indexOf(prefix.replace(/\/$/, ''));
    return parts[idx + 1] ?? stripped;
  }
  return parts[parts.length - 1] ?? stripped;
}

// ─── inline brand icons (all 12×12 viewBox, currentColor-driven) ──────────
// Embedded as inline SVGs so they render identically in screen preview AND
// in the Chromium-rendered PDF without any extra font/asset loading.

const SVG_PROPS = {
  width: `${ICON_SIZE}pt`,
  height: `${ICON_SIZE}pt`,
  viewBox: '0 0 16 16',
  fill: 'currentColor',
  xmlns: 'http://www.w3.org/2000/svg',
} as const;

const Icon = {
  Email() {
    return (
      <svg {...SVG_PROPS} fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
        <path d="M2.5 4.5l5.5 4 5.5-4" strokeLinejoin="round" />
      </svg>
    );
  },
  Phone() {
    return (
      <svg {...SVG_PROPS}>
        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.68.68 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58z" />
      </svg>
    );
  },
  Pin() {
    return (
      <svg {...SVG_PROPS}>
        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
      </svg>
    );
  },
  Globe() {
    return (
      <svg {...SVG_PROPS} fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="8" cy="8" r="6.5" />
        <ellipse cx="8" cy="8" rx="3" ry="6.5" />
        <line x1="1.5" y1="8" x2="14.5" y2="8" />
      </svg>
    );
  },
  GitHub() {
    return (
      <svg {...SVG_PROPS}>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
    );
  },
  LinkedIn() {
    return (
      <svg {...SVG_PROPS}>
        <path d="M14.816 0H1.18C.528 0 0 .528 0 1.18v13.64C0 15.472.528 16 1.18 16h13.636c.652 0 1.184-.528 1.184-1.18V1.18C16 .528 15.468 0 14.816 0zM4.748 13.636H2.384V6h2.364v7.636zM3.564 4.964a1.372 1.372 0 1 1 0-2.744 1.372 1.372 0 0 1 0 2.744zM13.64 13.636h-2.364V9.928c0-.884-.016-2.02-1.232-2.02-1.232 0-1.42.96-1.42 1.952v3.776H6.26V6h2.268v1.04h.032c.316-.6 1.088-1.232 2.24-1.232 2.396 0 2.84 1.576 2.84 3.628v4.2z" />
      </svg>
    );
  },
  X() {
    return (
      <svg {...SVG_PROPS}>
        <path d="M12.6 1.5h2.32l-5.07 5.79L16 14.5h-4.67l-3.66-4.78-4.18 4.78H1.17l5.42-6.2L0 1.5h4.8l3.3 4.37L12.6 1.5zm-.81 11.6h1.28L4.27 2.83H2.9l8.89 10.27z" />
      </svg>
    );
  },
  DevTo() {
    return (
      <svg {...SVG_PROPS}>
        <path d="M.144 3.094v9.812c0 .55.448.999.999.999h13.713c.55 0 .999-.448.999-.999V3.094c0-.55-.448-.999-.999-.999H1.143c-.55 0-.999.448-.999.999zm4.42 6.825c-.33.246-.776.37-1.337.37H1.852V5.711h1.41c.547 0 .978.124 1.293.37.314.247.472.617.472 1.11v1.62c0 .493-.158.864-.464 1.108zm3.41-3.224H6.052v.953h1.358v.92H6.052v.953h1.923v.92H5.124V5.79h2.85v.905zm4.116 3.224l-1.51-3.224h.965l1.024 2.193 1.025-2.193h.965l-1.51 3.224h-.959zM2.74 6.71v2.249h.526c.31 0 .495-.107.495-.32V7.03c0-.214-.184-.32-.495-.32H2.74z" />
      </svg>
    );
  },
  StackOverflow() {
    return (
      <svg {...SVG_PROPS}>
        <path d="M12.413 14.725v-3.978h1.31V16H1.297v-5.253h1.31v3.978h9.806zM3.91 10.234l6.42 1.345.276-1.296L4.187 8.93l-.276 1.304zm.847-3.103l5.94 2.78.55-1.18-5.94-2.78-.55 1.18zM6.4 4.181l5.038 4.19.834-1.005L7.234 3.18 6.4 4.18zm3.182-3.022L7.97 2.376l4.122 5.65 1.61-1.214-4.122-5.654z" />
      </svg>
    );
  },
};
