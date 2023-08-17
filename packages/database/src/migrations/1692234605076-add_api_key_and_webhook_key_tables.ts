import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class AddApiKeyAndWebhookKeyTables1692234605076
  implements MigrationInterface
{
  name = "AddApiKeyAndWebhookKeyTables1692234605076";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "api_keys",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "key_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "key_type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "secret", // index this
            type: "varchar",
            isNullable: false,
          },
          {
            name: "is_enabled",
            type: "boolean",
            isNullable: false,
            default: true,
          },
          {
            name: "created_by_user_id",
            type: "uuid",
            isNullable: false,
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
      "api_keys",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "api_keys",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "api_keys",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "api_keys",
      new TableIndex({
        name: "IDX_api_keys_secret",
        columnNames: ["secret"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "webhook_keys",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "domain",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "secret", // index this
            type: "varchar",
            isNullable: false,
          },
          {
            name: "dns_verification_code", // index this
            type: "varchar",
            isNullable: false,
          },
          {
            name: "default_subdomain",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "default_protocol",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "default_port",
            type: "int",
            isNullable: true,
          },
          {
            name: "key_type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "is_enabled",
            type: "boolean",
            isNullable: false,
            default: true,
          },
          {
            name: "is_verified",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "created_by_user_id",
            type: "uuid",
            isNullable: false,
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
      "webhook_keys",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "webhook_keys",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "webhook_keys",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "webhook_keys",
      new TableIndex({
        name: "IDX_webhook_keys_secret",
        columnNames: ["secret"],
      })
    );

    await queryRunner.createIndex(
      "webhook_keys",
      new TableIndex({
        name: "IDX_webhook_keys_dns_verification_code",
        columnNames: ["dns_verification_code"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "repository_enabled_api_keys",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "api_version",
            type: "varchar",
            default: "'0.0.0'",
            isNullable: false,
          },
          {
            name: "api_key_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_by_user_id",
            type: "uuid",
            isNullable: false,
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
            name: "repository_id",
            type: "uuid",
            isNullable: true,
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
      "repository_enabled_api_keys",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_api_keys",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_api_keys",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_api_keys",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_api_keys",
      new TableForeignKey({
        columnNames: ["api_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "api_keys",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "repository_enabled_webhook_keys",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "webhook_version",
            type: "varchar",
            default: "'0.0.0'",
            isNullable: false,
          },
          {
            name: "subdomain",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "protocol",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "port",
            type: "int",
            isNullable: true,
          },
          {
            name: "webhook_key_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_by_user_id",
            type: "uuid",
            isNullable: false,
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
            name: "repository_id",
            type: "uuid",
            isNullable: true,
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
      "repository_enabled_webhook_keys",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_webhook_keys",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_webhook_keys",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_webhook_keys",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repository_enabled_webhook_keys",
      new TableForeignKey({
        columnNames: ["webhook_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "webhook_keys",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "api_events",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "api_tracking_id", //index this
            type: "varchar",
            isNullable: false,
          },
          {
            name: "api_version",
            type: "varchar",
            default: "'0.0.0'",
            isNullable: false,
          },
          {
            name: "did_succeed",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "status_code",
            type: "int",
            isNullable: false,
          },
          {
            name: "request_path",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "http_verb",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "payload_hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "api_key_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "repository_enabled_api_key_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: true,
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
      "api_events",
      new TableForeignKey({
        columnNames: ["repository_enabled_api_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repository_enabled_api_keys",
        onDelete: "SET NULL",
      })
    );

    //we can add these at a later migration point if needed

    //await queryRunner.createForeignKey(
    //  "api_events",
    //  new TableForeignKey({
    //    columnNames: ["repository_id"],
    //    referencedColumnNames: ["id"],
    //    referencedTableName: "repositories",
    //    onDelete: "SET NULL",
    //  })
    //);

    //await queryRunner.createForeignKey(
    //  "api_events",
    //  new TableForeignKey({
    //    columnNames: ["api_key_id"],
    //    referencedColumnNames: ["id"],
    //    referencedTableName: "api_keys",
    //    onDelete: "SET NULL",
    //  })
    //);

    await queryRunner.createIndex(
      "api_events",
      new TableIndex({
        name: "IDX_api_events_api_tracking_id",
        columnNames: ["api_tracking_id"],
      })
    );

    await queryRunner.createIndex(
      "api_events",
      new TableIndex({
        name: "IDX_api_events_created_at",
        columnNames: ["created_at"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "webhook_events",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "webhook_tracking_id", //index this
            type: "varchar",
            isNullable: false,
          },
          {
            name: "webhook_version",
            type: "varchar",
            default: "'0.0.0'",
            isNullable: false,
          },
          {
            name: "did_succeed",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "status_code",
            type: "int",
            isNullable: false,
          },
          {
            name: "attempt_count",
            type: "int",
            isNullable: false,
          },
          {
            name: "hook_url",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "payload_hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "webhook_key_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "repository_enabled_webhook_key_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "repository_id",
            type: "uuid",
            isNullable: true,
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
      "webhook_events",
      new TableForeignKey({
        columnNames: ["repository_enabled_webhook_key_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repository_enabled_webhook_keys",
        onDelete: "SET NULL",
      })
    );

    //we can add these at a later migration if needed

    //await queryRunner.createForeignKey(
    //  "webhook_events",
    //  new TableForeignKey({
    //    columnNames: ["repository_id"],
    //    referencedColumnNames: ["id"],
    //    referencedTableName: "repositories",
    //    onDelete: "SET NULL",
    //  })
    //);

    //await queryRunner.createForeignKey(
    //  "webhook_events",
    //  new TableForeignKey({
    //    columnNames: ["webhook_key_id"],
    //    referencedColumnNames: ["id"],
    //    referencedTableName: "webhook_keys",
    //    onDelete: "SET NULL",
    //  })
    //);

    await queryRunner.createIndex(
      "webhook_events",
      new TableIndex({
        name: "IDX_webhook_events_webhook_tracking_id",
        columnNames: ["webhook_tracking_id"],
      })
    );

    await queryRunner.createIndex(
      "webhook_events",
      new TableIndex({
        name: "IDX_webhook_events_created_at",
        columnNames: ["created_at"],
      })
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("webhook_events");
    await queryRunner.dropTable("api_events");
    await queryRunner.dropTable("repository_enabled_webhook_keys");
    await queryRunner.dropTable("repository_enabled_api_keys");
    await queryRunner.dropTable("webhook_keys");
    await queryRunner.dropTable("api_keys");
  }
}