import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumes1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resumes" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId"      uuid NOT NULL,
        "portfolioId" uuid,
        "data"        jsonb NOT NULL DEFAULT '{}',
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resumes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_resumes_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_resumes_userId" ON "resumes" ("userId")`);

    await queryRunner.query(`ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "type" varchar NOT NULL DEFAULT 'portfolio'`);
    await queryRunner.query(`ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "resumeId" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "export_jobs" DROP COLUMN IF EXISTS "resumeId"`);
    await queryRunner.query(`ALTER TABLE "export_jobs" DROP COLUMN IF EXISTS "type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resumes"`);
  }
}
