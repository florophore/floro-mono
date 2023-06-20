import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsConflictFreeToMergeRequests1687213823879 implements MigrationInterface {
    name = 'AddIsConflictFreeToMergeRequests1687213823879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "merge_requests",
            new TableColumn({
                name: "is_conflict_free",
                type: "boolean",
                isNullable: false,
                default: true
            })
        );

        await queryRunner.addColumn(
            "merge_requests",
            new TableColumn({
                name: "divergence_sha",
                type: "varchar",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("merge_requests", [
            "is_conflict_free", "divergence_sha"
        ]);
    }

}
