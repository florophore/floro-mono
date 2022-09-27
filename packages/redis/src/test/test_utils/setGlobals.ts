import container from './testContainer'
import { dbBeforeEach, dbAfterEach } from '@floro/database/src/test/test_utils/setupTests';
import { redisBeforeEach, redisAfterEach } from './setupTests';

const beforeEachRedisTest = async (): Promise<void> => {
    await redisBeforeEach(container)();
    await dbBeforeEach(container)();
} ;

const afterEachRedisTest = async (): Promise<void> => {
    await redisAfterEach(container)();
    await dbAfterEach(container)();
} ;

global.beforeEach(beforeEachRedisTest);

global.afterEach(afterEachRedisTest);