import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsValidToCommitsTable1686247880872
  implements MigrationInterface
{
  name = "AddIsValidToCommitsTable1686247880872";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "commits",
      new TableColumn({
        name: "is_valid",
        type: "boolean",
        isNullable: false,
        default: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("commits", ["is_valid"]);
  }
}
