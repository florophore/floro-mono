import container from '../src/test_utils/testContainer';
import Backend from '../src/Backend';

describe('Backend', () => {
    test('mergeResolvers', () => {
        const backend = container.get(Backend);
        const resolvers = backend.mergeResolvers();
    });
})