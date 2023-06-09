import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRevertFromAndToFieldsToCommits1686167645647
  implements MigrationInterface
{
  name = "AddRevertFromAndToFieldsToCommits1686167645647";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "commits",
      new TableColumn({
        name: "revert_from_sha",
        type: "varchar",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "commits",
      new TableColumn({
        name: "revert_to_sha",
        type: "varchar",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("commits", [
      "revert_from_sha",
      "revert_to_sha",
    ]);
  }
}
