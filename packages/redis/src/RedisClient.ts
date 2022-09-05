import { inject, injectable } from "inversify";
import ClientConfig from "./ClientConfig";
import IORedis from 'ioredis';

@injectable()
export default class RedisClient {

    private clientConfig!: ClientConfig;
    public redis?: IORedis;

    constructor(@inject(ClientConfig) clientConfig: ClientConfig) {
        this.clientConfig = clientConfig;
    }

    public connectionExists(): boolean {
        return !!this.redis;
    }

    public startRedis(): void {
        this.redis = new IORedis(this.clientConfig.url());
    }
}