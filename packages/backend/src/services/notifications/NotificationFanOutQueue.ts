import { injectable, inject } from "inversify";
import { Job, Queue, Worker, QueueScheduler } from "bullmq";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoDataService from "../repositories/RepoDataService";
import { Notification } from "@floro/database/src/entities/Notification";
import RedisClient from "@floro/redis/src/RedisClient";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { QueueService } from "../QueueService";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import NotificationsContext from "@floro/database/src/contexts/notifications/NotificationsContext";

@injectable()
export default class NotificationFanOutQueue implements QueueService {
  private contextFactory!: ContextFactory;

  public static QUEUE_NAME = "notification-fan-out-queue";

  public queue!: Queue;
  public worker!: Worker;
  public scheduler!: QueueScheduler;
  public pubsub!: RedisPubSub;
  public redisClient!: RedisClient;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.contextFactory = contextFactory;
  }

  public setRedisPubsub(pubsub: RedisPubSub): void {
    this.pubsub = pubsub;
  }

  public async addtoNotificationQueue(notification: Notification) {
    await this.addtoQueue({jobId: notification.id, notification});
  }

  public async addtoQueue(args: {
    jobId: string;
    notification: Notification
  }): Promise<void> {
    await this.queue.add(NotificationFanOutQueue.QUEUE_NAME, args);
  }

  public startQueueWorker(redisClient: RedisClient): void {
    this.queue = new Queue(NotificationFanOutQueue.QUEUE_NAME, {
      connection: redisClient.redis,
    });

    this.scheduler = new QueueScheduler(NotificationFanOutQueue.QUEUE_NAME, {
      connection: redisClient.redis,
    });

    this.worker = new Worker(
      NotificationFanOutQueue.QUEUE_NAME,
      async (
        args: Job<{
          jobId: string;
          notification: Notification
        }>
      ) => {
        const notificationData = args.data.notification;
        const notificationsContext = await this.contextFactory.createContext(NotificationsContext);
        const notification = await notificationsContext.getById(notificationData.id);
        if (!notification || notification.isDeleted) {
            return null;
        }
        const usersContext = await this.contextFactory.createContext(UsersContext);
        const user = await usersContext.getById(notificationData.userId);
        if (!user?.id) {
            return;
        }
        this.pubsub.publish('USER_NOTIFICATION_COUNT_UPDATED:' + user.id, {
            userNotificationCountUpdated: user
        });
      },
      { autorun: true, connection: redisClient.redis }
    );
  }
}
