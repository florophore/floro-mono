import { MergeRequest } from '@floro/database/src/entities/MergeRequest';
import { MergeRequestComment } from '@floro/database/src/entities/MergeRequestComment';
import { MergeRequestCommentReply } from '@floro/database/src/entities/MergeRequestCommentReply';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface MergeRequestCommentReplyEventHandler {
    onMergeRequestCommentReplyCreated(queryRunner: QueryRunner, byUser: User, branchHead: string|undefined, mergeRequest: MergeRequest, comment: MergeRequestComment, reply: MergeRequestCommentReply): Promise<void>
    onMergeRequestCommentReplyUpdated(queryRunner: QueryRunner, byUser: User, branchHead: string|undefined, mergeRequest: MergeRequest, comment: MergeRequestComment, reply: MergeRequestCommentReply): Promise<void>
    onMergeRequestCommentReplyDeleted(queryRunner: QueryRunner, byUser: User, branchHead: string|undefined, mergeRequest: MergeRequest, comment: MergeRequestComment, reply: MergeRequestCommentReply): Promise<void>
}