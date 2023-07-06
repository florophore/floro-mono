import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserIdNullableOnMergeRequests1688435364835 implements MigrationInterface {
    name = 'MakeUserIdNullableOnMergeRequests1688435364835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "merge_requests" ALTER COLUMN "user_id" DROP NOT NULL')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
