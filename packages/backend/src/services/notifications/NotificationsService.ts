import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import { Notification } from "@floro/database/src/entities/Notification";
import BranchPushHandler from "../events/BranchPushEventHandler";
import { Branch } from "@floro/database/src/entities/Branch";
import { QueryRunner } from "typeorm";
import { MergeRequest } from "@floro/database/src/entities/MergeRequest";
import NotificationsContext from "@floro/database/src/contexts/notifications/NotificationsContext";
import { ReviewerRequest } from "@floro/database/src/entities/ReviewerRequest";
import { ReviewStatus } from "@floro/database/src/entities/ReviewStatus";
import { MergeRequestComment } from "@floro/database/src/entities/MergeRequestComment";
import { MergeRequestCommentReply } from "@floro/database/src/entities/MergeRequestCommentReply";
import UpdateMergeRequestEventHandler from "../merge_requests/merge_request_events/UpdateMergeRequestEventHandler";
import CloseMergeRequestEventHandler from "../merge_requests/merge_request_events/CloseMergeRequestEventHandler";
import UpdatedMergeRequestReviewersEventHandler from "../merge_requests/merge_request_events/UpdatedMergeRequestReviewersEventHandler";
import ReviewStatusChangeEventHandler from "../merge_requests/merge_request_events/ReviewStatusChangeEventHandler";
import MergeRequestCommentEventHandler from "../merge_requests/merge_request_events/MergeRequestCommentEventHandler";
import MergeRequestCommentReplyEventHandler from "../merge_requests/merge_request_events/MergeRequestCommentReplyEventHandler";
import MergedMergeRequestEventHandler from "../merge_requests/merge_request_events/MergedMergeRequestEventHandler";
import GrantRepoAccessHandler from "../events/GrantRepoAccessHandler";
import OrgInvitationsHandler from "../events/OrgInvitationsHandler";
import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";
import BookarkSubscriptionsHandler from "../events/BookmarkSubscriptionsHandler";
import { RepoBookmark } from "@floro/database/src/entities/RepoBookmark";
import { RepoSubscription } from "@floro/database/src/entities/RepoSubscription";
import RepoAnnouncementReplyHandler from "../events/RepoAnnouncementReplyHandler";
import { RepoAnnouncementReply } from "@floro/database/src/entities/RepoAnnouncementReply";
import { RepoAnnouncement } from "@floro/database/src/entities/RepoAnnouncement";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import ReviewerRequestsContext from "@floro/database/src/contexts/merge_requests/ReviewerRequestsContext";
import NotificationFanOutQueue from "./NotificationFanOutQueue";

const PAGINATION_SIZE = 10;

