import { injectable, inject } from "inversify";
import BaseController from "./BaseController";
import { Get } from "./annotations/HttpDecorators";
import { createHmac } from "crypto";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import RedisClient from "@floro/redis/src/RedisClient";

@injectable()
export default class HealthCheckController extends BaseController {
  public databaseConnection!: DatabaseConnection;
  public redisClient!: RedisClient;
  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(RedisClient) redisClient: RedisClient,
  ) {
    super();
    this.databaseConnection = databaseConnection;
    this.redisClient = redisClient;
  }

  @Get("/healthcheck")
  public async healthcheck(_req, res) {
    try {
      const redisResult = await this.redisClient.redis?.call("PING")
      if (redisResult != "PONG") {
        res.sendStatus(500);
        return;
      }
      if (!this.databaseConnection.datasource.isInitialized) {
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(500);
      return;
    }
  }
}
