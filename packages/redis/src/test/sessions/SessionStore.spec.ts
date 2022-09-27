import container from '../test_utils/testContainer';
import '../test_utils/setGlobals';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import SessionStore from '../../sessions/SessionStore';
import { loadFixtures } from '@floro/database/src/test/test_utils/setupFixtures';
import { User } from '@floro/database/src/entities/User';
import { UserAuthCredential } from '@floro/database/src/entities/UserAuthCredential';

describe('SessionStore', () => {

    let sessionStore: SessionStore;

    beforeEach(() => {
        sessionStore = container.get(SessionStore);
    })

    describe('e2e', () => {
        it('it manages session operations', async () => {
            const [ user, emailAuth, githubAuth ] = await loadFixtures<[User, UserAuthCredential, UserAuthCredential]>([
            "User:user_0",
            "UserAuthCredential:email_pass_for_test@gmail",
            "UserAuthCredential:usered_github_oauth_for_test@gmail"
            ]);
            let userSessions = await sessionStore.fetchAllUserSessions(user?.id);
            expect(userSessions).to.be.empty;
            const session = await sessionStore.setNewSession(user, emailAuth);
            const returnedSession =  await sessionStore.fetchSession(session.clientKey);
            expect(session.user.id).to.equal(user.id);
            expect(session.authenticationCredentials[0].id).to.equal(emailAuth.id);
            expect(session.exchangeHistory.length).to.equal(0);
            expect(returnedSession?.user.id).to.equal(user.id);
            expect(returnedSession?.authenticationCredentials[0].id).to.equal(emailAuth.id);
            userSessions = await sessionStore.fetchAllUserSessions(user?.id);
            expect(userSessions.length).to.eql(1);
            expect(userSessions[0]?.id).to.eql(session.id);
            let exchangeSession = await sessionStore.exchangeSession(session);
            expect(exchangeSession.user.id).to.equal(user.id);
            expect(exchangeSession.expiresAt).to.equal(session.expiresAt);
            expect(exchangeSession.authenticationCredentials.length).to.equal(1);
            expect(exchangeSession.authenticationCredentials[0].id).to.equal(emailAuth.id);
            expect(exchangeSession.exchangeHistory.length).to.equal(1);
            expect(exchangeSession.exchangeHistory[0]).to.equal(session.id);
            userSessions = await sessionStore.fetchAllUserSessions(user?.id);
            expect(userSessions.length).to.eql(2);
            expect(userSessions[0]?.id).to.eql(session.id);
            expect(userSessions[1]?.id).to.eql(exchangeSession.id);
            exchangeSession = await sessionStore.addAuthenticationCredential(exchangeSession, user, githubAuth);
            expect(exchangeSession.expiresAt).to.equal(session.expiresAt);
            expect(exchangeSession.authenticationCredentials.length).to.equal(2);
            await sessionStore.deleteSession(session);
            userSessions = await sessionStore.fetchAllUserSessions(user?.id);
            expect(userSessions.length).to.eql(1);
            expect(userSessions[0]?.id).to.eql(exchangeSession.id);
            user.firstName = user.firstName + "_NAME UPDATE";
            exchangeSession = await sessionStore.updateSessionUser(exchangeSession, user);
            expect(exchangeSession.user.firstName).to.equal(user.firstName);
            expect(exchangeSession.expiresAt).to.equal(session.expiresAt);
            await sessionStore.deleteAllUserSessions(user?.id);
            userSessions = await sessionStore.fetchAllUserSessions(user?.id);
            expect(userSessions.length).to.eql(0);
        });
    });
});