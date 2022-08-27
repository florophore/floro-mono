import container from '../../../test_utils/testContainer';
import { expect } from 'chai'
import EmailHelper from "../../../services/utils/EmailHelper";

describe('EmailHelper', () => {
    let emailHelper: EmailHelper;

    before(() => {
        emailHelper = container.get(EmailHelper);
    });

    describe('isGoogleEmail', () => {
        it('returns true if a google email', async () => {
            const email = 'test@google.com';
            const isGoogleEmail = await emailHelper.isGoogleEmail(email);
            expect(isGoogleEmail).to.be.true;
        });

        it('returns false if not a google email', async () => {
            const email = 'test@facebook.com';
            const isGoogleEmail = await emailHelper.isGoogleEmail(email);
            expect(isGoogleEmail).to.be.false;
        });
    });


    describe('getUniqueEmail', () => {

        describe('when email is google email', () => {

            it ('should strip + symbols', async () => {
                const email = 'test+123@google.com';
                const uniqueEmail = await emailHelper.getUniqueEmail(email, true);
                expect(uniqueEmail).to.equal("test@google.com");
            });

            it ('should strip . symbols', async () => {
                const email = 't.e.s.t@google.com';
                const uniqueEmail = await emailHelper.getUniqueEmail(email, true);
                expect(uniqueEmail).to.equal("test@google.com");
            });
            it ('should convert to lowercase', async () => {
                const email = 'T.E.S.t+123@google.com';
                const uniqueEmail = await emailHelper.getUniqueEmail(email, true);
                expect(uniqueEmail).to.equal("test@google.com");
            });
        })

        describe('when email is not google email', () => {

            it ('should preserve + symbols', async () => {
                const email = 'test+123@facebook.com';
                const uniqueEmail = await emailHelper.getUniqueEmail(email, false);
                expect(uniqueEmail).to.equal("test+123@facebook.com");
            });

            it ('should respect . symbols', async () => {
                const email = 't.e.s.t@facebook.com';
                const uniqueEmail = await emailHelper.getUniqueEmail(email, false);
                expect(uniqueEmail).to.equal("t.e.s.t@facebook.com");
            });

            it ('should convert to lowercase', async () => {
                const email = 'T.E.S.T@facebook.com';
                const uniqueEmail = await emailHelper.getUniqueEmail(email, false);
                expect(uniqueEmail).to.equal("t.e.s.t@facebook.com");
            });

        });
    });
});

