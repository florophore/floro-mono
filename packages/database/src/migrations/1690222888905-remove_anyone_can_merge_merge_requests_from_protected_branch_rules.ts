import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveAnyoneCanMergeMergeRequestsFromProtectedBranchRules1690222888905 implements MigrationInterface {
    name = 'RemoveAnyoneCanMergeMergeRequestsFromProtectedBranchRules1690222888905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("protected_branch_rules", [
            "anyone_can_merge_merge_requests",
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "protected_branch_rules",
            new TableColumn({
                name: "anyone_can_merge_merge_requests",
                type: "boolean",
                default: true
            })
        );
    }
}
