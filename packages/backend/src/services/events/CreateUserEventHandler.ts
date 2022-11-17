import { User, UserAuthCredential } from "@floro/graphql-schemas/build/generated/main-graphql";
import { QueryRunner } from 'typeorm';

export default interface CreateUserEventHandler {
    onUserCreated(queryRunner: QueryRunner, user: User, userAuthCredential: UserAuthCredential): Promise<void>
}