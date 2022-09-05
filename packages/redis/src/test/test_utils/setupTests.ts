import RedisClient from '../../RedisClient';
import container from './testContainer'

const redisClient = container.get(RedisClient);

export const redisBeforeEach = async (): Promise<void> => {
    if (!redisClient.connectionExists()) {
        await redisClient.startRedis();
    }
} ;

export const redisAfterEach = async (): Promise<void> => {
    await redisClient.redis?.flushdb();
};

global.beforeEach(redisBeforeEach);

global.afterEach(redisAfterEach);