import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
} from "typeorm";

export class createUsersTable1659555016690 implements MigrationInterface {
    name = 'createUsersTable1659555016690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: "id",
                        type: 'uuid',
                        isPrimary: true,
                        isNullable: false
                    },
                    {
                        name: "first_name",
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: 'last_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        isNullable: true,
                        isUnique: true
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
        )
        await queryRunner.createIndex(
            "users",
            new TableIndex({
                name: "IDX_users_first_name_last_name",
                columnNames: ["first_name", "last_name"],
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
