import { injectable } from 'inversify';
import { env } from 'process';

const isDev = env.NODE_PROCESS == 'development';
const isTest = env.NODE_PROCESS == 'test';

@injectable()
export default class ClientConfig {

    public username = env.REDIS_USERNAME;

    public password = env.REDIS_PASSWORD;

    public port = parseInt(env.REDIS_PORT ?? '6379');

    public hostname = env.REDIS_HOST ?? 'localhost';

    public database = isTest ? 3 : isDev ? 2 : 1;

    public url(): string {
        if (this.username && this.password) {
            return `redis://${this.username}:${this.password}@${this.hostname}:${this.port}/${this.database}`;
        }

        return `redis://${this.hostname}:${this.port}/${this.database}`;
    }

}