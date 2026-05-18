import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ThemesModule } from './modules/themes/themes.module';
import { ExportModule } from './modules/export/export.module';
import { GithubModule } from './modules/github/github.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { User } from './database/entities/user.entity';
import { Portfolio } from './database/entities/portfolio.entity';
import { ExportJob } from './database/entities/export-job.entity';
import { AnalyticsEvent } from './database/entities/analytics-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('database.url'),
        entities: [User, Portfolio, ExportJob, AnalyticsEvent],
        synchronize: cfg.get<string>('app.env') === 'development',
        migrations: ['dist/database/migrations/*.js'],
        logging: cfg.get<string>('app.env') === 'development',
        ssl: cfg.get<string>('app.env') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    CacheModule.register({ isGlobal: true }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get<string>('redis.host') ?? 'localhost',
          port: cfg.get<number>('redis.port') ?? 6379,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      }),
    }),

    AuthModule,
    UsersModule,
    PortfolioModule,
    ThemesModule,
    ExportModule,
    GithubModule,
    AnalyticsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
