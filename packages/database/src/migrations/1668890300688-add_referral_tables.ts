import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class addReferralTables1668890300688 implements MigrationInterface {
  name = "addReferralTables1668890300688";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "referrals",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "referrer_user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "referee_user_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "referrer_device_id",
            type: "varchar",
            isNullable: false
          },
          {
            name: "referee_device_id",
            type: "varchar",
            isNullable: false
          },
          {
            name: "referrer_reward_bytes",
            type: "bigint",
            isNullable: false,
            default: 5368709120
          },
          {
            name: "referee_reward_bytes",
            type: "bigint",
            isNullable: false,
            default: 5368709120
          },
          {
            name: "referee_first_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "referee_last_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "referee_email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "referee_normalized_email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "referee_email_hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "referral_state",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "ttl_days",
            type: "int",
            default: 7,
            isNullable: false,
          },
          {
            name: "last_sent_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "expires_at",
            type: "timestamp",
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
      "referrals",
      new TableForeignKey({
        columnNames: ["referrer_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "referrals",
      new TableForeignKey({
        columnNames: ["referee_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "referrals",
      new TableIndex({
        name: "IDX_referrals_referrer_referral_state",
        columnNames: ["referrer_user_id", "referral_state"],
      })
    );

    await queryRunner.createIndex(
      "referrals",
      new TableIndex({
        name: "IDX_referrals_referee_referral_state",
        columnNames: ["referee_user_id", "referral_state"],
      })
    );

    await queryRunner.createIndex(
      "referrals",
      new TableIndex({
        name: "IDX_referrals_expires_at",
        columnNames: ["expires_at"],
      })
    );

    await queryRunner.createIndex(
      "referrals",
      new TableIndex({
        name: "IDX_referrals_referee_email_hash",
        columnNames: ["referee_email_hash"],
      })
    );

    await queryRunner.createIndex(
      "referrals",
      new TableIndex({
        name: "IDX_referrals_referrer_device_id",
        columnNames: ["referrer_device_id"],
      })
    );

    await queryRunner.createIndex(
      "referrals",
      new TableIndex({
        name: "IDX_referrals_referee_device_id",
        columnNames: ["referee_device_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "referrals"`);
  }
}
