import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addBillingStatusToOrganizations1668541785455 implements MigrationInterface {
    name = 'addBillingStatusToOrganizations1668541785455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("organizations", new TableColumn({
          name: "billing_plan",
          type: "varchar",
          isNullable: false,
          default: "'free'",
        }));

        await queryRunner.addColumn("organizations", new TableColumn({
          name: "billing_status",
          type: "varchar",
          isNullable: false,
          default: "'none'",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("organizations", "billing_plan");
        await queryRunner.dropColumn("organizations", "billing_status");

    }
}
