import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"                              uuid              NOT NULL DEFAULT gen_random_uuid(),
        "email"                           character varying NOT NULL,
        "passwordHash"                    character varying,
        "name"                            character varying NOT NULL,
        "avatar"                          character varying,
        "bio"                             character varying,
        "githubId"                        character varying,
        "githubUsername"                  character varying,
        "githubAccessToken"               character varying,
        "isEmailVerified"                 boolean           NOT NULL DEFAULT false,
        "emailVerificationToken"          character varying,
        "emailVerificationTokenExpiresAt" TIMESTAMP,
        "refreshTokenHash"                character varying,
        "createdAt"                       TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"                       TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "portfolios" (
        "id"          uuid              NOT NULL DEFAULT gen_random_uuid(),
        "slug"        character varying NOT NULL,
        "userId"      uuid              NOT NULL,
        "data"        jsonb             NOT NULL,
        "isPublished" boolean           NOT NULL DEFAULT false,
        "viewCount"   integer           NOT NULL DEFAULT 0,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_portfolios" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_portfolios_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_portfolios_userId" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "export_jobs_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "export_jobs" (
        "id"           uuid                          NOT NULL DEFAULT gen_random_uuid(),
        "portfolioId"  uuid                          NOT NULL,
        "status"       "export_jobs_status_enum"     NOT NULL DEFAULT 'pending',
        "fileUrl"      character varying,
        "errorMessage" character varying,
        "bullJobId"    character varying,
        "createdAt"    TIMESTAMP                     NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP                     NOT NULL DEFAULT now(),
        "completedAt"  TIMESTAMP,
        CONSTRAINT "PK_export_jobs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_export_jobs_portfolioId" FOREIGN KEY ("portfolioId")
          REFERENCES "portfolios" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "analytics_events_type_enum" AS ENUM (
        'page_view', 'section_view', 'project_click',
        'resume_download', 'contact_form_submit', 'social_click', 'cta_click'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "analytics_events" (
        "id"          uuid                              NOT NULL DEFAULT gen_random_uuid(),
        "portfolioId" uuid                              NOT NULL,
        "type"        "analytics_events_type_enum"      NOT NULL,
        "sectionId"   character varying,
        "referrer"    character varying,
        "userAgent"   character varying,
        "ip"          character varying,
        "metadata"    jsonb,
        "createdAt"   TIMESTAMP                         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analytics_events" PRIMARY KEY ("id")
      )
    `);

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_portfolios_slug"        ON "portfolios"       ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_portfolios_userId"      ON "portfolios"       ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_jobs_portfolioId" ON "export_jobs"     ("portfolioId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_jobs_status"     ON "export_jobs"      ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_analytics_portfolioId"  ON "analytics_events" ("portfolioId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_analytics_portfolio_date" ON "analytics_events" ("portfolioId", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "analytics_events"`);
    await queryRunner.query(`DROP TYPE  IF EXISTS "analytics_events_type_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "export_jobs"`);
    await queryRunner.query(`DROP TYPE  IF EXISTS "export_jobs_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "portfolios"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
