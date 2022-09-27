import { ContainerModule } from 'inversify';
import ClientConfig from './ClientConfig';
import EmailQueue from './queues/EmailQueue';
import RedisClient from './RedisClient';
import SessionStore from './sessions/SessionStore';
import EmailAuthStore from './stores/EmailAuthStore';

export default new ContainerModule((bind): void => {
    bind<ClientConfig>(ClientConfig).toSelf();
    bind<RedisClient>(RedisClient).toSelf().inSingletonScope();
    bind<SessionStore>(SessionStore).toSelf().inSingletonScope();

    // stores
    bind<EmailAuthStore>(EmailAuthStore).toSelf().inSingletonScope();

    // queues
    bind<EmailQueue>(EmailQueue).toSelf().inSingletonScope();
});