import { QueryFailedError, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { expect } from 'chai';
import { ValidationError } from 'class-validator';

import '../../test_utils/setupTests';
import container from '../../test_utils/testContainer';
import { loadFixtures } from '../../test_utils/setupFixtures';

import ContextFactory from '../../../contexts/ContextFactory';
import UsersContext from '../../../contexts/users/UsersContext';
import UserAuthCredentialsContext from '../../../contexts/authentication/UserAuthCredentialsContext';
import { UserAuthCredential } from '../../../entities/UserAuthCredential';
import DatabaseConnection from '../../../connection/DatabaseConnection';

describe('UserAuthCredentialsContext', () => {
    let userAuthCredentialsContext: UserAuthCredentialsContext;
    let queryRunner: QueryRunner;

    beforeEach(async () => {
        const contextFactory = container.get(ContextFactory);
        const databaseConnection = container.get(DatabaseConnection);
        queryRunner = await databaseConnection.makeQueryRunner();
        userAuthCredentialsContext = await contextFactory.createContext(UserAuthCredentialsContext, queryRunner);
    });

    afterEach(async () => {
        await queryRunner.release();
    });

    describe.only('test', () => {

        it('test', async () => {
            const [authCred] = await loadFixtures<UserAuthCredential>([
                'UserAuthCredential:userless_google_oauth_for_test@gmail'
            ]);
            console.log("AUTH CRED", authCred);

        });
    });
});