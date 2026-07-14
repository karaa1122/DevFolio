import type { ComponentType } from 'react';
import type { Resume, ResumeSection, ResumeTemplateId } from '@devfolio/shared';
import { ClassicTemplate } from './Classic';
import { ModernTemplate } from './Modern';
import { CompactTemplate } from './Compact';
import { SidebarTemplate } from './Sidebar';
import { TwoColumnTemplate } from './TwoColumn';
import { DevFocusTemplate } from './DevFocus';
import { NoirTemplate } from './Noir';
import { BentoTemplate } from './Bento';
import { TimelineTemplate } from './Timeline';

interface TemplateComponentProps {
  resume: Resume;
  sections: ResumeSection[];
}

export const resumeTemplateRegistry: Record<
  ResumeTemplateId,
  ComponentType<TemplateComponentProps>
> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  compact: CompactTemplate,
  sidebar: SidebarTemplate,
  'two-column': TwoColumnTemplate,
  'dev-focus': DevFocusTemplate,
  noir: NoirTemplate,
  bento: BentoTemplate,
  timeline: TimelineTemplate,
};
