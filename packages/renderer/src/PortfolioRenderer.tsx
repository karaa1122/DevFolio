import React from 'react';
import type { Portfolio } from '@devfolio/shared';
import { portfolioTemplateRegistry } from './templates/registry';
import { AuroraTemplate } from './templates/Aurora';

interface Props {
  portfolio: Portfolio;
  /** When true, renders a simplified version suitable for static HTML export */
  isExport?: boolean;
}

export function PortfolioRenderer({ portfolio, isExport = false }: Props) {
  // Portfolios saved before templates existed have no `template` field —
  // they keep the original Aurora look.
  const Template = portfolioTemplateRegistry[portfolio.template] ?? AuroraTemplate;
  return <Template portfolio={portfolio} isExport={isExport} />;
}
