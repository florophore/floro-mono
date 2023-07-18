import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAllowExternalUsersToPush1689478324899 implements MigrationInterface {
    name = 'AddAllowExternalUsersToPush1689478324899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "repositories",
            new TableColumn({
                name: "allow_external_users_to_push",
                type: "boolean",
                default: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("repositories", [
            "allow_external_users_to_push",
        ]);
    }

}
