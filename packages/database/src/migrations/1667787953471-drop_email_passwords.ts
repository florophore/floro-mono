import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class dropEmailPasswords1667787953471 implements MigrationInterface {
    name = 'dropEmailPasswords1667787953471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_email_passwords"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_email_passwords',
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
                        isNullable: false
                    },
                    {
                        name: "user_auth_credential_id",
                        type: "uuid",
                        isNullable: false
                    },
                    {
                        name: "is_current",
                        type: 'boolean',
                        isNullable: false
                    },
                    {
                        name: "hash",
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: "last_hash",
                        type: 'varchar',
                        isNullable: true
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
            "user_email_passwords",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }),
        );

        await queryRunner.createForeignKey(
            "user_email_passwords",
            new TableForeignKey({
                columnNames: ["user_auth_credential_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "user_auth_credentials",
                onDelete: "CASCADE",
            }),
        );

        await queryRunner.createIndex(
            "user_email_passwords",
            new TableIndex({
                name: "IDX_user_email_passwords_hash",
                columnNames: ["hash"],
            }),
        );

        await queryRunner.createIndex(
            "user_email_passwords",
            new TableIndex({
                name: "IDX_user_email_passwords_hash_is_current",
                columnNames: ["hash" , "is_current"],
            }),
        );

        await queryRunner.createIndex(
            "user_email_passwords",
            new TableIndex({
                name: "IDX_user_email_passwords_last_hash",
                columnNames: ["last_hash"],
            }),
        );

    }

}
