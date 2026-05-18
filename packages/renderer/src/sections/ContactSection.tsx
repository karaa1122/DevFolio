import React from 'react';
import type { ContactSection, Theme } from '@devfolio/shared';

interface Props {
  section: ContactSection;
  theme: Theme;
}

const socialLinks = [
  { key: 'github', label: 'GitHub', icon: 'GH' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { key: 'twitter', label: 'Twitter', icon: '𝕏' },
  { key: 'website', label: 'Website', icon: '🌐' },
  { key: 'youtube', label: 'YouTube', icon: '▶' },
  { key: 'devto', label: 'DEV', icon: 'DEV' },
] as const;

export function ContactSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const padding = theme.spacing === 'compact' ? '3rem 2rem' : theme.spacing === 'relaxed' ? '6rem 2rem' : '5rem 2rem';

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.background, color: colors.foreground, padding, fontFamily: theme.font }}
    >
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', marginBottom: '1rem' }}>
          {data.heading}
        </h2>
        {data.subheading && (
          <p style={{ color: colors.muted, marginBottom: '1rem', fontSize: '1.1rem' }}>{data.subheading}</p>
        )}
        <div style={{ width: '3rem', height: '4px', backgroundColor: colors.primary, margin: '0 auto 3rem', borderRadius: '2px' }} />

        {/* Contact info */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              style={{ color: colors.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
            >
              <span style={{ color: colors.primary }}>✉</span> {data.email}
            </a>
          )}
          {data.phone && (
            <span style={{ color: colors.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: colors.primary }}>📞</span> {data.phone}
            </span>
          )}
          {data.location && (
            <span style={{ color: colors.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: colors.primary }}>📍</span> {data.location}
            </span>
          )}
        </div>

        {/* Social links */}
        {data.socials && Object.values(data.socials).some(Boolean) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {socialLinks.map(({ key, label, icon }) => {
              const href = data.socials?.[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.75rem',
                    height: '2.75rem',
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: theme.radius === 'none' ? '0' : '50%',
                    color: colors.foreground,
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                >
                  {icon}
                </a>
              );
            })}
          </div>
        )}

        {/* Contact form */}
        {data.showContactForm && (
          <form
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: colors.muted, fontSize: '0.85rem', marginBottom: '0.375rem' }}>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    color: colors.foreground,
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: colors.muted, fontSize: '0.85rem', marginBottom: '0.375rem' }}>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    color: colors.foreground,
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: colors.muted, fontSize: '0.85rem', marginBottom: '0.375rem' }}>Message</label>
              <textarea
                placeholder="Your message..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  color: colors.foreground,
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: colors.primary,
                color: colors.foreground,
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                alignSelf: 'flex-start',
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
