import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUriColumnToRepoEnabledWebhooks1692813519899 implements MigrationInterface {
    name = 'AddUriColumnToRepoEnabledWebhooks1692813519899'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "repository_enabled_webhook_keys",
      new TableColumn({
        name: "uri",
        type: "varchar",
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("repository_enabled_webhook_keys", [
      "uri",
    ]);
  }
}
