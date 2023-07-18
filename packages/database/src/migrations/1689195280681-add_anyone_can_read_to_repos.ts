import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAnyoneCanReadToRepos1689195280681 implements MigrationInterface {
    name = 'AddAnyoneCanReadToRepos1689195280681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "repositories",
            new TableColumn({
                name: "anyone_can_read",
                type: "boolean",
                default: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("repositories", [
            "anyone_can_read",
        ]);
    }
}
