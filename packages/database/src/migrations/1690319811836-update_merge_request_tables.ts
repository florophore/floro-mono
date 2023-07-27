import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateMergeRequestTables1690319811836 implements MigrationInterface {
    name = 'UpdateMergeRequestTables1690319811836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "merge_request_events",
            new TableColumn({
                name: "added_title",
                type: "varchar",
                isNullable: true
            })
        );

        await queryRunner.addColumn(
            "merge_request_events",
            new TableColumn({
                name: "removed_title",
                type: "varchar",
                isNullable: true
            })
        );

        await queryRunner.addColumn(
            "merge_request_events",
            new TableColumn({
                name: "added_description",
                type: "text",
                isNullable: true
            })
        );

        await queryRunner.addColumn(
            "merge_request_events",
            new TableColumn({
                name: "removed_description",
                type: "text",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("merge_request_events", [
            "added_title",
            "removed_title",
            "added_description",
            "removed_description",
        ]);
    }
}
