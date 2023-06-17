
import { Branch } from '@floro/database/src/entities/Branch';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface BranchPushHandler {
    onBranchChanged(queryRunner: QueryRunner, byUser: User, branch: Branch): Promise<void>
}