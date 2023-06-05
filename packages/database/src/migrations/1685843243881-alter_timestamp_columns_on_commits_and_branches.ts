import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTimestampColumnsOnCommitsAndBranches1685843243881 implements MigrationInterface {
    name = 'AlterTimestampColumnsOnCommitsAndBranches1685843243881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commits" ALTER COLUMN "timestamp" TYPE VARCHAR`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "created_at" TYPE VARCHAR`);
        await queryRunner.addColumn(
            "commits",
            new TableColumn({
                name: "diff_byte_size",
                type: "integer",
                isNullable: false,
            })
        );

        await queryRunner.addColumn(
            "commits",
            new TableColumn({
                name: "kv_byte_size",
                type: "integer",
                isNullable: false,
            })
        );

        await queryRunner.addColumn(
            "commits",
            new TableColumn({
                name: "state_byte_size",
                type: "integer",
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commits" ALTER COLUMN "timestamp" TYPE timestamp`);
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "created_at" TYPE timestamp`);
        await queryRunner.dropColumns("commits", [
            "diff_byte_size",
            "kv_byte_size",
            "state_byte_size",
        ]);
    }

}
