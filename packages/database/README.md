in postgres past sql from sql/creeate_dbs.sql

to migrate do `yarn typeorm migrate:run`

to generate new migration do `NAME=<snake_case_migration_name> yarn typeorm migrate:generate`

to revert do `yarn typeorm migrate:revert`
