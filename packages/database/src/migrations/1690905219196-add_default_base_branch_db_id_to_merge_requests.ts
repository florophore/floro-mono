import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddDefaultBaseBranchDbIdToMergeRequests1690905219196
  implements MigrationInterface
{
  name = "AddDefaultBaseBranchDbIdToMergeRequests1690905219196";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "merge_requests",
      new TableColumn({
        name: "db_base_branch_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "merge_requests",
      new TableForeignKey({
        columnNames: ["db_base_branch_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "branches",
        onDelete: "SET NULL",
      })
    );

    const requests = await queryRunner.query("SELECT id, db_branch_id FROM merge_requests");
    for (const request of requests) {
        const [branch] = await queryRunner.query("SELECT * FROM branches where id ='" + request.db_branch_id + "'")
        const [baseBranch] = await queryRunner.query("SELECT * FROM branches where branch_id ='" + branch.base_branch_id + "'")
        await queryRunner.query("UPDATE merge_requests SET db_base_branch_id = '" + baseBranch.id + "' where id = '" + request.id + "'");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("merge_requests", ["db_base_branch_id"]);
  }
}
