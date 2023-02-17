import { injectable } from "inversify";
import { RedisPubSub } from 'graphql-redis-subscriptions';


@injectable()
export default class BaseController {
  public envs: Array<"test"|"development"|"production"> = ["test", "development", "production"];
  protected pubsub!: RedisPubSub;

  public setRedisPubsub(pubsub: RedisPubSub) {
    this.pubsub = pubsub;
  }

  public static routingTable: {
    [method: string]: {
      [route: string]: {
        name: string,
        object: BaseController,
        method: (
          request: Express.Request,
          response: Express.Response
        ) => unknown;
      };
    };
  } = {};
}