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
    bind<RedisClient>(RedisClient).toSelf();
    bind<SessionStore>(SessionStore).toSelf();

    // stores
    bind<EmailAuthStore>(EmailAuthStore).toSelf();
    bind<EmailVerificationStore>(EmailVerificationStore).toSelf();

    // queues
    bind<EmailQueue>(EmailQueue).toSelf();

    bind<RedisQueueWorkers>(RedisQueueWorkers).toSelf();
});