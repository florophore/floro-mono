import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFreeSeatsToFive1689102820772 implements MigrationInterface {
    name = 'UpdateFreeSeatsToFive1689102820772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" ALTER COLUMN "free_seats" SET DEFAULT 5`);
        await queryRunner.query("UPDATE organizations SET free_seats = 5 where free_seats = 10")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" ALTER COLUMN "free_seats" SET DEFAULT 10`);
        await queryRunner.query("UPDATE organizations SET free_seats = 10 where free_seats = 5")
    }

}
