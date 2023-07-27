import { MergeRequest } from '@floro/database/src/entities/MergeRequest';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface UpdateMergeRequestEventHandler {
    onMergeRequestUpdated(queryRunner: QueryRunner, byUser: User, baseBranchId: string|undefined, branchHead: string|undefined, mergeRequest: MergeRequest, removedTitle: string|undefined, removedDescription: string|undefined): Promise<void>

}