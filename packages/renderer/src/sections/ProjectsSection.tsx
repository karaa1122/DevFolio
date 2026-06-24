import React from 'react';
import type { ProjectsSection, Theme } from '@devfolio/shared';
import { SectionHeader, sectionPadding, radiusMap, Icon } from './_shared';

interface Props {
  section: ProjectsSection;
  theme: Theme;
}

export function ProjectsSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;

  const items = data.showFeaturedOnly ? data.items.filter((p) => p.featured) : data.items;

  const getBorderRadius = () => radiusMap[theme.radius] ?? '16px';

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.background, color: colors.foreground, padding: sectionPadding(theme) }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <SectionHeader kicker="Selected work" heading={data.heading} subheading={data.subheading} theme={theme} />

        <div
          className="pf-reveal"
          style={{
            display: data.layout === 'list' ? 'flex' : 'grid',
            flexDirection: data.layout === 'list' ? 'column' : undefined,
            gridTemplateColumns:
              data.layout === 'grid'
                ? 'repeat(auto-fill, minmax(320px, 1fr))'
                : data.layout === 'masonry'
                  ? 'repeat(auto-fill, minmax(280px, 1fr))'
                  : undefined,
            gap: '1.5rem',
          }}
        >
          {items.map((project) => (
            <div
              key={project.id}
              className="pf-project-card"
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: getBorderRadius(),
                overflow: 'hidden',
                display: 'flex',
                flexDirection: data.layout === 'list' ? 'row' : 'column',
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: colors.foreground,
                      margin: 0,
                    }}
                  >
                    {project.title}
                  </h3>
                  {project.featured && (
                    <span
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                        color: colors.background,
                        padding: '0.18rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                <p
                  style={{
                    color: colors.muted,
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    marginBottom: '1rem',
                  }}
                >
                  {project.description}
                </p>

                {project.tags.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.375rem',
                      marginBottom: '1rem',
                    }}
                  >
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

                <div style={{ display: 'flex', gap: '1.1rem' }}>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: colors.primary,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      Live Demo <Icon name="arrow" color={colors.primary} size={14} />
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: colors.muted,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      Source <Icon name="arrow" color={colors.muted} size={14} />
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
