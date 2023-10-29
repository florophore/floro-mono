import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class AddBookmarksAndSubscriptions1698075795599 implements MigrationInterface {
    name = 'AddBookmarksAndSubscriptions1698075795599'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "repo_subscriptions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
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
      "repo_subscriptions",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repo_subscriptions",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "repo_bookmarks",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
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
      "repo_bookmarks",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repo_bookmarks",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.addColumn(
        "repositories",
        new TableColumn({
            name: "bookmark_count",
            type: "int",
            default: 0,
        })
    );

    await queryRunner.addColumn(
        "repositories",
        new TableColumn({
            name: "subscription_count",
            type: "int",
            default: 0,
        })
    );

    await queryRunner.addColumn(
        "repositories",
        new TableColumn({
            name: "announcement_count",
            type: "int",
            default: 0,
        })
    );

    await queryRunner.createIndex(
      "repositories",
      new TableIndex({
        name: "IDX_repositories_bookmark_count",
        columnNames: ["bookmark_count"],
      })
    );

    await queryRunner.createIndex(
      "repositories",
      new TableIndex({
        name: "IDX_repositories_subscription_count",
        columnNames: ["subscription_count"],
      })
    );

    await queryRunner.addColumn(
        "repositories",
        new TableColumn({
            name: "anyone_can_write_announcements",
            type: "boolean",
            default: true
        })
    );

    await queryRunner.createTable(
      new Table({
        name: "repo_announcements",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_by_user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "text",
            type: "text",
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
      "repo_announcements",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repo_announcements",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repo_announcements",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repo_announcements",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "repo_announcements",
      new TableIndex({
        name: "IDX_repo_announcements_created_at",
        columnNames: ["created_at"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "repo_announcement_replies",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "text",
            type: "text",
            isNullable: false,
          },
          {
            name: "is_deleted",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "repo_announcement_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
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
      "repo_announcement_replies",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repo_announcement_replies",
      new TableForeignKey({
        columnNames: ["repo_announcement_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repo_announcements",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.addColumn(
        "users",
        new TableColumn({
            name: "hide_bookmarks_in_profile",
            type: "boolean",
            default: false,
        })
    );

    await queryRunner.addColumn(
        "users",
        new TableColumn({
            name: "hide_organizations_in_profile",
            type: "boolean",
            default: false,
        })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "hide_bookmarks_in_profile");
    await queryRunner.dropColumn("users", "hide_organizations_in_profile");
    await queryRunner.dropColumn("repositories", "bookmark_count");
    await queryRunner.dropColumn("repositories", "subscription_count");
    await queryRunner.dropColumn("repositories", "announcement_count");
    await queryRunner.dropColumn("repositories", "anyone_can_write_announcements");
    await queryRunner.dropTable("repo_announcement_replies");
    await queryRunner.dropTable("repo_announcements");
    await queryRunner.dropTable("repo_subscriptions");
    await queryRunner.dropTable("repo_bookmarks");
  }

}
