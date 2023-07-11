import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUpdateNumberToInvitations1689056597188 implements MigrationInterface {
    name = 'AddUpdateNumberToInvitations1689056597188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "organization_invitations",
            new TableColumn({
                name: "update_count",
                type: "int",
                default: 0,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("organization_invitations", "updated_count")
    }

}
