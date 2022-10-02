import container from './test_utils/testContainer';
import './test_utils/setupTests';

import { describe, test } from 'mocha';
import { expect } from 'chai';
import MailerClient from '../MailerClient';

describe('MailerClient', () => {

    let mailerClient: MailerClient;

    beforeEach(() => {
        mailerClient = container.get(MailerClient);
    })

    describe.only('e2e', () => {

        test('it injects', async () => {
            console.log(mailerClient);
            expect(true).to.be.true;
        });
    });
});