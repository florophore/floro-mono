import { dbBeforeEach, dbAfterEach } from "@floro/database/src/test/test_utils/setupTests";
import { redisBeforeEach, redisAfterEach } from '@floro/redis/src/test/test_utils/setupTests';
import { storageBeforeEach, storageAfterEach } from '@floro/storage/src/tests/test_utils/setupTests';
import container from './testContainer';

export const backendBeforeEach = (container) => async (): Promise<void> => {
    await redisBeforeEach(container)();
    await dbBeforeEach(container)();
    await storageBeforeEach(container)();
} ;

export const backendAfterEach = (container) => async (): Promise<void> => {
    await redisAfterEach(container)();
    await dbAfterEach(container)();
    await storageAfterEach(container)();
} ;

global.beforeEach(backendBeforeEach(container));
global.afterEach(backendAfterEach(container));