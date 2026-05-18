import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Portfolio } from './entities/portfolio.entity';
import { ExportJob } from './entities/export-job.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';

config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://devfolio:devfolio@localhost:5432/devfolio',
  entities: [User, Portfolio, ExportJob, AnalyticsEvent],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
