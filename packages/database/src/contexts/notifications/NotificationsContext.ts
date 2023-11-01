import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { Notification } from "../../entities/Notification";

export default class NotificationsContext extends BaseContext {
  private notificationsRepo!: Repository<Notification>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.notificationsRepo = this.conn.datasource.getRepository(Notification);
  }

  public async create(args: DeepPartial<Notification>): Promise<Notification> {
    const entity = this.notificationsRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<Notification | null> {
    return await this.queryRunner.manager.findOne(Notification, {
      where: {
        id,
        isDeleted: false,
        hasBeenChecked: false,
      },
      relations: {
        user: {
          profilePhoto: true,
        },
        performedByUser: {
          profilePhoto: true,
        },
        organization: {
          profilePhoto: true,
        },
        repoAnnouncement: {
          createdByUser: true
        },
        repoAnnouncementReply: true,
        repository: {
          user: true,
          organization: true,
        },
        mergeRequest: true,
        mergeRequestComment: true,
        mergeRequestCommentReply: true,
        reviewStatus: true,
        organizationInvitation: true,
        repoSubscription: true,
        repoBookmark: true,
      },
    });
  }

  public async getAllNotifcations(userId: string): Promise<Notification[]> {
    return await this.queryRunner.manager.find(Notification, {
      where: {
        userId,
        isDeleted: false,
      },
      order: {
        createdAt: 'DESC'
      },
      relations: {
        performedByUser: {
          profilePhoto: true
        },
        organization: {
          profilePhoto: true
        },
        repoAnnouncement: {
          createdByUser: true
        },
        repoAnnouncementReply: true,
        repository: {
          user: true,
          organization: true,
        },
        mergeRequest: true,
        mergeRequestComment: true,
        mergeRequestCommentReply: true,
        reviewStatus: true,
        organizationInvitation: true,
        repoSubscription: true,
        repoBookmark: true,
      }
    });
  }
  public async getUncheckNotifcations(userId: string): Promise<Notification[]> {
    return await this.queryRunner.manager.find(Notification, {
      where: {
        userId,
        isDeleted: false,
        hasBeenChecked: false,
      },
      order: {
        createdAt: 'DESC'
      },
      relations: {
        performedByUser: {
          profilePhoto: true
        },
        organization: {
          profilePhoto: true
        },
        repoAnnouncement: {
          createdByUser: true
        },
        repoAnnouncementReply: true,
        repository: {
          user: true,
          organization: true,
        },
        mergeRequest: true,
        mergeRequestComment: true,
        mergeRequestCommentReply: true,
        reviewStatus: true,
        organizationInvitation: true,
        repoSubscription: true,
        repoBookmark: true,
      }
    });
  }

  public async getUncheckedNotificationsCount(
    userId: string
  ): Promise<number> {
    const [, count] = await this.queryRunner.manager.findAndCount(
      Notification,
      {
        where: {
          userId,
          isDeleted: false,
          hasBeenChecked: false,
        },
      }
    );
    return count;
  }

  public async deleteRepoAnnouncementNotifications(
    repoAnnouncementId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         repoAnnouncementId,
       })
       .execute();
  }

  public async markCheckedRepoAnnouncementNotifications(
    repoAnnouncementId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         repoAnnouncementId,
       })
       .execute();
  }

  public async deleteRepoAnnouncementReplyNotifications(
    repoAnnouncementReplyId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         repoAnnouncementReplyId,
       })
       .execute();
  }

  public async markCheckedRepoAnnouncementReplyNotifications(
    repoAnnouncementReplyId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         repoAnnouncementReplyId,
       })
       .execute();
  }

  public async deleteBookmarkNotifications(
    repoBookmarkId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         repoBookmarkId,
       })
       .execute();
  }

  public async markCheckedBookmarkNotifications(
    repoBookmarkId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         repoBookmarkId,
       })
       .execute();
  }

  public async deleteSubscriptionNotifications(
    repoSubscriptionId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         repoSubscriptionId,
       })
       .execute();
  }

  public async markCheckedSubscriptionNotifications(
    repoSubscriptionId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         repoSubscriptionId,
       })
       .execute();
  }

  public async deleteOrganizationInvitationNotifications(
    organizationInvitationId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         organizationInvitationId,
       })
       .execute();
  }

  public async markCheckedOrganizationInvitationNotifications(
    organizationInvitationId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         organizationInvitationId,
       })
       .execute();
  }

  public async deleteReviewStatusNotifications(
    reviewStatusId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         reviewStatusId,
       })
       .execute();
  }

  public async markCheckedReviewStatusNotifications(
    reviewStatusId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         reviewStatusId,
       })
       .execute();
  }

  public async deleteMergeRequestCommentNotifications(
    mergeRequestCommentId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         mergeRequestCommentId,
       })
       .execute();
  }

  public async markCheckedMergeRequestCommentNotifications(
    mergeRequestCommentId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         mergeRequestCommentId,
       })
       .execute();
  }

  public async deleteMergeRequestCommentReplyNotifications(
    mergeRequestCommentReplyId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         isDeleted: true,
       })
       .where({
         mergeRequestCommentReplyId,
       })
       .execute();
  }

  public async markCheckedMergeRequestCommentReplyNotifications(
    mergeRequestCommentReplyId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         mergeRequestCommentReplyId,
       })
       .execute();
  }

  public async markCheckedMergeRequestNotificationsForUser(
    mergeRequestId: string,
    userId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         mergeRequestId,
         userId
       })
       .execute();
  }

  public async markCheckedRepoAnnouncementNotificationsForUser(
    repoAnnouncementId: string,
    userId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         repoAnnouncementId,
         userId
       })
       .execute();
  }

  public async markCheckedRepositoryNotificationsForUser(
    repoAnnouncementId: string,
    userId: string
  ) {
     await this.queryRunner.manager
       .createQueryBuilder()
       .update(Notification)
       .set({
         hasBeenChecked: true,
       })
       .where({
         repoAnnouncementId,
         userId,
         eventName: "REPOSITORY_WRITE_ACCESS_GRANTED"
       })
       .execute();
  }


  public async updatehNotification(
    notification: Notification,
    notificationArgs: DeepPartial<Notification>
  ): Promise<Notification> {
    return (
      (await this.updateNotificationById(
        notification.id,
        notificationArgs
      )) ?? notification
    );
  }

  public async updateNotificationById(
    id: string,
    notificationArgs: DeepPartial<Notification>
  ): Promise<Notification | null> {
    const notification = await this.getById(id);
    if (notification === null) {
      throw new Error("Invalid ID to update for Notification.id: " + id);
    }
    for (const prop in notificationArgs) {
      notification[prop] = notificationArgs[prop];
    }
    return await this.queryRunner.manager.save(Notification, notification);
  }
}