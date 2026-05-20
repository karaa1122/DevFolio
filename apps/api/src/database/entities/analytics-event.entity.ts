import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { AnalyticsEventType } from '@devfolio/shared';

@Entity('analytics_events')
@Index(['portfolioId', 'createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  portfolioId: string;

  @Column({
    type: 'enum',
    enum: [
      'page_view',
      'section_view',
      'project_click',
      'resume_download',
      'contact_form_submit',
      'social_click',
      'cta_click',
    ],
  })
  type: AnalyticsEventType;

  @Column({ nullable: true })
  sectionId: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
