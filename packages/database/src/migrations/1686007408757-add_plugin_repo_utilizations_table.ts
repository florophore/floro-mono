import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class AddPluginRepoUtilizationsTable1686007408757
  implements MigrationInterface
{
  name = "AddPluginRepoUtilizationsTable1686007408757";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "plugin_commit_utilizations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "plugin_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "plugin_version_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "commit_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "plugin_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "plugin_version_number",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "commit_sha",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "additions",
            type: "integer",
            isNullable: false,
          },
          {
            name: "removals",
            type: "integer",
            isNullable: false,
          },
          {
            name: "byte_size",
            type: "integer",
            isNullable: false,
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
      "plugin_commit_utilizations",
      new TableForeignKey({
        columnNames: ["plugin_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "plugins",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_commit_utilizations",
      new TableForeignKey({
        columnNames: ["plugin_version_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "plugin_versions",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_commit_utilizations",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_commit_utilizations",
      new TableForeignKey({
        columnNames: ["commit_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "commits",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_commit_utilizations",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_commit_utilizations",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("plugin_commit_utilizations");
  }
}
