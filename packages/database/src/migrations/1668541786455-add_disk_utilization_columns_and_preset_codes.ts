import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addDiskUtilizationColumnsAndPresetCodes1668541786455 implements MigrationInterface {
    name = 'addDiskUtilizationColumnsAndPresetCodes1668541786455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("organizations", new TableColumn({
          name: "free_disk_space_bytes",
          type: "bigint",
          isNullable: false,
          default: 10000000000,
        }));

        await queryRunner.addColumn("organizations", new TableColumn({
          name: "disk_space_limit_bytes",
          type: "bigint",
          isNullable: false,
          default: 10000000000,
        }));

        await queryRunner.addColumn("organizations", new TableColumn({
          name: "utilized_disk_space_bytes",
          type: "bigint",
          isNullable: false,
          default: 0,
        }));

        await queryRunner.addColumn("organizations", new TableColumn({
          name: "free_seats",
          type: "int",
          isNullable: false,
          default: 10,
        }));

        await queryRunner.addColumn("users", new TableColumn({
          name: "free_disk_space_bytes",
          type: "bigint",
          isNullable: false,
          default: 10000000000,
        }));

        await queryRunner.addColumn("users", new TableColumn({
          name: "disk_space_limit_bytes",
          type: "bigint",
          isNullable: false,
          default: 10000000000,
        }));

        await queryRunner.addColumn("users", new TableColumn({
          name: "utilized_disk_space_bytes",
          type: "bigint",
          isNullable: false,
          default: 0,
        }));

        await queryRunner.addColumn("users", new TableColumn({
          name: "accrued_referral_disk_space_bytes",
          type: "bigint",
          isNullable: false,
          default: 0,
        }));

        // PRESETS

        await queryRunner.addColumn("organization_roles", new TableColumn({
          name: "preset_code",
          type: "varchar",
          isNullable: true
        }));

        await queryRunner.query("UPDATE organization_roles SET preset_code = 'admin' where name = 'Admin'");
        await queryRunner.query("UPDATE organization_roles SET preset_code = 'contributor' where name = 'Contributor'");
        await queryRunner.query("UPDATE organization_roles SET preset_code = 'billing_admin' where name = 'Billing Admin'");
        await queryRunner.query("UPDATE organization_roles SET preset_code = 'technical_admin' where name = 'Technical Admin'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("organizations", "free_disk_space_bytes");
        await queryRunner.dropColumn("organizations", "disk_space_limit_bytes");
        await queryRunner.dropColumn("organizations", "utilized_disk_space_bytes");
        await queryRunner.dropColumn("organizations", "free_seats");

        await queryRunner.dropColumn("users", "free_disk_space_bytes");
        await queryRunner.dropColumn("users", "disk_space_limit_bytes");
        await queryRunner.dropColumn("users", "utilized_disk_space_bytes");
        await queryRunner.dropColumn("users", "accrued_referral_disk_space_bytes");

        await queryRunner.dropColumn("organization_roles", "preset_code");
    }
}