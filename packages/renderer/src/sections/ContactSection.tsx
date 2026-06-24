import React from 'react';
import type { ContactSection, Theme } from '@devfolio/shared';
import { SectionHeader, sectionPadding, radiusMap, MONO, Icon } from './_shared';

interface Props {
  section: ContactSection;
  theme: Theme;
}

const socialLinks = [
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'website', label: 'Website' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'devto', label: 'DEV' },
] as const;

export function ContactSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const radius = radiusMap[theme.radius] ?? '16px';
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 0.95rem',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    color: colors.foreground,
    fontSize: '0.92rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: colors.muted,
    fontSize: '0.78rem',
    fontFamily: MONO,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '0.45rem',
  };

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.background, color: colors.foreground, padding: sectionPadding(theme) }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <SectionHeader
          kicker="Contact"
          heading={data.heading}
          subheading={data.subheading}
          theme={theme}
          align="center"
        />

        {/* Big email CTA */}
        {data.email && (
          <a
            href={`mailto:${data.email}`}
            data-cta
            className="pf-reveal"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.7rem',
              margin: '0 auto 2rem',
              padding: '1rem 1.75rem',
              borderRadius: '999px',
              maxWidth: 'max-content',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              color: colors.background,
              fontWeight: 600,
              fontSize: '1.05rem',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <Icon name="mail" color={colors.background} size={18} />
            {data.email}
          </a>
        )}

        {/* Phone / location */}
        {(data.phone || data.location) && (
          <div
            className="pf-reveal"
            style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.75rem', marginBottom: '2.25rem' }}
          >
            {data.phone && (
              <span style={{ color: colors.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem' }}>
                <Icon name="phone" color={colors.primary} size={16} /> {data.phone}
              </span>
            )}
            {data.location && (
              <span style={{ color: colors.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem' }}>
                <Icon name="pin" color={colors.primary} size={16} /> {data.location}
              </span>
            )}
          </div>
        )}

        {/* Social links */}
        {data.socials && Object.values(data.socials).some(Boolean) && (
          <div
            className="pf-reveal"
            style={{ display: 'flex', justifyContent: 'center', gap: '0.7rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}
          >
            {socialLinks.map(({ key, label }) => {
              const href = data.socials?.[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="pf-social"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.9rem',
                    height: '2.9rem',
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: theme.radius === 'none' ? '0' : '14px',
                    textDecoration: 'none',
                  }}
                >
                  <Icon name={key} color={colors.foreground} size={19} />
                </a>
              );
            })}
          </div>
        )}

        {/* Contact form */}
        {data.showContactForm && (
          <form
            className="pf-reveal"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: radius,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input type="text" placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="your@email.com" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Message</label>
              <textarea placeholder="Your message..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <button
              type="submit"
              data-cta
              style={{
                padding: '0.8rem 2rem',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                color: colors.background,
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.98rem',
                cursor: 'pointer',
                alignSelf: 'flex-start',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
