import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AddIgnoreBranchNotifications1687315126351
  implements MigrationInterface
{
  name = "AddIgnoreBranchNotifications1687315126351";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "ignored_branch_notifications",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "branch_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "is_deleted",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "ignored_branch_notifications",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "ignored_branch_notifications",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "ignored_branch_notifications",
      new TableIndex({
        name: "IDX_ignored_branch_notifications_user_id_branch_id_repository_id_is_deleted",
        columnNames: ["repository_id", "user_id", "branch_id", "is_deleted"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("ignored_branch_notifications");
  }
}
