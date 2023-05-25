import { ContainerModule } from 'inversify';
import RedisClientConfig from './RedisClientConfig';
import EmailQueue from './queues/EmailQueue';
import RedisClient from './RedisClient';
import SessionStore from './sessions/SessionStore';
import EmailAuthStore from './stores/EmailAuthStore';
import EmailVerificationStore from './stores/EmailVerificationStore';
import RedisQueueWorkers from './RedisQueueWorkers';
import RedisPubsubFactory from './RedisPubsubFactory';
import SignupExchangStore from './stores/SignUpExchangeStore';

export default new ContainerModule((bind): void => {
    bind<RedisClientConfig>(RedisClientConfig).toSelf().inSingletonScope();;
    bind<RedisClient>(RedisClient).toSelf().inSingletonScope();;
    bind<SessionStore>(SessionStore).toSelf();

    // stores
    bind<EmailAuthStore>(EmailAuthStore).toSelf();
    bind<EmailVerificationStore>(EmailVerificationStore).toSelf();
    bind<SignupExchangStore>(SignupExchangStore).toSelf();

    // queues
    bind<EmailQueue>(EmailQueue).toSelf();

    bind<RedisQueueWorkers>(RedisQueueWorkers).toSelf();

    // pubsub
    bind<RedisPubsubFactory>(RedisPubsubFactory).toSelf().inSingletonScope();
});