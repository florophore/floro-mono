import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMergeShaToMergeRequests1690988184447 implements MigrationInterface {
    name = 'AddMergeShaToMergeRequests1690988184447'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "merge_requests",
      new TableColumn({
        name: "merge_sha",
        type: "varchar",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
        "merge_request_events",
        new TableColumn({
            name: "merge_sha",
            type: "varchar",
            isNullable: true
        })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("merge_requests", ["merge_sha"]);
    await queryRunner.dropColumns("merge_request_events", ["merge_sha"]);
  }

}
