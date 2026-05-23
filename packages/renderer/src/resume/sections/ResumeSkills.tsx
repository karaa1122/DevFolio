import React from 'react';
import type { ResumeSkillsSection, ResumeSkillGroup } from '@devfolio/shared';

interface Props {
  section: ResumeSkillsSection;
}

export function ResumeSkills({ section }: Props) {
  const { heading, groups, layout, showLevels } = section.data;
  const populated = groups.filter((g) => g.items.length > 0);
  if (!populated.length) return null;

  return (
    <section className={`resume-section resume-skills resume-skills-${layout}`}>
      <h2 className="resume-section-heading">{heading}</h2>
      {renderLayout(populated, layout, showLevels)}
    </section>
  );
}

function renderLayout(
  groups: ResumeSkillGroup[],
  layout: ResumeSkillsSection['data']['layout'],
  showLevels: boolean,
) {
  switch (layout) {
    case 'grouped':
      return groups.map((g) => (
        <div key={g.id} className="resume-skill-row">
          <div className="resume-skill-category">{g.category}</div>
          <div className="resume-skill-items">{g.items.join(', ')}</div>
        </div>
      ));

    case 'compact':
      // One long inline run with thin dot separators between categories.
      return (
        <div>
          {groups.map((g) => (
            <span key={g.id} className="resume-skill-row">
              <span className="resume-skill-category">{g.category}:</span>
              <span className="resume-skill-items">{g.items.join(', ')}</span>
            </span>
          ))}
        </div>
      );

    case 'minimal':
      // ATS-pure: "Category: skill, skill, skill" on its own line.
      return groups.map((g) => (
        <div key={g.id} className="resume-skill-row">
          <span className="resume-skill-category">{g.category}:</span>
          <span className="resume-skill-items">{g.items.join(', ')}</span>
        </div>
      ));

    case 'tags':
      return groups.map((g) => (
        <div key={g.id} className="resume-skill-group">
          {g.category && <div className="resume-skill-category">{g.category}</div>}
          <div className="resume-tag-list">
            {g.items.map((it, i) => (
              <span key={`${g.id}-${i}`}>{it}</span>
            ))}
          </div>
        </div>
      ));

    case 'grid':
      return (
        <div className="resume-skills-grid-inner" style={{ display: 'contents' }}>
          {groups.map((g) => (
            <div key={g.id} className="resume-skill-group">
              <div className="resume-skill-category">{g.category}</div>
              <div className="resume-skill-items">{g.items.join(' · ')}</div>
            </div>
          ))}
        </div>
      );

    case 'bars':
      return groups.map((g) => (
        <div key={g.id} className="resume-skill-group">
          {g.category && <div className="resume-skill-category">{g.category}</div>}
          {g.items.map((name, i) => {
            // Default level when not explicitly set: walks from 5 → 3 across the list,
            // so the most relevant skill (listed first) gets a fuller bar.
            const level = showLevels
              ? Math.max(3, 5 - Math.floor(i / 2))
              : 4;
            const pct = (level / 5) * 100;
            return (
              <div key={`${g.id}-${i}`} className="resume-bar-row">
                <span className="resume-bar-name">{name}</span>
                <span className="resume-bar-track">
                  <span className="resume-bar-fill" style={{ width: `${pct}%` }} />
                </span>
              </div>
            );
          })}
        </div>
      ));
  }
}
