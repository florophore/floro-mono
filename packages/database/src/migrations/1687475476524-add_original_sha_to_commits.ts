import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOriginalShaToCommits1687475476524
  implements MigrationInterface
{
  name = "AddOriginalShaToCommits1687475476524";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "commits",
      new TableColumn({
        name: "original_sha",
        type: "varchar",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("commits", ["original_sha"]);
  }
}
