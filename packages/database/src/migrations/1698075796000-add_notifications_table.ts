import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AddNotificationsTable1698075796000 implements MigrationInterface {
  name = "AddNotificationsTable1698075796000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notifications",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "event_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "repo_announcement_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "repo_announcement_reply_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "merge_request_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "merge_request_comment_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "merge_request_comment_reply_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "review_status_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "organization_invitation_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "performed_by_user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "repo_bookmark_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "repo_subscription_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "has_been_checked",
            type: "boolean",
            isNullable: false,
            default: false,
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
      "notifications",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["performed_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["repo_announcement_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repo_announcements",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["repo_announcement_reply_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repo_announcement_replies",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["merge_request_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_requests",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["merge_request_comment_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_request_comments",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["merge_request_comment_reply_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_request_comment_replies",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["review_status_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "review_statuses",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["organization_invitation_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_invitations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["repo_bookmark_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repo_bookmarks",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "notifications",
      new TableForeignKey({
        columnNames: ["repo_subscription_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repo_subscriptions",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "notifications",
      new TableIndex({
        name: "IDX_notifications_user_id_created_at",
        columnNames: ["user_id", "is_deleted", "created_at"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("notifications");
  }
}
