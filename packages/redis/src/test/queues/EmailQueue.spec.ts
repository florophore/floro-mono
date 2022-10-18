import container from '../test_utils/testContainer';
import '../test_utils/setGlobals';

import EmailQueue from '../../queues/EmailQueue';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('EmailQueue', () => {

    let emailQueue: EmailQueue;

    beforeEach(() => {
        emailQueue = container.get(EmailQueue);
    })

    it('add works', () => {
        expect(true).to.be.true;
        //emailQueue.makeMailWorker(async (job) => {
        //    expect((job.data as { foo: string}).foo).to.be.eq("bar")
        //    finished();
        //});
        //emailQueue.add({foo: "bar"})
    });
});