@injectable()
export default class NotificationsService
  implements
    BranchPushHandler,
    UpdateMergeRequestEventHandler,
    CloseMergeRequestEventHandler,
    UpdatedMergeRequestReviewersEventHandler,
    ReviewStatusChangeEventHandler,
    MergeRequestCommentEventHandler,
    MergeRequestCommentReplyEventHandler,
    MergedMergeRequestEventHandler,
    GrantRepoAccessHandler,
    OrgInvitationsHandler,
    BookarkSubscriptionsHandler,
    RepoAnnouncementReplyHandler
{
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private notificationFanOutQueue!: NotificationFanOutQueue;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(NotificationFanOutQueue) notificationFanOutQueue: NotificationFanOutQueue
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.notificationFanOutQueue = notificationFanOutQueue;
  }
  public async onCreateRepoAnnouncementReply(
    repoAnnouncement: RepoAnnouncement,
    repoAnnouncementReply: RepoAnnouncementReply
  ): Promise<void> {

    const involvedUserIds = new Set<string>();
    involvedUserIds.add(repoAnnouncement?.createdByUserId)

    for (const reply of repoAnnouncement?.replies ?? []) {
      involvedUserIds.add(reply?.userId);
    }

    for (const userId of involvedUserIds) {
      if (userId == repoAnnouncementReply.userId) {
        continue;
      }
      const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext
      );
      const notification = await notificationsContext.create({
        eventName: "REPO_ANNOUNCEMENT_REPLY_CREATED",
        userId,
        performedByUserId: repoAnnouncementReply.userId,
        repoAnnouncementId: repoAnnouncement.id,
        repoAnnouncementReplyId: repoAnnouncementReply.id,
        repositoryId: repoAnnouncement.repositoryId,
      });
      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onRemoveRepoAnnouncement(
    repoAnnouncement: RepoAnnouncement,
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    await notificationsContext.deleteRepoAnnouncementNotifications(
      repoAnnouncement.id
    );
  }

  public async onRemoveRepoAnnouncementReply(
    _repoAnnouncement: RepoAnnouncement,
    repoAnnouncementReply: RepoAnnouncementReply
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    await notificationsContext.deleteRepoAnnouncementReplyNotifications(
      repoAnnouncementReply.id
    );
  }

  public async onCreateBookmarkNotification(
    repoBookmark: RepoBookmark,
    repository: Repository
  ): Promise<void> {
    if (repository?.repoType == "user_repo") {
      const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext
      );
      const notification = await notificationsContext.create({
        eventName: "REPO_BOOKMARK_CREATED",
        userId: repository.userId,
        performedByUserId: repoBookmark.userId,
        repositoryId: repository.id,
        repoBookmarkId: repoBookmark.id,
      });

      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }
  public async onRemoveBookmarkNotification(
    repoBookmark: RepoBookmark,
    _repository: Repository
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    await notificationsContext.deleteBookmarkNotifications(repoBookmark.id);
  }

  public async onCreateSubscriptionNotification(
    repoSubscription: RepoSubscription,
    repository: Repository
  ): Promise<void> {
    if (repository?.repoType == "user_repo") {
      const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext
      );
      const notification = await notificationsContext.create({
        eventName: "REPO_SUBSCRIPTION_CREATED",
        userId: repository.userId,
        performedByUserId: repoSubscription.userId,
        repositoryId: repository.id,
        repoSubscriptionId: repoSubscription.id,
      });
      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }
  public async onRemoveSubscriptionNotification(
    repoSubscription: RepoSubscription,
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    await notificationsContext.deleteBookmarkNotifications(repoSubscription.id);
  }

  public async onCreateInvitation(
    organizationInvitation: OrganizationInvitation,
    organization: Organization,
    invitedByUser: User,
    user: User
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    const notification = await notificationsContext.create({
      eventName: "ORG_INVITATION_CREATED",
      userId: user.id,
      performedByUserId: invitedByUser.id,
      organizationId: organization.id,
      organizationInvitationId: organizationInvitation.id,
    });

    this.notificationFanOutQueue.addtoNotificationQueue(notification);
  }

  public async onCancelInvitation(
    organizationInvitation: OrganizationInvitation
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    await notificationsContext.deleteOrganizationInvitationNotifications(
      organizationInvitation.id
    );
  }

  public async onAcceptInvitation(
    organizationInvitation: OrganizationInvitation
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    await notificationsContext.markCheckedOrganizationInvitationNotifications(
      organizationInvitation.id
    );
  }

  public async onDeclineInvitation(
    organizationInvitation: OrganizationInvitation
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    await notificationsContext.markCheckedOrganizationInvitationNotifications(
      organizationInvitation.id
    );
  }

  public async onGrantReadAccess(): Promise<void> {
    // no notification needed
  }

  public async onGrantWriteAccess(
    repo: Repository,
    grantedByUser: User,
    toUser: User
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    const notification = await notificationsContext.create({
      eventName: "REPOSITORY_WRITE_ACCESS_GRANTED",
      userId: toUser.id,
      performedByUserId: grantedByUser.id,
      repositoryId: repo.id,
    });

    this.notificationFanOutQueue.addtoNotificationQueue(notification);
  }

  public async onBranchChanged(
    repository: Repository,
    byUser: User,
    branch: Branch
  ): Promise<void> {
    if (!branch?.branchId) {
      return;
    }
    const mergeRequestsContext = await this.contextFactory.createContext(
      MergeRequestsContext
    );
    const mergeRequestExists =
      await mergeRequestsContext.repoHasOpenRequestOnBranch(
        repository?.id,
        branch?.branchId
      );
    if (!mergeRequestExists) {
      return;
    }
    const mergeRequest =
      await mergeRequestsContext.getOpenMergeRequestByBranchNameAndRepo(
        repository.id,
        branch?.branchId
      );
    if (!mergeRequest) {
      return;
    }

    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );

    const involvedUserIds = new Set<string>();
    for (const reviewerRequest of openReviewerRequests) {
      involvedUserIds.add(reviewerRequest?.requestedByUserId);
      involvedUserIds.add(reviewerRequest?.requestedReviewerUserId);
    }

    for (const userId of involvedUserIds) {
      if (userId == byUser.id) {
        continue;
      }
      const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext
      );
      const notification = await notificationsContext.create({
        eventName: "MERGE_REQUEST_BRANCH_UPDATED",
        userId: userId,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        repositoryId: mergeRequest.repositoryId,
      });
      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onMergeRequestUpdated(
  ): Promise<void> {
    // NO NEED TO UPDATE
  }

  public async onMergeRequestClosed(
    queryRunner: QueryRunner,
    byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    mergeRequest: MergeRequest
  ): Promise<void> {
    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );

    const involvedUserIds = new Set<string>();
    for (const reviewerRequest of openReviewerRequests) {
      involvedUserIds.add(reviewerRequest?.requestedByUserId);
      involvedUserIds.add(reviewerRequest?.requestedReviewerUserId);
    }

    const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext,
        queryRunner
    );
    for (const userId of involvedUserIds) {
      if (userId == byUser.id) {
        continue;
      }
      const notification = await notificationsContext.create({
        eventName: "MERGE_REQUEST_CLOSED",
        userId: userId,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        repositoryId: mergeRequest.repositoryId,
      });
      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onMergeRequestMerged(
    queryRunner: QueryRunner,
    byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    mergeRequest: MergeRequest
  ): Promise<void> {
    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );

    const involvedUserIds = new Set<string>();
    for (const reviewerRequest of openReviewerRequests) {
      involvedUserIds.add(reviewerRequest?.requestedByUserId);
      involvedUserIds.add(reviewerRequest?.requestedReviewerUserId);
    }

    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext,
      queryRunner
    );
    for (const userId of involvedUserIds) {
      if (userId == byUser.id) {
        continue;
      }
      const notification = await notificationsContext.create({
        eventName: "MERGE_REQUEST_MERGED",
        userId: userId,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        repositoryId: mergeRequest.repositoryId,
      });

      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onUpdatedMergeRequestReviwers(
    queryRunner: QueryRunner,
    byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    mergeRequest: MergeRequest,
    _reviewerRequests: ReviewerRequest[],
    addedReviewers: User[],
    _groupId: string
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext,
      queryRunner
    );
    for (const requestedUser of addedReviewers) {
      const notification = await notificationsContext.create({
        eventName: "REVIEWER_ADDED",
        userId: requestedUser.id,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        repositoryId: mergeRequest.repositoryId,
      });

      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onReviewStatusAdded(
    queryRunner: QueryRunner,
    byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    mergeRequest: MergeRequest,
    reviewStatus: ReviewStatus
  ): Promise<void> {
    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );

    const involvedUserIds = new Set<string>();
    for (const reviewerRequest of openReviewerRequests) {
      involvedUserIds.add(reviewerRequest?.requestedByUserId);
      involvedUserIds.add(reviewerRequest?.requestedReviewerUserId);
    }

    const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext,
        queryRunner
    );
    for (const userId of involvedUserIds) {
      if (userId == byUser.id) {
        continue;
      }
      const notification = await notificationsContext.create({
        eventName: "REVIEW_STATUS_ADDED",
        userId: userId,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        reviewStatusId: reviewStatus.id,
        repositoryId: mergeRequest.repositoryId,
      });

      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onReviewStatusChanged(
    queryRunner: QueryRunner,
    byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    mergeRequest: MergeRequest,
    reviewStatus: ReviewStatus
  ): Promise<void> {
    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );

    const involvedUserIds = new Set<string>();
    for (const reviewerRequest of openReviewerRequests) {
      involvedUserIds.add(reviewerRequest?.requestedByUserId);
      involvedUserIds.add(reviewerRequest?.requestedReviewerUserId);
    }

    const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext,
        queryRunner
    );
    await notificationsContext.deleteReviewStatusNotifications(reviewStatus.id);

    for (const userId of involvedUserIds) {
      if (userId == byUser.id) {
        continue;
      }
      const notification = await notificationsContext.create({
        eventName: "REVIEW_STATUS_CHANGED",
        userId: userId,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        reviewStatusId: reviewStatus.id,
        repositoryId: mergeRequest.repositoryId,
      });

      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onReviewStatusRemoved(
    queryRunner: QueryRunner,
    _byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    _mergeRequest: MergeRequest,
    reviewStatus: ReviewStatus
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext,
      queryRunner
    );
    await notificationsContext.deleteReviewStatusNotifications(reviewStatus.id);
  }

  public async onMergeRequestCommentCreated(
    queryRunner: QueryRunner,
    byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment
  ): Promise<void> {
    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );

    const involvedUserIds = new Set<string>();
    for (const reviewerRequest of openReviewerRequests) {
      involvedUserIds.add(reviewerRequest?.requestedByUserId);
      involvedUserIds.add(reviewerRequest?.requestedReviewerUserId);
    }

    involvedUserIds.add(comment.userId);
    const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext,
        queryRunner
    );
    for (const userId of involvedUserIds) {
      if (userId == byUser.id) {
        continue;
      }
      const notification = await notificationsContext.create({
        eventName: "MERGE_REQUEST_COMMENT_ADDED",
        userId: userId,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        mergeRequestCommentId: comment.id,
        repositoryId: mergeRequest.repositoryId,
      });
      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onMergeRequestCommentUpdated(
  ): Promise<void> {
    // NOT NEED TO UPDATE
  }

  public async onMergeRequestCommentDeleted(
    queryRunner: QueryRunner,
    _byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    _mergeRequest: MergeRequest,
    comment: MergeRequestComment
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext,
      queryRunner
    );
    await notificationsContext.deleteMergeRequestCommentNotifications(
      comment.id
    );
  }

  public async onMergeRequestCommentReplyCreated(
    queryRunner: QueryRunner,
    byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment,
    reply: MergeRequestCommentReply
  ): Promise<void> {
    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );

    const involvedUserIds = new Set<string>();
    for (const reviewerRequest of openReviewerRequests) {
      involvedUserIds.add(reviewerRequest?.requestedByUserId);
      involvedUserIds.add(reviewerRequest?.requestedReviewerUserId);
    }
    involvedUserIds.add(comment.userId);
    for (const commentReply of comment?.replies ?? []) {
        if (commentReply.userId) {
            involvedUserIds.add(commentReply.userId);
        }
    }

    const notificationsContext = await this.contextFactory.createContext(
        NotificationsContext,
        queryRunner
    );
    for (const userId of involvedUserIds) {
      if (userId == byUser.id) {
        continue;
      }
      const notification = await notificationsContext.create({
        eventName: "MERGE_REQUEST_COMMENT_REPLY_ADDED",
        userId: userId,
        performedByUserId: byUser.id,
        mergeRequestId: mergeRequest.id,
        mergeRequestCommentId: comment.id,
        mergeRequestCommentReplyId: reply.id,
        repositoryId: mergeRequest.repositoryId,
      });

      this.notificationFanOutQueue.addtoNotificationQueue(notification);
    }
  }

  public async onMergeRequestCommentReplyUpdated(
  ): Promise<void> {
    // NOT NEED TO UPDATE
  }

  public async onMergeRequestCommentReplyDeleted(
    queryRunner: QueryRunner,
    _byUser: User,
    _baseBranchId: string | undefined,
    _branchHead: string | undefined,
    _mergeRequest: MergeRequest,
    _comment: MergeRequestComment,
    reply: MergeRequestCommentReply
  ): Promise<void> {
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext,
      queryRunner
    );
    await notificationsContext.deleteMergeRequestCommentReplyNotifications(
      reply.id
    );
  }

  public async fetchNotifications(
    currentUser: User,
    lastId: string
  ): Promise<{
    notifications: Array<Notification>;
    lastId: string | null;
    hasMore: boolean;
  }> {
    if (!currentUser) {
      return this.paginateFeed([], lastId);
    }
    const notificationsContext = await this.contextFactory.createContext(
      NotificationsContext
    );
    const repoAnnouncemnts =
      await notificationsContext.getAllNotifcations(
        currentUser.id
      );
    return this.paginateFeed(repoAnnouncemnts, lastId);
  }

  private paginateFeed(
    notifications: Notification[],
    lastId?: string | null
  ): {
    notifications: Array<Notification>;
    lastId: string | null;
    hasMore: boolean;
  } {
    if (!lastId) {
      const out = notifications.slice(0, PAGINATION_SIZE);
      const lastId = out?.[out.length - 1]?.id ?? null;
      const hasMore = out.length < notifications.length;
      return {
        notifications: out,
        lastId,
        hasMore,
      };
    }
    const out: Array<Notification> = [];
    let i: number = 0;
    for (; i < notifications.length; ++i) {
      if (notifications[i]?.id == lastId) {
        for (
          let j = i + 1;
          j < Math.min(i + 1 + PAGINATION_SIZE, notifications.length);
          ++j
        ) {
          out.push(notifications[j] as Notification);
        }
        const lastId = out?.[out.length - 1]?.id ?? null;
        return {
          notifications: out,
          lastId,
          hasMore: i + 1 + PAGINATION_SIZE < notifications.length,
        };
      }
    }
    return {
      notifications: [] as Array<Notification>,
      lastId: null,
      hasMore: false,
    };
  }
}
