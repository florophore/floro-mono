import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBaseBranchIdToMrEventsAndReviewStatuses1688408112415 implements MigrationInterface {
    name = 'AddBaseBranchIdToMrEventsAndReviewStatuses1688408112415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "merge_request_events",
            new TableColumn({
                name: "base_branch_id_at_event",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "review_statuses",
            new TableColumn({
                name: "base_branch_id_at_create",
                type: "varchar",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("merge_request_events", ["base_branch_id_at_event"]);
        await queryRunner.dropColumns("review_statuses", ["base_branch_id_at_create"]);
    }

}
