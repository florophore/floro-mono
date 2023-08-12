import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddManagedCopyToPluginVersions1691636405671 implements MigrationInterface {
    name = 'AddManagedCopyToPluginVersions1691636405671'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "plugin_versions",
      new TableColumn({
        name: "managed_copy",
        type: "boolean",
        isNullable: true,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("plugin_versions", [
      "managed_copy",
    ]);
  }

}
