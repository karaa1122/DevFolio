import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ThemesModule } from './modules/themes/themes.module';
import { ExportModule } from './modules/export/export.module';
import { GithubModule } from './modules/github/github.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';
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
        synchronize: false,
        migrations: ['dist/database/migrations/*.js'],
        logging: cfg.get<string>('app.env') === 'development',
        ssl: cfg.get<string>('database.ssl') ? { rejectUnauthorized: false } : false,
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => {
        const isProd = cfg.get<string>('app.env') === 'production';
        if (isProd) {
          const { redisStore } = await import('cache-manager-ioredis-yet');
          return {
            store: await redisStore({
              host: cfg.get<string>('redis.host') ?? 'localhost',
              port: cfg.get<number>('redis.port') ?? 6379,
              ttl: 300,
            }),
          };
        }
        return { ttl: 300000 };
      },
    }),

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
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
