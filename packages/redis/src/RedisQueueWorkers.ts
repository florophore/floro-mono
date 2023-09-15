import { inject, injectable } from "inversify";
import EmailQueue from "./queues/EmailQueue";
import RedisClient from "./RedisClient";

@injectable()
export default class RedisQueueWorkers {

    private emailQueue!: EmailQueue;

    constructor(@inject(EmailQueue) emailQueue: EmailQueue) {
        this.emailQueue = emailQueue;
    }

    public start(redisClient: RedisClient): void {
        this.emailQueue.startMailWorker(redisClient);
    }
}