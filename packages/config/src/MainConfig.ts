import { injectable } from 'inversify';
import { env } from 'process';

const isDev = env.NODE_ENV === 'development';
const isTest = env.NODE_ENV === 'test';

@injectable()
export default class MainConfig {

    public url(): string {
        if (isDev || isTest) {
            return 'http://localhost:9000';

        }
        return 'https://floro.io';
    }

    public assetHost(): string {
        if (isDev || isTest) {
            return 'http://localhost:9000';

        }
        return 'https://cdn.floro.io';
    }

}