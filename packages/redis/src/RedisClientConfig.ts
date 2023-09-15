import { injectable } from 'inversify';

const isDev = process.env.NODE_ENV == 'development';
const isTest = process.env.NODE_ENV == 'test';

@injectable()
export default class RedisClientConfig {

  public url(): string {

    const port =
        process.env.REDIS_PORT && typeof process.env?.REDIS_PORT == "string"
        ? parseInt(process.env.REDIS_PORT ?? "6379")
        : process.env?.REDIS_PORT ?? 6379;

    const hostname = process.env.REDIS_HOST ?? "127.0.0.1";
    const database = isTest ? 3 : isDev ? 2 : 1;

    if (process.env.REDIS_USERNAME && process.env.REDIS_PASSWORD && process.env.REDIS_ENDPOINT_ADDRESS) {
      return `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_ENDPOINT_ADDRESS}/${database}`;
    }
    if (process.env.REDIS_USERNAME && process.env.REDIS_PASSWORD) {
      return `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${hostname}:${port}/${database}`;
    }

    if (process.env.REDIS_ENDPOINT_ADDRESS) {
      return `redis://${process.env.REDIS_ENDPOINT_ADDRESS}/${database}`;
    }

    return `redis://${hostname}:${port}/${database}`;
  }
}