import { injectable } from 'inversify';
import { env } from 'process';

const isDev = env.NODE_ENV == 'development';
const isTest = env.NODE_ENV == 'test';

@injectable()
export default class ClientConfig {

  public url(): string {

    const port =
        env.REDIS_PORT && typeof env?.REDIS_PORT == "string"
        ? parseInt(env.REDIS_PORT ?? "6379")
        : env?.REDIS_PORT ?? 6379;

    const hostname = env.REDIS_HOST ?? "127.0.0.1";
    const database = isTest ? 3 : isDev ? 2 : 1;
    if (env.REDIS_USERNAME && env.REDIS_PASSWORD && env.REDIS_ENDPOINT_ADDRESS) {
      return `redis://${env.REDIS_USERNAME}:${env.REDIS_PASSWORD}@${env.REDIS_ENDPOINT_ADDRESS}/${database}`;
    }
    if (env.REDIS_USERNAME && env.REDIS_PASSWORD) {
      return `redis://${env.REDIS_USERNAME}:${env.REDIS_PASSWORD}@${hostname}:${port}/${database}`;
    }

    if (env.REDIS_ENDPOINT_ADDRESS) {
      return `redis://${env.REDIS_ENDPOINT_ADDRESS}/${database}`;
    }

    return `redis://${hostname}:${port}/${database}`;
  }
}