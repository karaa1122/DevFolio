import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "passwordHash" character varying,
        "name" character varying NOT NULL,
        "avatar" character varying,
        "bio" character varying,
        "githubId" character varying,
        "githubUsername" character varying,
        "githubAccessToken" character varying,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "refreshTokenHash" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "portfolios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "data" jsonb NOT NULL,
        "isPublished" boolean NOT NULL DEFAULT false,
        "viewCount" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_portfolios_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_portfolios" PRIMARY KEY ("id"),
        CONSTRAINT "FK_portfolios_userId"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_portfolios_slug" ON "portfolios" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_portfolios_userId" ON "portfolios" ("userId")`);

    await queryRunner.query(`
      CREATE TYPE "export_jobs_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed')
    `);

    await queryRunner.query(`
      CREATE TABLE "export_jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "portfolioId" uuid NOT NULL,
        "status" "export_jobs_status_enum" NOT NULL DEFAULT 'pending',
        "fileUrl" character varying,
        "errorMessage" character varying,
        "bullJobId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "completedAt" TIMESTAMP,
        CONSTRAINT "PK_export_jobs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_export_jobs_portfolioId"
          FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_export_jobs_portfolioId" ON "export_jobs" ("portfolioId")`);
    await queryRunner.query(`CREATE INDEX "IDX_export_jobs_status" ON "export_jobs" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "analytics_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "portfolioId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "sectionId" character varying,
        "referrer" character varying,
        "userAgent" character varying,
        "ip" character varying,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analytics_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_analytics_events_portfolioId"
          FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_analytics_events_portfolioId" ON "analytics_events" ("portfolioId")`);
    await queryRunner.query(`CREATE INDEX "IDX_analytics_events_createdAt" ON "analytics_events" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TABLE "export_jobs"`);
    await queryRunner.query(`DROP TYPE "export_jobs_status_enum"`);
    await queryRunner.query(`DROP TABLE "portfolios"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
