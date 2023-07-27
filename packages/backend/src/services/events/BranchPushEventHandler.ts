
import { Branch } from '@floro/database/src/entities/Branch';
import { Repository } from '@floro/database/src/entities/Repository';
import { User } from '@floro/database/src/entities/User';
import { QueryRunner } from 'typeorm';

export default interface BranchPushHandler {
    onBranchChanged(repository: Repository, byUser: User, branch: Branch): Promise<void>
}