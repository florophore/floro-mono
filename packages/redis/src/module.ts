import { ContainerModule } from 'inversify';
import RedisClientConfig from './RedisClientConfig';
import EmailQueue from './queues/EmailQueue';
import RedisClient from './RedisClient';
import SessionStore from './sessions/SessionStore';
import EmailAuthStore from './stores/EmailAuthStore';
import EmailVerificationStore from './stores/EmailVerificationStore';
import RedisQueueWorkers from './RedisQueueWorkers';

export default new ContainerModule((bind): void => {
    bind<RedisClientConfig>(RedisClientConfig).toSelf();
    bind<RedisClient>(RedisClient).toSelf().inSingletonScope();
    bind<SessionStore>(SessionStore).toSelf().inSingletonScope();

    // stores
    bind<EmailAuthStore>(EmailAuthStore).toSelf().inSingletonScope();
    bind<EmailVerificationStore>(EmailVerificationStore).toSelf().inSingletonScope();

    // queues
    bind<EmailQueue>(EmailQueue).toSelf().inSingletonScope();

    bind<RedisQueueWorkers>(RedisQueueWorkers).toSelf().inSingletonScope();
});