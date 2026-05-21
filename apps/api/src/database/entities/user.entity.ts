import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Portfolio } from './portfolio.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  githubId: string;

  @Column({ nullable: true })
  githubUsername: string;

  @Column({ nullable: true })
  githubAccessToken: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  emailVerificationTokenExpiresAt: Date;

  @Column({ nullable: true })
  passwordResetToken!: string;

  @Column({ nullable: true })
  passwordResetTokenExpiresAt!: Date;

  @Column({ nullable: true })
  refreshTokenHash: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  portfolios: Portfolio[];
}
