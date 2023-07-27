import RedisClient from "@floro/redis/src/RedisClient";
import { Job, Queue, Worker, UnrecoverableError, QueueScheduler } from "bullmq";
import { RedisPubSub } from "graphql-redis-subscriptions";

export interface QueueService {
  queue: Queue;
  worker: Worker;
  pubsub: RedisPubSub;
  startQueueWorker(redisClient: RedisClient): void
  setRedisPubsub(pubsub: RedisPubSub): void
}