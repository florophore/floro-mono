import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AddRbacRulesForRepo1685038733931 implements MigrationInterface {
    name = 'AddRbacRulesForRepo1685038733931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "repositories",
            new TableColumn({
                name: "default_branch_id",
                type: "varchar",
                isNullable: false,
                default: "'main'"
            })
        );

        await queryRunner.addColumn(
            "repositories",
            new TableColumn({
                name: "anyone_can_push_branches",
                type: "boolean",
                default: true
            })
        );

        await queryRunner.addColumn(
            "repositories",
            new TableColumn({
                name: "anyone_can_delete_branches",
                type: "boolean",
                default: true
            })
        );

        await queryRunner.addColumn(
            "repositories",
            new TableColumn({
                name: "anyone_can_change_settings",
                type: "boolean",
                default: false
            })
        );

        await queryRunner.createTable(
          new Table({
            name: "repo_enabled_user_settings",
            columns: [
              {
                name: "id",
                type: "uuid",
                isPrimary: true,
                isNullable: false,
              },
              {
                name: "setting_name",
                type: "varchar",
                isNullable: false,
              },
              {
                name: "repository_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "user_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
              {
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
            ],
          }),
          true
        );

        await queryRunner.createForeignKey(
          "repo_enabled_user_settings",
          new TableForeignKey({
            columnNames: ["repository_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "repositories",
            onDelete: "CASCADE",
          })
        );

        await queryRunner.createForeignKey(
          "repo_enabled_user_settings",
          new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
          })
        );


        await queryRunner.createTable(
          new Table({
            name: "repo_enabled_role_settings",
            columns: [
              {
                name: "id",
                type: "uuid",
                isPrimary: true,
                isNullable: false,
              },
              {
                name: "setting_name",
                type: "varchar",
                isNullable: false,
              },
              {
                name: "repository_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "role_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
              {
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
            ],
          }),
          true
        );

        await queryRunner.createForeignKey(
          "repo_enabled_role_settings",
          new TableForeignKey({
            columnNames: ["repository_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "repositories",
            onDelete: "CASCADE",
          })
        );

        await queryRunner.createForeignKey(
          "repo_enabled_role_settings",
          new TableForeignKey({
            columnNames: ["role_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "organization_roles",
            onDelete: "CASCADE",
          })
        );

        await queryRunner.createTable(
          new Table({
            name: "protected_branch_rules",
            columns: [
              {
                name: "id",
                type: "uuid",
                isPrimary: true,
                isNullable: false,
              },
              {
                name: "branch_id",
                type: "varchar",
                isNullable: false,
              },
              {
                name: "branch_name",
                type: "varchar",
                isNullable: false,
              },
              {
                name: "disable_direct_pushing",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "require_approval_to_merge",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "automatically_delete_merged_feature_branches",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "anyone_can_create_merge_requests",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "anyone_with_approval_can_merge",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "anyone_can_merge_merge_requests",
                type: "boolean",
                isNullable: false,
                default: false
              },
              {
                name: "anyone_can_approve_merge_requests",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "anyone_can_revert",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "anyone_can_autofix",
                type: "boolean",
                isNullable: false,
                default: true
              },
              {
                name: "repository_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
              {
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
            ],
          }),
          true
        );

        await queryRunner.createForeignKey(
          "protected_branch_rules",
          new TableForeignKey({
            columnNames: ["repository_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "repositories",
            onDelete: "CASCADE",
          })
        );

        await queryRunner.createTable(
          new Table({
            name: "protected_branch_rule_enabled_user_settings",
            columns: [
              {
                name: "id",
                type: "uuid",
                isPrimary: true,
                isNullable: false,
              },
              {
                name: "setting_name",
                type: "varchar",
                isNullable: false,
              },
              {
                name: "protected_branch_rule_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "user_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
              {
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
            ],
          }),
          true
        );

        await queryRunner.createForeignKey(
          "protected_branch_rule_enabled_user_settings",
          new TableForeignKey({
            columnNames: ["protected_branch_rule_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "protected_branch_rules",
            onDelete: "CASCADE",
          })
        );

        await queryRunner.createForeignKey(
          "protected_branch_rule_enabled_user_settings",
          new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
          })
        );

        await queryRunner.createTable(
          new Table({
            name: "protected_branch_rule_enabled_role_settings",
            columns: [
              {
                name: "id",
                type: "uuid",
                isPrimary: true,
                isNullable: false,
              },
              {
                name: "setting_name",
                type: "varchar",
                isNullable: false,
              },
              {
                name: "protected_branch_rule_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "role_id",
                type: "uuid",
                isNullable: false,
              },
              {
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
              {
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false,
              },
            ],
          }),
          true
        );

        await queryRunner.createForeignKey(
          "protected_branch_rule_enabled_role_settings",
          new TableForeignKey({
            columnNames: ["protected_branch_rule_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "protected_branch_rules",
            onDelete: "CASCADE",
          })
        );

        await queryRunner.createForeignKey(
          "protected_branch_rule_enabled_role_settings",
          new TableForeignKey({
            columnNames: ["role_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "organization_roles",
            onDelete: "CASCADE",
          })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("repositories", [
            "default_branch_id",
            "anyone_can_push_branches",
            "anyone_can_delete_branches",
            "anyone_can_change_settings",
        ]);
        await queryRunner.dropTable("repo_enabled_role_settings");
        await queryRunner.dropTable("repo_enabled_user_settings");

        await queryRunner.dropTable("protected_branch_rule_enabled_role_settings");
        await queryRunner.dropTable("protected_branch_rule_enabled_user_settings");
        await queryRunner.dropTable("protected_branch_rules");
    }

}
