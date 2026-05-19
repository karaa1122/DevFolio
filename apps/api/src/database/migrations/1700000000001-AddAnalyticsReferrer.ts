import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsReferrer1700000000001 implements MigrationInterface {
  name = 'AddAnalyticsReferrer1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "analytics_events"
      ADD COLUMN IF NOT EXISTS "referrer" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "analytics_events" DROP COLUMN IF EXISTS "referrer"
    `);
  }
}
