import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsConflictFreeAndIsMergedToBranches1691255178556
  implements MigrationInterface
{
  name = "AddIsConflictFreeAndIsMergedToBranches1691255178556";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "branches",
      new TableColumn({
        name: "is_conflict_free",
        type: "boolean",
        isNullable: false,
        default: false,
      })
    );

    await queryRunner.addColumn(
      "branches",
      new TableColumn({
        name: "is_merged",
        type: "boolean",
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("branches", [
      "is_conflict_free",
      "is_merged",
    ]);
  }
}
