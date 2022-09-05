import container from '../test_utils/testContainer';
import '../test_utils/setupTests';

import EmailQueue from '../../queues/EmailQueue';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('RedisClient', () => {

    let emailQueue: EmailQueue;

    beforeEach(() => {
        emailQueue = container.get(EmailQueue);
    })

    it('add works', (finished) => {
        emailQueue.makeMailWorker(async (job) => {
            expect((job.data as any).foo).to.be.eq("bar")
            finished();
        });
        emailQueue.add({foo: "bar"})
    });
});