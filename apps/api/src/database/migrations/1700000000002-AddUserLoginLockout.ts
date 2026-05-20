import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLoginLockout1700000000002 implements MigrationInterface {
  name = 'AddUserLoginLockout1700000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "failedLoginAttempts" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "lockedUntil" TIMESTAMP`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedUntil"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failedLoginAttempts"`);
  }
}
