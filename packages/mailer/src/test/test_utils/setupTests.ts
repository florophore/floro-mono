import RedisClient from '../../MailerClient';
import container from './testContainer'

export const mailerBeforeEach = async (): Promise<void> => {
    //if (!redisClient.connectionExists()) {
    //    await redisClient.startRedis();
    //}
} ;

export const mailerAfterEach = async (): Promise<void> => {
    //await redisClient.redis?.flushdb();
};

global.beforeEach(mailerBeforeEach);

global.afterEach(mailerAfterEach);