import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class addOrganizationMembersOrganizationInvitesAndOrganizationAdminsTables1667795267466
  implements MigrationInterface
{
  name =
    "addOrganizationMembersOrganizationInvitesAndOrganizationAdminsTables1667795267466";

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.createTable(
      new Table({
        name: "organization_members",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "internal_handle",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "membership_state",
            type: "varchar",
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
      "organization_members",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_members",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "organization_members",
      new TableIndex({
        name: "IDX_organization_members_membership_state",
        columnNames: ["organization_id", "membership_state"],
      })
    );

    await queryRunner.createIndex(
      "organization_members",
      new TableIndex({
        name: "IDX_organization_members_internal_handle",
        columnNames: ["organization_id", "internal_handle"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "organization_roles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_by_organization_member_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_by_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "is_mutable",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "is_default",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_create_repos",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_modify_organization_settings",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_modify_organization_developer_settings",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_invite_members",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_modify_invites",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_modify_organization_members",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_modify_own_internal_handle",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_modify_billing",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "can_modify_organization_roles",
            type: "boolean",
            isNullable: false,
            default: false,
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
      "organization_roles",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_roles",
      new TableForeignKey({
        columnNames: ["created_by_organization_member_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_members",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_roles",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );


    await queryRunner.createTable(
      new Table({
        name: "organization_invitations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "invited_by_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "invited_by_organization_member_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "first_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "last_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "normalized_email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email_hash",
            type: "varchar",
            isNullable: false
          },
          {
            name: "invitation_state",
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
      "organization_invitations",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_invitations",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_invitations",
      new TableForeignKey({
        columnNames: ["invited_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_invitations",
      new TableForeignKey({
        columnNames: ["invited_by_organization_member_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_members",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "organization_invitations",
      new TableIndex({
        name: "IDX_organization_invitations_invitation_state",
        columnNames: ["organization_id", "invitation_state"],
      })
    );

    await queryRunner.createIndex(
      "organization_invitations",
      new TableIndex({
        name: "IDX_organization_invitations_email_hash",
        columnNames: ["organization_id", "email_hash"],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "organization_member_roles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "organization_member_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "organization_role_id",
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
      "organization_member_roles",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_member_roles",
      new TableForeignKey({
        columnNames: ["organization_member_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_members",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_member_roles",
      new TableForeignKey({
        columnNames: ["organization_role_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_roles",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "organization_invitation_roles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "organization_invitation_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "organization_role_id",
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
      "organization_invitation_roles",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_invitation_roles",
      new TableForeignKey({
        columnNames: ["organization_invitation_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_invitations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_invitation_roles",
      new TableForeignKey({
        columnNames: ["organization_role_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_roles",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "organization_daily_activated_members",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "date",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "organization_member_id",
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
      "organization_daily_activated_members",
      new TableForeignKey({
        columnNames: ["organization_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organizations",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "organization_daily_activated_members",
      new TableForeignKey({
        columnNames: ["organization_member_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "organization_members",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "organization_daily_activated_members",
      new TableIndex({
        name: "IDX_organization_daily_activated_members_date",
        columnNames: ["date", "organization_id"],
      })
    );

    await queryRunner.createIndex(
      "organization_daily_activated_members",
      new TableIndex({
        name: "IDX_organization_daily_activated_members_date_members",
        columnNames: ["date", "organization_id", "organization_member_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_daily_activated_members"`);
    await queryRunner.query(`DROP TABLE "organization_invitation_roles"`);
    await queryRunner.query(`DROP TABLE "organization_member_roles"`);
    await queryRunner.query(`DROP TABLE "organization_invitations"`);
    await queryRunner.query(`DROP TABLE "organization_roles"`);
    await queryRunner.query(`DROP TABLE "organization_members"`);
  }
}
