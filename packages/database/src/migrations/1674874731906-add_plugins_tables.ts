import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class addPluginsTables1674874731906 implements MigrationInterface {
  name = "addPluginsTables1674874731906";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "plugins",
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
            isNullable: true,
          },
          {
            name: "owner_type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "created_by_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "name_key",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "is_private",
            type: "boolean",
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
      "plugins",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugins",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugins",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "plugins",
      new TableIndex({
        name: "IDX_plugins_name",
        columnNames: ["name"],
      })
    );

    await queryRunner.createIndex(
      "plugins",
      new TableIndex({
        name: "IDX_plugins_name_key",
        columnNames: ["name_key"],
      })
    );

    await queryRunner.createIndex(
      "plugins",
      new TableIndex({
        name: "IDX_plugins_organizations_name",
        columnNames: ["organization_id", "name"],
      })
    );

    await queryRunner.createIndex(
      "plugins",
      new TableIndex({
        name: "IDX_plugins_users_name",
        columnNames: ["user_id", "name"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "plugins"`);
  }
}
