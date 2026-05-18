import React from 'react';
import type { ProjectsSection, Theme } from '@devfolio/shared';

interface Props {
  section: ProjectsSection;
  theme: Theme;
}

export function ProjectsSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const padding = theme.spacing === 'compact' ? '3rem 2rem' : theme.spacing === 'relaxed' ? '6rem 2rem' : '5rem 2rem';

  const items = data.showFeaturedOnly
    ? data.items.filter((p) => p.featured)
    : data.items;

  const getBorderRadius = () => {
    const map: Record<string, string> = { none: '0', sm: '6px', md: '10px', lg: '16px', full: '20px' };
    return map[theme.radius] ?? '10px';
  };

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.background, color: colors.foreground, padding, fontFamily: theme.font }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: data.subheading ? '0.5rem' : '1rem',
          }}
        >
          {data.heading}
        </h2>
        {data.subheading && (
          <p style={{ textAlign: 'center', color: colors.muted, marginBottom: '1rem' }}>
            {data.subheading}
          </p>
        )}
        <div
          style={{
            width: '3rem',
            height: '4px',
            backgroundColor: colors.primary,
            margin: '0 auto 3rem',
            borderRadius: '2px',
          }}
        />

        <div
          style={{
            display: data.layout === 'list' ? 'flex' : 'grid',
            flexDirection: data.layout === 'list' ? 'column' : undefined,
            gridTemplateColumns: data.layout === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : data.layout === 'masonry' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
            gap: '1.5rem',
          }}
        >
          {items.map((project) => (
            <div
              key={project.id}
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: getBorderRadius(),
                overflow: 'hidden',
                display: 'flex',
                flexDirection: data.layout === 'list' ? 'row' : 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    width: data.layout === 'list' ? '200px' : '100%',
                    height: data.layout === 'list' ? '100%' : '200px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: colors.foreground, margin: 0 }}>
                    {project.title}
                  </h3>
                  {project.featured && (
                    <span style={{ backgroundColor: `${colors.primary}20`, color: colors.primary, padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                      Featured
                    </span>
                  )}
                </div>

                <p style={{ color: colors.muted, fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {project.description}
                </p>

                {project.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: `${colors.accent}15`,
                          color: colors.accent,
                          padding: '0.25rem 0.625rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: colors.primary, fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none' }}
                    >
                      Live Demo ↗
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: colors.muted, fontSize: '0.875rem', textDecoration: 'none' }}
                    >
                      Source ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
