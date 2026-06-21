import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Portfolio as PortfolioData } from '@devfolio/shared';
import { User } from './user.entity';
import { ExportJob } from './export-job.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'jsonb' })
  data: PortfolioData;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: 0 })
  viewCount: number;

  // ─── Custom domain ──────────────────────────────────────────────────────
  // The user-supplied apex/sub domain (e.g. "johndoe.com"). Unique across all
  // portfolios. Stored as soon as it's added, but only served once verified.
  @Column({ type: 'varchar', nullable: true, unique: true })
  @Index()
  customDomain: string | null;

  // Whether ownership of customDomain has been proven via DNS TXT record.
  @Column({ default: false })
  domainVerified: boolean;

  // Random token the user must publish as a TXT record to prove ownership.
  @Column({ type: 'varchar', nullable: true })
  domainVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  domainVerifiedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.portfolios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ExportJob, (job) => job.portfolio)
  exportJobs: ExportJob[];
}
