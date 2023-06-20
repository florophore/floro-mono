import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRequireReapprovalToBranchRules1687153366204 implements MigrationInterface {
    name = 'AddRequireReapprovalToBranchRules1687153366204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "protected_branch_rules",
            new TableColumn({
                name: "require_reapproval_on_push_to_merge",
                type: "boolean",
                isNullable: false,
                default: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("protected_branch_rules", [
            "require_reapproval_on_push_to_merge",
        ]);
    }

}
