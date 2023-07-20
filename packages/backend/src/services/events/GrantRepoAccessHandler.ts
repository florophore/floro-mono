
import { Repository } from '@floro/database/src/entities/Repository';
import { User } from '@floro/database/src/entities/User';

export default interface GrantRepoAccessHandler {
    onGrantReadAccess(repo: Repository, grantedByUser: User, toUser: User): Promise<void>
    onGrantWriteAccess(repo: Repository, grantedByUser: User, toUser: User): Promise<void>
}