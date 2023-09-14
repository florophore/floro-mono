import { injectable } from 'inversify';
import { env } from 'process';

const isDev = env.NODE_ENV == 'development';
const isTest = env.NODE_ENV == 'test';

@injectable()
export default class ClientConfig {

    public username = env.REDIS_USERNAME;

    public password = env.REDIS_PASSWORD;

    public endpointAddress = env.REDIS_ENDPOINT_ADDRESS;

    public port = parseInt(env.REDIS_PORT ?? '6379');

    public hostname = env.REDIS_HOST ?? '127.0.0.1';

    public database = isTest ? 3 : isDev ? 2 : 1;

    public url(): string {
        if (this.username && this.password && this.endpointAddress) {
            return `redis://${this.username}:${this.password}@${this.endpointAddress}/${this.database}`;
        }
        if (this.username && this.password) {
            return `redis://${this.username}:${this.password}@${this.hostname}:${this.port}/${this.database}`;
        }

        if (this.endpointAddress) {
            return `redis://${this.endpointAddress}/${this.database}`;
        }

        return `redis://${this.hostname}:${this.port}/${this.database}`;
    }

}