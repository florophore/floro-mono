import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AddRepositoryTableMigrations1684897153652
  implements MigrationInterface
{
  name = "AddRepositoryTableMigrations1684897153652";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "commits",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "parent_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "sha",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "parent",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "historical_parent",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "idx",
            type: "integer",
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: true,
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
            name: "author_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "username",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "author_username",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "merge_base",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "merge_revert_sha",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "message",
            type: "text",
            isNullable: false,
          },
          {
            name: "byte_size",
            type: "integer",
            isNullable: false,
          },
          {
            name: "timestamp",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "inserted_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "commits",
      new TableForeignKey({
        columnNames: ["parent_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "commits",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "commits",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "commits",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "commits",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "commits",
      new TableForeignKey({
        columnNames: ["author_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "commits",
      new TableIndex({
        name: "IDX_commits_sha",
        columnNames: ["sha"],
      })
    );

    await queryRunner.createIndex(
      "commits",
      new TableIndex({
        name: "IDX_commits_parent",
        columnNames: ["parent"],
      })
    );

    await queryRunner.createIndex(
      "commits",
      new TableIndex({
        name: "IDX_commits_idx",
        columnNames: ["idx"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "branches",
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
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "last_commit",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "base_branch_id",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_by_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_by_username",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "is_deleted",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "inserted_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "branches",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "branches",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "branches",
      new TableForeignKey({
        columnNames: ["created_by_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "branches",
      new TableIndex({
        name: "IDX_branches_branch_id",
        columnNames: ["branch_id"],
      })
    );

    await queryRunner.createIndex(
      "branches",
      new TableIndex({
        name: "IDX_branches_base_branch_id",
        columnNames: ["base_branch_id"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "binaries",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "sha",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "file_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "mime_type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "file_extension",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "byte_size",
            type: "integer",
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "created_by_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "inserted_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      }),
      true
    );
    await queryRunner.createForeignKey(
      "binaries",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "binaries",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "binaries",
      new TableForeignKey({
        columnNames: ["created_by_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "binaries",
      new TableIndex({
        name: "IDX_binaries_sha",
        columnNames: ["sha"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("commits");
    await queryRunner.dropTable("branches");
    await queryRunner.dropTable("binaries");
  }
}
