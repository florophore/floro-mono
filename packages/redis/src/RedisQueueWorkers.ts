import { inject, injectable } from "inversify";
import EmailQueue from "./queues/EmailQueue";

@injectable()
export default class RedisQueueWorkers {

    private emailQueue!: EmailQueue;

    constructor(@inject(EmailQueue) emailQueue: EmailQueue) {
        this.emailQueue = emailQueue;
    }

    public start(): void {
        this.emailQueue.startMailWorker();
    }
}