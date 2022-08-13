import container from '../test_utils/testContainer';
import Backend from '../Backend';

describe('Backend', () => {
    it('mergeResolvers', () => {
        const backend = container.get(Backend);
        const resolvers = backend.mergeResolvers();
        console.log("RES", resolvers);
    });
})