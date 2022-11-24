import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class addRepositoriesTable1669088257193 implements MigrationInterface {
  name = "addRepositoriesTable1669088257193";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "repositories",
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
            name: "repo_type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "is_private",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "license_code",
            type: "varchar",
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
      "repositories",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repositories",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "repositories",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "repositories",
      new TableIndex({
        name: "IDX_repositories_organizations_name",
        columnNames: ["organization_id", "name"],
      })
    );

    await queryRunner.createIndex(
      "repositories",
      new TableIndex({
        name: "IDX_repositories_users_name",
        columnNames: ["user_id", "name"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "repositories"`);
  }
}
