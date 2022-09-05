import { ContainerModule } from 'inversify';
import ClientConfig from './ClientConfig';
import EmailQueue from './queues/EmailQueue';
import RedisClient from './RedisClient';

export default new ContainerModule((bind): void => {
    bind<ClientConfig>(ClientConfig).toSelf();
    bind<RedisClient>(RedisClient).toSelf().inSingletonScope();
    bind<EmailQueue>(EmailQueue).toSelf().inSingletonScope();
});