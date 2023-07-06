import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMrCountToMergeRequests1688138624412 implements MigrationInterface {
    name = 'AddMrCountToMergeRequests1688138624412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "merge_requests",
            new TableColumn({
                name: "merge_request_count",
                type: "integer",
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("merge_requests", ["merge_request_count"]);
    }

}
