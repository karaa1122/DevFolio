import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordReset1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "passwordResetToken" character varying,
      ADD COLUMN IF NOT EXISTS "passwordResetTokenExpiresAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordResetToken"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordResetTokenExpiresAt"`);
  }
}
