import container from '../test_utils/testContainer';
import '../test_utils/setGlobals';

import { describe, test } from 'mocha';
import { expect } from 'chai';
import EmailAuthStore from '../../stores/EmailAuthStore';

describe('EmailAuthStore', () => {

    let emailAuthStore: EmailAuthStore;

    beforeEach(() => {
        emailAuthStore = container.get(EmailAuthStore);
    })

    describe('e2e', () => {

        test('it manages email signup store', async () => {
            const email = "test@gmail.com";
            const emailSignup = await emailAuthStore.createEmailSignup(email);
            const returnedSignup = await emailAuthStore.fetchEmailSignup(emailSignup.id);
            expect(emailSignup.email).to.eql(returnedSignup?.email);
            expect(emailSignup.normalizedEmail).to.eql(returnedSignup?.normalizedEmail);
            expect(emailSignup.createdAt).to.eql(returnedSignup?.createdAt);
            expect(emailSignup.expiresAt).to.eql(returnedSignup?.expiresAt);
            expect(emailSignup.emailHash).to.eql(returnedSignup?.emailHash);
        });
    });
});