import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class addPluginVersionsTableAndPluginOrganizationPermissions1675374611521
  implements MigrationInterface
{
  name = "addPluginVersionsTableAndPluginOrganizationPermissions1675374611521";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "organization_roles",
      new TableColumn({
        name: "can_register_plugins",
        type: "boolean",
        isNullable: false,
        default: false,
      })
    );

    await queryRunner.addColumn(
      "organization_roles",
      new TableColumn({
        name: "can_upload_plugins",
        type: "boolean",
        isNullable: false,
        default: false,
      })
    );

    await queryRunner.addColumn(
      "organization_roles",
      new TableColumn({
        name: "can_release_plugins",
        type: "boolean",
        isNullable: false,
        default: false,
      })
    );

    await queryRunner.query(
      "UPDATE organization_roles SET can_register_plugins = true where preset_code = 'admin'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_register_plugins = true where preset_code = 'contributor'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_register_plugins = false where preset_code = 'billing_admin'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_register_plugins = true where preset_code = 'technical_admin'"
    );

    await queryRunner.query(
      "UPDATE organization_roles SET can_upload_plugins = true where preset_code = 'admin'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_upload_plugins = true where preset_code = 'contributor'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_upload_plugins = false where preset_code = 'billing_admin'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_upload_plugins = true where preset_code = 'technical_admin'"
    );

    await queryRunner.query(
      "UPDATE organization_roles SET can_release_plugins = true where preset_code = 'admin'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_release_plugins = true where preset_code = 'contributor'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_release_plugins = false where preset_code = 'billing_admin'"
    );
    await queryRunner.query(
      "UPDATE organization_roles SET can_release_plugins = true where preset_code = 'technical_admin'"
    );

    await queryRunner.createTable(
      new Table({
        name: "plugin_versions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "plugin_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "owner_type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "uploaded_by_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "released_by_user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "name_key",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "version",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "display_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "code_repo_url",
            type: "text",
            isNullable: true,
          },
          {
            name: "code_docs_url",
            type: "text",
            isNullable: true,
          },
          {
            name: "light_icon",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "dark_icon",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "state",
            type: "varchar",
            default: "'unreleased'",
            isNullable: false,
          },
          {
            name: "is_private",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "is_released",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "is_backwards_compatible",
            type: "boolean",
            isNullable: true,
          },
          {
            name: "previous_release_version",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "manifest",
            type: "text",
            isNullable: false,
          },
          {
            name: "index_html",
            type: "text",
            isNullable: false,
          },
          {
            name: "released_at",
            type: "timestamp",
            isNullable: true,
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
      "plugin_versions",
      new TableForeignKey({
        columnNames: ["plugin_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "plugins",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_versions",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_versions",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_versions",
      new TableForeignKey({
        columnNames: ["uploaded_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_versions",
      new TableForeignKey({
        columnNames: ["released_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "plugin_versions",
      new TableIndex({
        name: "IDX_plugin_versions_name",
        columnNames: ["name"],
      })
    );

    await queryRunner.createIndex(
      "plugin_versions",
      new TableIndex({
        name: "IDX_plugin_versions_name_key",
        columnNames: ["name_key"],
      })
    );

    await queryRunner.createIndex(
      "plugin_versions",
      new TableIndex({
        name: "IDX_plugin_versions_version",
        columnNames: ["version"],
      })
    );

    await queryRunner.createIndex(
      "plugin_versions",
      new TableIndex({
        name: "IDX_plugin_versions_name_version",
        columnNames: ["name", "version"],
      })
    );

    await queryRunner.createIndex(
      "plugin_versions",
      new TableIndex({
        name: "IDX_plugin_versions_user_name_version",
        columnNames: ["user_id", "name", "version"],
      })
    );

    await queryRunner.createIndex(
      "plugin_versions",
      new TableIndex({
        name: "IDX_plugin_versions_organization_name_version",
        columnNames: ["organization_id", "name", "version"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "plugin_version_dependencies",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "plugin_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "plugin_version_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "is_primary_dependency",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "name_key",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "version",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "dependency_plugin_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "dependency_plugin_version_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "dependency_name_key",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "dependency_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "dependency_version",
            type: "varchar",
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
      "plugin_version_dependencies",
      new TableForeignKey({
        columnNames: ["plugin_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "plugins",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_version_dependencies",
      new TableForeignKey({
        columnNames: ["plugin_version_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "plugin_versions",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_version_dependencies",
      new TableForeignKey({
        columnNames: ["dependency_plugin_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "plugins",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "plugin_version_dependencies",
      new TableForeignKey({
        columnNames: ["dependency_plugin_version_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "plugin_versions",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_name",
        columnNames: ["name"],
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_name_key",
        columnNames: ["name_key"],
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_version",
        columnNames: ["version"],
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_name_version",
        columnNames: ["name", "version"],
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_dname",
        columnNames: ["dependency_name"],
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_dname_key",
        columnNames: ["dependency_name_key"],
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_dversion",
        columnNames: ["dependency_version"],
      })
    );

    await queryRunner.createIndex(
      "plugin_version_dependencies",
      new TableIndex({
        name: "IDX_plugin_version_deps_dname_dversion",
        columnNames: ["dependency_name", "dependency_version"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("plugin_version_dependencies");
    await queryRunner.dropTable("plugin_versions");
    await queryRunner.dropColumn("organization_roles", "can_register_plugins");
    await queryRunner.dropColumn("organization_roles", "can_upload_plugins");
    await queryRunner.dropColumn("organization_roles", "can_release_plugins");
  }
}
