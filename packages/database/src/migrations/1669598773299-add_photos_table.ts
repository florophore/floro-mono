import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class addPhotosTable1669598773299 implements MigrationInterface {
  name = "addPhotosTable1669598773299";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "photos",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "path",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "thumbnail_hash",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "thumbnail_path",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "mime_type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "uploaded_by_user_id",
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
      "photos",
      new TableForeignKey({
        columnNames: ["uploaded_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "photos",
      new TableIndex({
        name: "IDX_photos_hash",
        columnNames: ["hash"],
      })
    );

    await queryRunner.addColumn(
        "users",
        new TableColumn({
            name: "profile_photo_id",
            type: "uuid",
            isNullable: true
        })
    );

    await queryRunner.createForeignKey(
      "users",
      new TableForeignKey({
        columnNames: ["profile_photo_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "photos",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.addColumn(
        "organizations",
        new TableColumn({
            name: "profile_photo_id",
            type: "uuid",
            isNullable: true,
        })
    );

    await queryRunner.createForeignKey(
      "organizations",
      new TableForeignKey({
        columnNames: ["profile_photo_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "photos",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("organizations", "profile_photo_id");
    await queryRunner.dropColumn("users", "profile_photo_id");
    await queryRunner.query(`DROP TABLE "photos"`);
  }
}
