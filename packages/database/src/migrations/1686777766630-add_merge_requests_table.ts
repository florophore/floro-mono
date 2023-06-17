import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class AddMergeRequestsTable1686777766630 implements MigrationInterface {
  name = "AddMergeRequestsTable1686777766630";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "merge_requests",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
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
            name: "opened_by_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "db_branch_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "branch_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "branch_head_sha_at_create",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "branch_head_sha_at_close",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "title",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "is_open",
            type: "boolean",
            isNullable: false,
            default: true,
          },
          {
            name: "is_merged",
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

    await queryRunner.createIndex(
      "merge_requests",
      new TableIndex({
        name: "IDX_merge_requests_repo_id_is_open_created_at",
        columnNames: ["repository_id", "is_open", "created_at"],
      })
    );

    await queryRunner.createIndex(
      "merge_requests",
      new TableIndex({
        name: "IDX_merge_requests_user_id_is_open_created_at",
        columnNames: ["user_id", "is_open", "created_at"],
      })
    );

    await queryRunner.createIndex(
      "merge_requests",
      new TableIndex({
        name: "IDX_merge_requests_organization_id_is_open_created_at",
        columnNames: ["organization_id", "is_open", "created_at"],
      })
    );

    await queryRunner.createIndex(
      "merge_requests",
      new TableIndex({
        name: "IDX_merge_request_repo_id_opened_by_user_id_is_open_created_at",
        columnNames: ["repository_id", "opened_by_user_id", "is_open", "created_at"],
      })
    );

    await queryRunner.createIndex(
      "merge_requests",
      new TableIndex({
        name: "IDX_merge_request_branch_id",
        columnNames: ["repository_id", "branch_id"],
      })
    );

    await queryRunner.createForeignKey(
      "merge_requests",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_requests",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_requests",
      new TableForeignKey({
        columnNames: ["opened_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_requests",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_requests",
      new TableForeignKey({
        columnNames: ["db_branch_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "branches",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "reviewer_requests",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "requested_by_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "requested_reviewer_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "merge_request_id",
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
      "reviewer_requests",
      new TableForeignKey({
        columnNames: ["requested_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "reviewer_requests",
      new TableForeignKey({
        columnNames: ["requested_reviewer_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "reviewer_requests",
      new TableForeignKey({
        columnNames: ["merge_request_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_requests",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "merge_request_comments",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "merge_request_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "plugin_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "text",
            type: "text",
            isNullable: false,
          },
          {
            name: "branch_head_sha_at_create",
            type: "varchar",
            isNullable: true,
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
      "merge_request_comments",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_request_comments",
      new TableForeignKey({
        columnNames: ["merge_request_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_requests",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "merge_request_comment_replies",
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
            name: "merge_request_comment_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "branch_head_sha_at_create",
            type: "varchar",
            isNullable: true,
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
      "merge_request_comment_replies",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_request_comment_replies",
      new TableForeignKey({
        columnNames: ["merge_request_comment_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_request_comments",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "review_statuses",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "merge_request_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "approval_status",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "branch_head_sha_at_update",
            type: "varchar",
            isNullable: true,
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
      "review_statuses",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "review_statuses",
      new TableForeignKey({
        columnNames: ["merge_request_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_requests",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "merge_request_events",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "event_name",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "subevent_name",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "branch_head_sha_at_event",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "performd_by_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "comment_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "comment_reply_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "reviewer_request_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "review_status_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "merge_request_id",
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
      "merge_request_events",
      new TableForeignKey({
        columnNames: ["performd_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_request_events",
      new TableForeignKey({
        columnNames: ["comment_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_request_comments",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_request_events",
      new TableForeignKey({
        columnNames: ["comment_reply_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_request_comment_replies",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_request_events",
      new TableForeignKey({
        columnNames: ["reviewer_request_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "reviewer_requests",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_request_events",
      new TableForeignKey({
        columnNames: ["review_status_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "review_statuses",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "merge_request_events",
      new TableForeignKey({
        columnNames: ["merge_request_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "merge_requests",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "merge_request_events",
      new TableIndex({
        name: "IDX_merge_request_events_merge_request_id_created_at",
        columnNames: ["merge_request_id", "created_at"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("merge_request_events");
    await queryRunner.dropTable("review_statuses");
    await queryRunner.dropTable("merge_request_comment_replies");
    await queryRunner.dropTable("merge_request_comments");
    await queryRunner.dropTable("reviewer_requests");
    await queryRunner.dropTable("merge_requests");
  }
}
