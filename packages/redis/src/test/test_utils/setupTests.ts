import RedisClient from '../../RedisClient';

export const redisBeforeEach = container => async (): Promise<void> => {
    const redisClient = container.get(RedisClient);
    if (!redisClient.connectionExists()) {
       await redisClient.startRedis();
    }
    return;
} ;

export const redisAfterEach = container => async (): Promise<void> => {
    const redisClient = container.get(RedisClient);
    await redisClient.redis?.flushdb();
    return;
};
