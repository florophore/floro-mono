import { MergeRequest } from '@floro/database/src/entities/MergeRequest';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface CreateMergeRequestEventHandler {
    onMergeRequestCreated(queryRunner: QueryRunner, byUser: User, branchHead: string|undefined, mergeRequest: MergeRequest): Promise<void>
}