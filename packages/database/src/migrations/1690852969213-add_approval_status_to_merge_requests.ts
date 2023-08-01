import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddApprovalStatusToMergeRequests1690852969213
  implements MigrationInterface
{
  name = "AddApprovalStatusToMergeRequests1690852969213";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "merge_requests",
      new TableColumn({
        name: "approval_status",
        type: "varchar",
        default: "'pending'",
      })
    );

    await queryRunner.addColumn(
      "merge_requests",
      new TableColumn({
        name: "was_closed_without_merging",
        type: "boolean",
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("merge_requests", [
      "approval_status",
      "was_closed_without_merging",
    ]);
  }
}
