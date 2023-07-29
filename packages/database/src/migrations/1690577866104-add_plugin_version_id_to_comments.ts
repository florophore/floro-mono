import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPluginVersionIdToComments1690577866104 implements MigrationInterface {
    name = 'AddPluginVersionIdToComments1690577866104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "merge_request_comments",
                new TableColumn({
                name: "plugin_version_id",
                type: "uuid",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("merge_request_comments", [
            "plugin_version_id",
        ]);
    }

}
