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
import type { ExportJobStatus } from '@devfolio/shared';
import { Portfolio } from './portfolio.entity';

@Entity('export_jobs')
export class ExportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'portfolio' })
  type: 'portfolio' | 'resume';

  @Index()
  @Column({ nullable: true })
  portfolioId: string;

  @Column({ nullable: true })
  resumeId: string;

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

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.exportJobs, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portfolio;
}
