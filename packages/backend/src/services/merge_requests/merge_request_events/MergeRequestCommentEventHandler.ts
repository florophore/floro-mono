import { MergeRequest } from '@floro/database/src/entities/MergeRequest';
import { MergeRequestComment } from '@floro/database/src/entities/MergeRequestComment';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface MergeRequestCommentEventHandler {
    onMergeRequestCommentCreated(queryRunner: QueryRunner, byUser: User, baseBranchId: string|undefined, branchHead: string|undefined, mergeRequest: MergeRequest, comment: MergeRequestComment): Promise<void>
    onMergeRequestCommentUpdated(queryRunner: QueryRunner, byUser: User, baseBranchId: string|undefined, branchHead: string|undefined, mergeRequest: MergeRequest, comment: MergeRequestComment): Promise<void>
    onMergeRequestCommentDeleted(queryRunner: QueryRunner, byUser: User, baseBranchId: string|undefined, branchHead: string|undefined, mergeRequest: MergeRequest, comment: MergeRequestComment): Promise<void>
}