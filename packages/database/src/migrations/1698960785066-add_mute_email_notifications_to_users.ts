import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMuteEmailNotificationsToUsers1698960785066 implements MigrationInterface {
    name = 'AddMuteEmailNotificationsToUsers1698960785066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "mute_repo_announcement_reply_added",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "mute_repo_write_access_granted",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "mute_merge_request_branch_updated",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "mute_merge_request_merged_or_closed",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "mute_merge_request_review_status_changed",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "mute_merge_request_comment_added",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "mute_merge_request_comment_reply_added",
                type: "boolean",
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "mute_repo_announcement_reply_added");
        await queryRunner.dropColumn("users", "mute_repo_write_access_granted");
        await queryRunner.dropColumn("users", "mute_merge_request_branch_updated");
        await queryRunner.dropColumn("users", "mute_merge_request_merged_or_closed");
        await queryRunner.dropColumn("users", "mute_merge_request_review_status_changed");
        await queryRunner.dropColumn("users", "mute_merge_request_comment_added");
        await queryRunner.dropColumn("users", "mute_merge_request_comment_reply_added");
    }

}
