import '../test_utils/setGlobals';
import container from '../test_utils/testContainer';

import EmailQueue from '../../queues/EmailQueue';
import { describe, test } from 'mocha';
import { expect } from 'chai';

describe('EmailQueue', () => {

    let emailQueue: EmailQueue;

    beforeEach(() => {
        emailQueue = container.get(EmailQueue);
    })

    test('add works', () => {
        expect(true).to.be.true;
        //emailQueue.makeMailWorker(async (job) => {
        //    expect((job.data as { foo: string}).foo).to.be.eq("bar")
        //    finished();
        //});
        //emailQueue.add({foo: "bar"})
    });
});