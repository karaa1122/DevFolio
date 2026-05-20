import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Portfolio } from './entities/portfolio.entity';
import { ExportJob } from './entities/export-job.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';

config({ path: '../../.env' }); // apps/api → root

// In Docker (production) the app is pre-compiled; point at JS output.
// Locally (dev) ts-node runs the TS source directly — keep the .ts glob.
const migrationsPath =
  process.env.NODE_ENV === 'production'
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'];

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://devfolio:devfolio@localhost:5432/devfolio',
  entities: [User, Portfolio, ExportJob, AnalyticsEvent],
  migrations: migrationsPath,
  synchronize: false,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
