import { JobsOptions, Processor, Queue, Worker } from 'bullmq';
import { inject, injectable } from 'inversify';
import RedisClient from '../RedisClient';

@injectable()
export default class EmailQueue {

    public static QUEUE_NAME = 'email-queue';

    public queue!: Queue;
    private redisClient!: RedisClient;

    constructor(@inject(RedisClient) redisClient: RedisClient) {
        this.redisClient = redisClient;
        this.queue = new Queue(EmailQueue.QUEUE_NAME, { connection: redisClient.redis})
    }

    public makeMailWorker<T, U> (job: Processor<T, U, string>): Worker<T,U> {
        return new Worker<T,U>(EmailQueue.QUEUE_NAME, job, {
          connection: this.redisClient.redis,
        });
    }

    public async add<T>(args: T, options?: JobsOptions | undefined): Promise<void> {
        this.queue.add(EmailQueue.QUEUE_NAME, args, options)
    }

}