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
