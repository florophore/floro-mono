import { expect } from 'chai'
import EmailHelper from "../../../contexts/utils/EmailHelper";

describe('EmailHelper', () => {

    describe('isGoogleEmail', () => {
        it('returns true if a google email', async () => {
            const email = 'test@google.com';
            const isGoogleEmail = await EmailHelper.isGoogleEmail(email);
            expect(isGoogleEmail).to.be.true;
        });

        it('returns false if not a google email', async () => {
            const email = 'test@facebook.com';
            const isGoogleEmail = await EmailHelper.isGoogleEmail(email);
            expect(isGoogleEmail).to.be.false;
        });
    });


    describe('getUniqueEmail', () => {

        describe('when email is google email', () => {

            it('should strip + symbols', () => {
                const email = 'test+123@google.com';
                const uniqueEmail = EmailHelper.getUniqueEmail(email, true);
                expect(uniqueEmail).to.equal("test@google.com");
            });

            it('should strip . symbols', () => {
                const email = 't.e.s.t@google.com';
                const uniqueEmail = EmailHelper.getUniqueEmail(email, true);
                expect(uniqueEmail).to.equal("test@google.com");
            });

            it('should convert to lowercase', () => {
                const email = 'T.E.S.t+123@google.com';
                const uniqueEmail = EmailHelper.getUniqueEmail(email, true);
                expect(uniqueEmail).to.equal("test@google.com");
            });
        })

        describe('when email is not google email', () => {

            it('should preserve + symbols', () => {
                const email = 'test+123@facebook.com';
                const uniqueEmail = EmailHelper.getUniqueEmail(email, false);
                expect(uniqueEmail).to.equal("test+123@facebook.com");
            });

            it('should respect . symbols', () => {
                const email = 't.e.s.t@facebook.com';
                const uniqueEmail = EmailHelper.getUniqueEmail(email, false);
                expect(uniqueEmail).to.equal("t.e.s.t@facebook.com");
            });

            it('should convert to lowercase', () => {
                const email = 'T.E.S.T@facebook.com';
                const uniqueEmail = EmailHelper.getUniqueEmail(email, false);
                expect(uniqueEmail).to.equal("t.e.s.t@facebook.com");
            });
        });
    });

    describe('getEmailHash', () => {

        describe('when email is google email ', () => {
            it('non-normalized and normalized hashed addresses should match', () => {
                const nonNormalizedAddress = "T.E.S.t+123@google.com";
                const normalizedAddress = "test@google.com";
                const hash1 = EmailHelper.getEmailHash(nonNormalizedAddress, true);
                const hash2 = EmailHelper.getEmailHash(normalizedAddress, true);
                expect(hash1).to.equal(hash2);
            })
        });

        describe('when email is NOT google email', () => {
            it('non-normalized and normalized hashed addresses should match', () => {
                const nonNormalizedAddress = "TEST+123@facebook.com";
                const normalizedAddress = "test+123@facebook.com";
                const hash1 = EmailHelper.getEmailHash(nonNormalizedAddress, false);
                const hash2 = EmailHelper.getEmailHash(normalizedAddress, false);
                expect(hash1).to.equal(hash2);
            })
        });
    });
});