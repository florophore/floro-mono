import container from '../test_utils/testContainer';
import Backend from '../Backend';
import BaseController from '../controllers/BaseController';

describe('Backend', () => {
    it.skip('mergeResolvers', () => {
        const backend = container.get(Backend);
        const resolvers = backend.mergeResolvers();
    });
})