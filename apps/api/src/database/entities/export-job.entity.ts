import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { ExportJobStatus, ExportTargetType } from '@devfolio/shared';
import { Portfolio } from './portfolio.entity';
import { Resume } from './resume.entity';

@Entity('export_jobs')
export class ExportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  portfolioId: string | null;

  @Index()
  @Column({ nullable: true })
  resumeId: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'portfolio',
  })
  targetType: ExportTargetType;

  @Index()
  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: ExportJobStatus;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  bullJobId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.exportJobs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portfolio | null;

  @ManyToOne(() => Resume, (resume) => resume.exportJobs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'resumeId' })
  resume: Resume | null;
}
