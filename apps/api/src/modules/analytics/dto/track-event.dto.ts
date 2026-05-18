import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import type { AnalyticsEventType } from '@devfolio/shared';

export class TrackEventDto {
  @IsString()
  portfolioId: string;

  @IsEnum([
    'page_view',
    'section_view',
    'project_click',
    'resume_download',
    'contact_form_submit',
    'social_click',
    'cta_click',
  ])
  type: AnalyticsEventType;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
