import container from '../test_utils/testContainer';
import Backend from '../Backend';
import BaseController from '../controllers/BaseController';

describe('Backend', () => {
    it.only('mergeResolvers', () => {
        const backend = container.get(Backend);
        console.log(backend.controllers, BaseController);
        const resolvers = backend.mergeResolvers();
        console.log("RES", resolvers);
    });
})