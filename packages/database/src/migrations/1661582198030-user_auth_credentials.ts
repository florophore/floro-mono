import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey
} from "typeorm";            

export class userAuthCredentials1661582198030 implements MigrationInterface {
    name = 'userAuthCredentials1661582198030'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_auth_credentials',
                columns: [
                    {
                        name: "id",
                        type: 'uuid',
                        isPrimary: true,
                        isNullable: false
                    },
                    {
                        name: "user_id",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "credential_type",
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: "is_signup_credential",
                        type: 'boolean',
                        isNullable: false,
                    },
                    {
                        name: "email",
                        type: 'varchar',
                        isNullable: true
                    },
                    {
                        name: "normalized_email",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "email_hash",
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: "is_verified",
                        type: 'boolean',
                        isNullable: true,
                    },
                    {
                        name: "is_third_party_verified",
                        type: 'boolean',
                        isNullable: true,
                    },
                    {
                        name: "is_disabled",
                        type: 'boolean',
                        isNullable: true,
                    },
                    {
                        name: "has_third_party_two_factor_enabled",
                        type: 'boolean',
                        isNullable: true,
                    },
                    {
                        name: "access_token",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "google_id",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "google_given_name",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "google_family_name",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "google_locale",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "github_id",
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: "github_node_id",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "github_login",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "github_name",
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: "github_company",
                        type: 'varchar',
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
                ]
            }),
            true
        );


        await queryRunner.createForeignKey(
            "user_auth_credentials",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }),
        )

        await queryRunner.createIndex(
            "user_auth_credentials",
            new TableIndex({
                name: "IDX_user_auth_credentials_normalized_email",
                columnNames: ["normalized_email"],
            }),
        )

        await queryRunner.createIndex(
            "user_auth_credentials",
            new TableIndex({
                name: "IDX_user_auth_credentials_email",
                columnNames: ["email"],
            }),
        )

        await queryRunner.createIndex(
            "user_auth_credentials",
            new TableIndex({
                name: "IDX_user_auth_credentials_email_hash",
                columnNames: ["email_hash"],
            }),
        )

        await queryRunner.createIndex(
            "user_auth_credentials",
            new TableIndex({
                name: "IDX_user_auth_credentials_github_id",
                columnNames: ["github_id"],
            }),
        )

        await queryRunner.createIndex(
            "user_auth_credentials",
            new TableIndex({
                name: "IDX_user_auth_credentials_github_node_id",
                columnNames: ["github_node_id"],
            }),
        )

        await queryRunner.createIndex(
            "user_auth_credentials",
            new TableIndex({
                name: "IDX_user_auth_credentials_google_id",
                columnNames: ["google_id"],
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_auth_credentials"`);
    }

}