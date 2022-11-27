import { User } from '@floro/database/src/entities/User';
import { UserAuthCredential } from '@floro/database/src/entities/UserAuthCredential';
import { QueryRunner } from 'typeorm';

export default interface CreateUserEventHandler {
    onUserCreated(queryRunner: QueryRunner, user: User, userAuthCredential: UserAuthCredential): Promise<void>
}