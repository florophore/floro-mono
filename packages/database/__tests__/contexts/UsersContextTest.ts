import { QueryFailedError } from 'typeorm';
import container from '../../src/test_utils/testContainer';
import ContextFactory from '../../src/contexts/ContextFactory';
import UsersContext from '../../src/contexts/UsersContext';
import { loadFixtures } from '../../src/test_utils/setupFixtures';
import { ValidationError } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../src/entities/User';

describe('UsersContextTest', () => {
    let usersContext: UsersContext;

    beforeEach(async () => {
        const contextFactory = container.get(ContextFactory);
        usersContext = await contextFactory.createContext(UsersContext);
    });

    describe('createUser', () => {
        const defaultParams = {
            firstName: 'foo',
            lastName: 'bar',
            username: 'doggylover'
        };

        test('can create user when required params are present', async () => {
            const createdUser = await usersContext.createUser(defaultParams);

            const readUser = await usersContext.getById(createdUser.id);
            expect(readUser).toEqual(createdUser);
        });

        test('throws when username is already taken', async () => {
            await usersContext.createUser(defaultParams);

            try {
                await usersContext.createUser(defaultParams);
            } catch (e) {
                expect(e).toBeInstanceOf(QueryFailedError);
                expect(e.detail).toEqual(`Key (username)=(${defaultParams.username}) already exists.`);
            }
        });

        test('throws when either first_name or last_name is missing', async () => {
            try {
                await usersContext.createUser({
                    lastName: defaultParams.lastName,
                    username: defaultParams.username,
                });
            } catch (e) {
                expect(e[0]).toBeInstanceOf(ValidationError);
                expect(e[0].property).toEqual('firstName');
            }

            try {
                await usersContext.createUser({
                    firstName: defaultParams.firstName,
                    username: defaultParams.username,
                });
            } catch (e) {
                expect(e[0]).toBeInstanceOf(ValidationError);
                expect(e[0].property).toEqual('lastName');
            }
        });

        test('throws when either first_name or last_name are empty', async () => {
            try {
                await usersContext.createUser({
                    firstName: '',
                    lastName: '',
                    username: defaultParams.username,
                });
            } catch (e) {
                expect(e[0]).toBeInstanceOf(ValidationError);
                expect(e[0].property).toEqual('firstName');
                expect(e[1]).toBeInstanceOf(ValidationError);
                expect(e[1].property).toEqual('lastName');
            }
        });
    });

    describe('userNameExists', () => {
        let user: User;

        beforeEach(async () => {
            [user] = await loadFixtures<User>(['User:user_0']);
        });

        test('returns true if username is taken', async () => {
            const existsAlready = await usersContext.usernameExists(user.username as string);
            expect(existsAlready).toBe(true);
        });

        test('returns false if username is not taken', async () => {
            const untakenUserName = 'doggylover1';
            const existsAlready = await usersContext.usernameExists(untakenUserName);
            expect(existsAlready).toBe(false);
        });
    });

    describe('updateUser', () => {
        let user: User;

        beforeEach(async () => {
            [user] = await loadFixtures<User>(['User:user_0']);
        });

        test('updates attributes if attributes are valid', async () => {
            const firstName = 'fooy'; 
            const lastName = 'bary'; 

            const updatedUser = await usersContext.updateUser(user, {
                firstName,
                lastName,
            });

            expect(updatedUser.id).toEqual(user.id);
            expect(updatedUser.firstName).not.toBe(user.firstName);
            expect(updatedUser.lastName).not.toBe(user.lastName);
            expect(updatedUser.firstName).toBe(firstName);
            expect(updatedUser.lastName).toBe(lastName);
        });

        test('throws if attributes are invalid', async () => {
            try {
                await usersContext.updateUser(user, {
                    firstName: '',
                    lastName: '',
                });
            } catch (e) {
                expect(e[0]).toBeInstanceOf(ValidationError);
                expect(e[0].property).toEqual('firstName');
                expect(e[1]).toBeInstanceOf(ValidationError)
                expect(e[1].property).toEqual('lastName');
            }
        });
    });

    describe('updateUserById', () => {
        let user: User;

        test('updates attributes if attributes are valid', async () => {
            [user] = await loadFixtures<User>(['User:user_0']);
            const firstName = 'fooy'; 
            const lastName = 'bary'; 
            const updatedUser = await usersContext.updateUserById(user.id, {
                firstName,
                lastName,
            });

            expect(updatedUser?.id).toEqual(user.id);
            expect(updatedUser?.firstName).not.toBe(user.firstName);
            expect(updatedUser?.lastName).not.toBe(user.lastName);
            expect(updatedUser?.firstName).toBe(firstName);
            expect(updatedUser?.lastName).toBe(lastName);
        });

        test('throws invalid id error when id does not exist', async () => {
            const badId = uuidv4();
            try {
                await usersContext.updateUserById(badId, {
                    firstName: 'fooy',
                });
            } catch (e) {
                expect(e).toEqual(new Error('Invalid ID to update for User.id: ' + badId));
            }
        });
    });
});