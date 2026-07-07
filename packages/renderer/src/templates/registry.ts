import type { ComponentType } from 'react';
import type { PortfolioTemplateId } from '@devfolio/shared';
import type { TemplateProps } from './_chrome';
import { AuroraTemplate } from './Aurora';
import { MinimalTemplate } from './Minimal';
import { EditorialTemplate } from './Editorial';
import { TerminalTemplate } from './Terminal';
import { RetroOSTemplate } from './RetroOS';
import { DimensionTemplate } from './Dimension';
import { BrutalistTemplate } from './Brutalist';

export const portfolioTemplateRegistry: Record<
  PortfolioTemplateId,
  ComponentType<TemplateProps>
> = {
  aurora: AuroraTemplate,
  minimal: MinimalTemplate,
  editorial: EditorialTemplate,
  terminal: TerminalTemplate,
  'retro-os': RetroOSTemplate,
  dimension: DimensionTemplate,
  brutalist: BrutalistTemplate,
};
