import { MergeRequest } from '@floro/database/src/entities/MergeRequest';
import { ReviewerRequest } from '@floro/database/src/entities/ReviewerRequest';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface UpdatedMergeRequestReviewersEventHandler {
  onUpdatedMergeRequestReviwers(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    reviewerRequests: ReviewerRequest[],
    addedReviewers: User[],
    groupId: string
  ): Promise<void>;
}