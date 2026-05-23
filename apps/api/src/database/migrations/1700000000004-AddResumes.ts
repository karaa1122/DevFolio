import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumes1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // resumes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resumes" (
        "id"        uuid              NOT NULL DEFAULT gen_random_uuid(),
        "userId"    uuid              NOT NULL,
        "slug"      character varying NOT NULL,
        "data"      jsonb             NOT NULL,
        "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resumes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_resumes_user_slug" UNIQUE ("userId", "slug"),
        CONSTRAINT "FK_resumes_userId" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_resumes_userId" ON "resumes" ("userId")`,
    );

    // Extend export_jobs to support resume exports.
    // Make portfolioId nullable, add resumeId + targetType discriminator.
    await queryRunner.query(`ALTER TABLE "export_jobs" ALTER COLUMN "portfolioId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "resumeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "targetType" varchar(20) NOT NULL DEFAULT 'portfolio'`,
    );
    await queryRunner.query(
      `ALTER TABLE "export_jobs" ADD CONSTRAINT "FK_export_jobs_resumeId"
       FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_jobs_resumeId" ON "export_jobs" ("resumeId")`,
    );

    // One-of constraint: exactly one of portfolioId / resumeId is set.
    await queryRunner.query(
      `ALTER TABLE "export_jobs" ADD CONSTRAINT "CK_export_jobs_target"
       CHECK (
         ("portfolioId" IS NOT NULL AND "resumeId" IS NULL)
         OR
         ("portfolioId" IS NULL AND "resumeId" IS NOT NULL)
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "export_jobs" DROP CONSTRAINT IF EXISTS "CK_export_jobs_target"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_export_jobs_resumeId"`);
    await queryRunner.query(`ALTER TABLE "export_jobs" DROP CONSTRAINT IF EXISTS "FK_export_jobs_resumeId"`);
    await queryRunner.query(`ALTER TABLE "export_jobs" DROP COLUMN IF EXISTS "targetType"`);
    await queryRunner.query(`ALTER TABLE "export_jobs" DROP COLUMN IF EXISTS "resumeId"`);
    await queryRunner.query(`ALTER TABLE "export_jobs" ALTER COLUMN "portfolioId" SET NOT NULL`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resumes_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resumes"`);
  }
}
