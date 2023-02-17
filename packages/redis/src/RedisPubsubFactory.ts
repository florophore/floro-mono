import { inject, injectable } from "inversify";
import { RedisPubSub } from "graphql-redis-subscriptions";
import RedisClient from "./RedisClient";

@injectable()
export default class RedisPubsubFactory {

  private redisClient: RedisClient;

  constructor(@inject(RedisClient) redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  public create(): RedisPubSub {
    return new RedisPubSub({
      connection: this.redisClient.getConnectionConfig()
    });
  }
}
