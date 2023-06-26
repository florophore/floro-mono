import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterRepoUserIdToBeNullable1687722588955 implements MigrationInterface {
    name = 'AlterRepoUserIdToBeNullable1687722588955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "repositories" ALTER COLUMN "user_id" DROP NOT NULL')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
