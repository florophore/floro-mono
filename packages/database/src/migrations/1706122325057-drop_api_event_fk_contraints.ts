import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class DropApiEventFkContraints1706122325057
  implements MigrationInterface
{
  name = "DropApiEventFkContraints1706122325057";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      "api_events",
      new TableForeignKey({
        columnNames: ["repository_enabled_api_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repository_enabled_api_keys",
        onDelete: "SET NULL",
      })
    );
    await queryRunner.dropForeignKey(
      "webhook_events",
      new TableForeignKey({
        columnNames: ["repository_enabled_webhook_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repository_enabled_webhook_keys",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      "api_events",
      new TableForeignKey({
        columnNames: ["repository_enabled_api_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repository_enabled_api_keys",
        onDelete: "SET NULL",
      })
    );
    await queryRunner.createForeignKey(
      "webhook_events",
      new TableForeignKey({
        columnNames: ["repository_enabled_webhook_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repository_enabled_webhook_keys",
        onDelete: "SET NULL",
      })
    );
  }
}
