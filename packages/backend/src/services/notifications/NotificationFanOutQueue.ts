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
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import { User } from "@floro/database/src/entities/User";

import {convert } from "html-to-text";
import UserAuthCredentialsContext from "@floro/database/src/contexts/authentication/UserAuthCredentialsContext";
import MainConfig from "@floro/config/src/MainConfig";

const fromEmail = process?.env?.DOMAIN ?? "floro.io";

const clampText = (str: string, size: number = 100) => {
  if (str.length > size) {
    return `${str.substring(0, size)}...`;
  }
  return str;
};

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

@injectable()
export default class NotificationFanOutQueue implements QueueService {
  private contextFactory!: ContextFactory;

  public static QUEUE_NAME = "notification-fan-out-queue";

  public queue!: Queue;
  public worker!: Worker;
  public scheduler!: QueueScheduler;
  public pubsub!: RedisPubSub;
  public redisClient!: RedisClient;
  private emailQueue?: EmailQueue;
  private mainConfig!: MainConfig;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(EmailQueue) emailQueue: EmailQueue,
    @inject(MainConfig) mainConfig: MainConfig
  ) {
    this.contextFactory = contextFactory;
    this.emailQueue = emailQueue;
    this.mainConfig = mainConfig;
  }

  public setRedisPubsub(pubsub: RedisPubSub): void {
    this.pubsub = pubsub;
  }

  public async addtoNotificationQueue(notification: Notification) {
    await this.addtoQueue({ jobId: notification.id, notification });
  }

  public async addtoQueue(args: {
    jobId: string;
    notification: Notification;
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
          notification: Notification;
        }>
      ) => {
        const notificationData = args.data.notification;
        const notificationsContext = await this.contextFactory.createContext(
          NotificationsContext
        );
        const notification = await notificationsContext.getById(
          notificationData.id
        );
        if (!notification || notification.isDeleted) {
          return null;
        }
        const usersContext = await this.contextFactory.createContext(
          UsersContext
        );
        const user = await usersContext.getById(notificationData.userId);
        const performedByUser = await usersContext.getById(
          notificationData.performedByUserId
        );

        const userAuthCredentialsContext =
          await this.contextFactory.createContext(UserAuthCredentialsContext);

        if (!user?.id || !performedByUser?.id) {
          return;
        }
        const credentials =
          await userAuthCredentialsContext.getCredentialsByUserId(user.id);
        const email = credentials[0].email;

        if (!email) {
          return;
        }

        this.pubsub.publish("USER_NOTIFICATION_COUNT_UPDATED:" + user.id, {
          userNotificationCountUpdated: user,
        });

        const repoName =
          notification?.repository?.repoType == "user_repo"
            ? `@${notification?.repository?.user?.username}/${notification?.repository?.name}`
            : `@${notification?.repository?.organization?.handle}/${notification?.repository?.name}`;
        const mergeRequestTitle = clampText(
          notification?.mergeRequest?.title ?? ""
        );
        const mergeRequestName = `[${notification?.mergeRequest?.mergeRequestCount}] ${mergeRequestTitle}`;

        const subjectLine = this.getNotificationSubjectLine(
          performedByUser,
          notification
        );
        if (!subjectLine) {
          return null;
        }

        const notificationLink = `${this.mainConfig.url()}/notification/${
          notification.id
        }`;

        const performedByUserFirstName = upcaseFirst(performedByUser?.firstName ?? "");
        const performedByUserLastName = upcaseFirst(performedByUser?.lastName ?? "");
        const performedByUserFullName = `${performedByUserFirstName} ${performedByUserLastName}`;
        const firstName = upcaseFirst(user?.firstName ?? "");

        const props = {
          notification,
          repoName,
          notificationLink,
          mergeRequestName,
          eventName: notification.eventName,
          firstName,
          performedByUserFullName,
          subjectLine
        };

        if (notification.eventName == "REPO_ANNOUNCEMENT_REPLY_CREATED") {
          if (user.muteRepoAnnouncementReplyAdded) {
            return;
          }
          const plainText = convert(
            notification?.repoAnnouncement?.text ?? "",
            {
              wordwrap: 130,
            }
          );
          const commentText = clampText(
            plainText ?? ""
          );
          const commentReplyText = clampText(
            notification?.repoAnnouncementReply?.text ?? ""
          );
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props: {
              ...props,
              commentText,
              commentReplyText,
            },
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "REPOSITORY_WRITE_ACCESS_GRANTED") {
          if (user.muteRepoWriteAccessGranted) {
            return;
          }
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props,
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "MERGE_REQUEST_BRANCH_UPDATED") {
          if (user.muteMergeRequestBranchUpdated) {
            return;
          }
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props,
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "MERGE_REQUEST_CLOSED") {
          if (user.muteMergeRequestMergedOrClosed) {
            return;
          }
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props,
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "MERGE_REQUEST_MERGED") {
          if (user.muteMergeRequestMergedOrClosed) {
            return;
          }
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props,
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "REVIEWER_ADDED") {
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props,
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "REVIEW_STATUS_ADDED") {
          if (user.muteMergeRequestReviewStatusChanged) {
            return;
          }
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props,
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "REVIEW_STATUS_CHANGED") {
          if (user.muteMergeRequestReviewStatusChanged) {
            return;
          }
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props,
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "MERGE_REQUEST_COMMENT_ADDED") {
          if (user.muteMergeRequestCommentAdded) {
            return;
          }
          const commentText = clampText(
            notification?.mergeRequestComment?.text ?? ""
          );
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props: {
              ...props,
              commentText,
            },
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }

        if (notification.eventName == "MERGE_REQUEST_COMMENT_REPLY_ADDED") {
          if (user.muteMergeRequestCommentReplyAdded) {
            return;
          }

          const commentText = clampText(
            notification?.mergeRequestComment?.text ?? ""
          );
          const commentReplyText = clampText(
            notification?.mergeRequestCommentReply?.text ?? ""
          );
          await this.emailQueue?.add({
            jobId: notification.id,
            template: "NotificationEmail",
            props: {
              ...props,
              commentText,
              commentReplyText,
            },
            to: email,
            from: `notifications@${fromEmail}`,
            subject: subjectLine,
          });
        }
      },
      { autorun: true, connection: redisClient.redis, concurrency: 10 }
    );
  }

  public getNotificationSubjectLine(
    performedByUser: User,
    notification: Notification
  ): string | null {
    const firstName = upcaseFirst(performedByUser?.firstName ?? "");
    const lastName = upcaseFirst(performedByUser?.lastName ?? "");
    const repoName =
      notification?.repository?.repoType == "user_repo"
        ? `@${notification?.repository?.user?.username}/${notification?.repository?.name}`
        : `@${notification?.repository?.organization?.handle}/${notification?.repository?.name}`;

    const userFullName = `${firstName} ${lastName}`;
    const mergeRequestTitle = clampText(
      notification?.mergeRequest?.title ?? "",
      30
    );
    const mergeRequestName = `[${notification?.mergeRequest?.mergeRequestCount}] ${mergeRequestTitle}`;

    if (notification.eventName == "REPO_ANNOUNCEMENT_REPLY_CREATED") {
      const plainText = convert(
        notification?.repoAnnouncement?.text ?? "",
        {
          wordwrap: 130,
        }
      );
      const clampedText = clampText(plainText, 30);
      return `[Floro Notification] ${userFullName} replied to announcement "${clampedText}"`;
    }

    if (notification.eventName == "REPOSITORY_WRITE_ACCESS_GRANTED") {
      return `[Floro Notification] ${userFullName} granted you access to repository ${repoName}`;
    }

    if (notification.eventName == "MERGE_REQUEST_BRANCH_UPDATED") {
      return `[Floro Notification] ${userFullName} updated branch for merge request ${mergeRequestName}`;
    }

    if (notification.eventName == "MERGE_REQUEST_CLOSED") {
      return `[Floro Notification] ${userFullName} closed merge request ${mergeRequestName}`;
    }

    if (notification.eventName == "MERGE_REQUEST_MERGED") {
      return `[Floro Notification] ${userFullName} merged merge request ${mergeRequestName}`;
    }

    if (notification.eventName == "REVIEWER_ADDED") {
      return `[Floro Notification] ${userFullName} added you as a reviewer to merge request ${mergeRequestName}`;
    }

    if (
      notification.eventName == "REVIEW_STATUS_ADDED" &&
      notification?.reviewStatus?.approvalStatus == "approved"
    ) {
      return `[Floro Notification] ${userFullName} approved merge request ${mergeRequestName}`;
    }

    if (
      notification.eventName == "REVIEW_STATUS_ADDED" &&
      notification?.reviewStatus?.approvalStatus == "blocked"
    ) {
      return `[Floro Notification] ${userFullName} blocked merge request ${mergeRequestName}`;
    }

    if (
      notification.eventName == "REVIEW_STATUS_CHANGED" &&
      notification?.reviewStatus?.approvalStatus == "approved"
    ) {
      return `[Floro Notification] ${userFullName} changed review status to approved for merge request ${mergeRequestName}`;
    }

    if (
      notification.eventName == "REVIEW_STATUS_CHANGED" &&
      notification?.reviewStatus?.approvalStatus == "blocked"
    ) {
      return `[Floro Notification] ${userFullName} changed review status to blocked for merge request ${mergeRequestName}`;
    }

    if (notification.eventName == "MERGE_REQUEST_COMMENT_ADDED") {
      const clampedText = clampText(
        notification?.mergeRequestComment?.text ?? "",
        30
      );
      return `[Floro Notification] ${userFullName} commented "${clampedText}" on merge request ${mergeRequestName}`;
    }

    if (notification.eventName == "MERGE_REQUEST_COMMENT_REPLY_ADDED") {
      const clampedText = clampText(
        notification?.mergeRequestComment?.text ?? "",
        30
      );
      return `[Floro Notification] ${userFullName} replied to comment "${clampedText}" on merge request ${mergeRequestName}`;
    }
    return null;
  }
}
