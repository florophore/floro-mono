import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class addOrganizationsTable1667788860634 implements MigrationInterface {
  name = "addOrganizationsTable1667788860634";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organizations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
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
            name: "legal_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "contact_email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "normalized_contact_email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "contact_email_hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "agreed_to_customer_service_agreement",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "handle",
            type: "varchar",
            isNullable: true,
            isUnique: true,
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
      "organizations",
      new TableForeignKey({
        columnNames: ["created_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "organizations",
      new TableIndex({
        name: "IDX_organizations_name",
        columnNames: ["name"],
      })
    );

    await queryRunner.createIndex(
      "organizations",
      new TableIndex({
        name: "IDX_organizations_normalized_contact_email",
        columnNames: ["normalized_contact_email"],
      })
    );

    await queryRunner.createIndex(
      "organizations",
      new TableIndex({
        name: "IDX_organizations_contact_email",
        columnNames: ["contact_email"],
      })
    );

    await queryRunner.createIndex(
      "organizations",
      new TableIndex({
        name: "IDX_organizations_contact_email_hash",
        columnNames: ["contact_email_hash"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organizations"`);
  }
}
