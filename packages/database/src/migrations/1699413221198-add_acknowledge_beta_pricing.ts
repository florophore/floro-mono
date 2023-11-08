import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAcknowledgeBetaPricing1699413221198 implements MigrationInterface {
    name = 'AddAcknowledgeBetaPricing1699413221198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "organizations",
            new TableColumn({
                name: "has_acknowledged_beta_pricing",
                type: "boolean",
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("organizations", "has_acknowledged_beta_pricing");
    }

}
