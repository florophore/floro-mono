import { inject, injectable } from "inversify";
import RedisClientConfig from "./RedisClientConfig";
import IORedis from 'ioredis';

@injectable()
export default class RedisClient {

    private redisClientConfig!: RedisClientConfig;
    public redis?: IORedis;

    constructor(@inject(RedisClientConfig) clientConfig: RedisClientConfig) {
        this.redisClientConfig = clientConfig;
    }

    public connectionExists(): boolean {
        return !!this.redis;
    }

    public getConnectionConfig() {
        return this.redisClientConfig.url();
    }

    public async startRedis(): Promise<void> {
        this.redis = new IORedis(this.redisClientConfig.url());
        this.redis.options.maxRetriesPerRequest = null;
        await new Promise((resolve, reject) => {
            if (this.redis) {
                this.redis.on('connect', () => {
                    console.log("redis connected...");
                    resolve(true);
                })
            } else {
                reject();
            }
        })
    }
}