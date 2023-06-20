import { MergeRequest } from '@floro/database/src/entities/MergeRequest';
import { ReviewStatus } from '@floro/database/src/entities/ReviewStatus';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface ReviewStatusChangeEventHandler {
    onReviewStatusAdded(queryRunner: QueryRunner, byUser: User, branchHead: string|undefined, mergeRequest: MergeRequest, reviewStatus: ReviewStatus): Promise<void>
    onReviewStatusChanged(queryRunner: QueryRunner, byUser: User, branchHead: string|undefined, mergeRequest: MergeRequest, reviewStatus: ReviewStatus): Promise<void>
    onReviewStatusRemoved(queryRunner: QueryRunner, byUser: User, branchHead: string|undefined, mergeRequest: MergeRequest, reviewStatus: ReviewStatus): Promise<void>
}