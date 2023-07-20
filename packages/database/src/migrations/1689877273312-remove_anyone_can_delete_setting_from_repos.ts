import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveAnyoneCanDeleteSettingFromRepos1689877273312 implements MigrationInterface {
    name = 'RemoveAnyoneCanDeleteSettingFromRepos1689877273312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("repositories", [
            "anyone_can_delete_branches",
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "repositories",
            new TableColumn({
                name: "anyone_can_delete_branches",
                type: "boolean",
                default: true
            })
        );
    }
}
