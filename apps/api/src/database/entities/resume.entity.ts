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
  Unique,
} from 'typeorm';
import type { Resume as ResumeData } from '@devfolio/shared';
import { User } from './user.entity';
import { ExportJob } from './export-job.entity';

@Entity('resumes')
@Unique('UQ_resumes_user_slug', ['userId', 'slug'])
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column()
  slug: string;

  @Column({ type: 'jsonb' })
  data: ResumeData;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.resumes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ExportJob, (job) => job.resume)
  exportJobs: ExportJob[];
}
