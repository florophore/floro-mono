import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addCanAssignRolesToRolesTable1668463155535 implements MigrationInterface {
    name = 'addCanAssignRolesToRolesTable1668463155535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("organization_roles", new TableColumn({
          name: "can_assign_roles",
          type: "boolean",
          isNullable: false,
          default: false,
        }));
        await queryRunner.query("UPDATE organization_roles SET can_assign_roles = true where is_mutable = false")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("organization_roles", "can_assign_roles")

    }

}
