import { MigrationInterface, QueryRunner } from "typeorm";

export class addUsersSearchTsvectorIndex1668321022072 implements MigrationInterface {
    name = 'addUsersSearchTsvectorIndex1668321022072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        await queryRunner.query(`CREATE INDEX users_search_on_username_idx ON users USING GIN(LOWER(username) gin_trgm_ops)`);
        await queryRunner.query(`CREATE INDEX users_search_on_fullname_idx ON users USING GIN(LOWER(first_name || ' ' || last_name) gin_trgm_ops)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX users_search_on_username_idx`);
        await queryRunner.query(`DROP INDEX users_search_on_fullname_idx`);
        await queryRunner.query(`DROP EXTENSION pg_trgm`);
    }

}
