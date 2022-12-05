import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class addHashKeyToRepos1670179419940 implements MigrationInterface {
  name = "addHashKeyToRepos1670179419940";

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.addColumn(
      "repositories",
      new TableColumn({
        name: "hash_key",
        type: "uuid",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "repositories",
      new TableColumn({
        name: "last_repo_update_at",
        type: "timestamp",
        default: "now()",
        isNullable: false,
      })
    );

    await queryRunner.createIndex(
      "repositories",
      new TableIndex({
        name: "IDX_repositories_hash_key",
        columnNames: ["hash_key"],
      })
    );

    await queryRunner.createIndex(
      "repositories",
      new TableIndex({
        name: "IDX_repositories_last_repo_update_at",
        columnNames: ["last_repo_update_at"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("repositories", "hash_key");
    await queryRunner.dropColumn("repositories", "last_repo_update_at");
  }
}
