import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCommitBinaries1686271724848 implements MigrationInterface {
    name = 'CreateCommitBinaries1686271724848'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "binary_commit_utilizations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "binary_id",
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
            name: "binary_file_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "binary_hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "commit_sha",
            type: "varchar",
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
      "binary_commit_utilizations",
      new TableForeignKey({
        columnNames: ["repository_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "repositories",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "binary_commit_utilizations",
      new TableForeignKey({
        columnNames: ["binary_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "binaries",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "binary_commit_utilizations",
      new TableForeignKey({
        columnNames: ["commit_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "commits",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "binary_commit_utilizations",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "binary_commit_utilizations",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("binary_commit_utilizations");
  }
}
