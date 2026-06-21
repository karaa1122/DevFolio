import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomDomain1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portfolios" ADD COLUMN IF NOT EXISTS "customDomain" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolios" ADD COLUMN IF NOT EXISTS "domainVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolios" ADD COLUMN IF NOT EXISTS "domainVerificationToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolios" ADD COLUMN IF NOT EXISTS "domainVerifiedAt" TIMESTAMP`,
    );

    // Unique custom domain across all portfolios (NULLs are allowed/ignored).
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_portfolios_customDomain"
       ON "portfolios" ("customDomain")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_portfolios_customDomain"`);
    await queryRunner.query(`ALTER TABLE "portfolios" DROP COLUMN IF EXISTS "domainVerifiedAt"`);
    await queryRunner.query(
      `ALTER TABLE "portfolios" DROP COLUMN IF EXISTS "domainVerificationToken"`,
    );
    await queryRunner.query(`ALTER TABLE "portfolios" DROP COLUMN IF EXISTS "domainVerified"`);
    await queryRunner.query(`ALTER TABLE "portfolios" DROP COLUMN IF EXISTS "customDomain"`);
  }
}
