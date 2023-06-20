import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepositoryService from "../repositories/RepositoryService";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import { Branch } from "@floro/database/src/entities/Branch";
import { QueryRunner } from "typeorm";
import CreateMergeRequestEventHandler from "./merge_request_events/CreateMergeRequestEventHandler";
import { MergeRequest } from "@floro/database/src/entities/MergeRequest";
import UpdateMergeRequestEventHandler from "./merge_request_events/UpdateMergeRequestEventHandler";
import CloseMergeRequestEventHandler from "./merge_request_events/CloseMergeRequestEventHandler";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import UpdatedMergeRequestReviewersEventHandler from "./merge_request_events/UpdatedMergeRequestReviewersEventHandler";
import { ReviewerRequest } from "@floro/database/src/entities/ReviewerRequest";
import ReviewStatusChangeEventHandler from "./merge_request_events/ReviewStatusChangeEventHandler";
import { ReviewStatus } from "@floro/database/src/entities/ReviewStatus";
import MergeRequestCommentEventHandler from "./merge_request_events/MergeRequestCommentEventHandler";
import { MergeRequestComment } from "@floro/database/src/entities/MergeRequestComment";
import MergeRequestCommentReplyEventHandler from "./merge_request_events/MergeRequestCommentReplyEventHandler";
import { MergeRequestCommentReply } from "@floro/database/src/entities/MergeRequestCommentReply";
import MergeRequestEventsContext from "@floro/database/src/contexts/merge_requests/MergeRequestEventsContext";

@injectable()
export default class MergeRequestEventService
  implements
    BranchPushHandler,
    CreateMergeRequestEventHandler,
    UpdateMergeRequestEventHandler,
    CloseMergeRequestEventHandler,
    UpdatedMergeRequestReviewersEventHandler,
    ReviewStatusChangeEventHandler,
    MergeRequestCommentEventHandler,
    MergeRequestCommentReplyEventHandler
{
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }
  public async onMergeRequestCreated(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "CREATE_MERGE_REQUEST",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      isDeleted: false
    })
  }

  public async onBranchChanged(
    queryRunner: QueryRunner,
    repository: Repository,
    byUser: User,
    branch: Branch
  ): Promise<void> {
    if (!branch?.id) {
      return;
    }
    const mergeRequestsContext = await this.contextFactory.createContext(
      MergeRequestsContext,
      queryRunner
    );
    const mergeRequestExists =
      await mergeRequestsContext.repoHasOpenRequestOnBranch(
        repository?.id,
        branch?.id
      );
    if (!mergeRequestExists) {
      return;
    }
    const mergeRequest =
      await mergeRequestsContext.getOpenMergeRequestByBranchNameAndRepo(
        repository.id,
        branch?.id
      );
    if (!mergeRequest) {
      return;
    }

    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "BRANCH_UDPATED",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branch?.lastCommit ?? undefined,
      isDeleted: false
    })
    // EMAIL all reviewers
  }

  public async onMergeRequestUpdated(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "UPDATED_MERGE_REQUEST_INFO",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      isDeleted: false
    })
  }

  public async onMergeRequestClosed(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "CLOSED_MERGE_REQUEST",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      isDeleted: false
    });
  }

  public async onUpdatedMergeRequestReviwers(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    reviewerRequests: ReviewerRequest[],
    addedReviewers: User[],
    groupId: string
  ): Promise<void> {

    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );

    for (const reviewerRequest of reviewerRequests) {
      await mergeRequestEventsContext.create({
        eventName: "ADDED_REVIEWER",
        mergeRequestId: mergeRequest.id,
        performedByUserId: byUser.id,
        branchHeadShaAtCreate: branchHead,
        reviewerRequestId: reviewerRequest.id,
        eventGroupingId: groupId,
        isDeleted: false
      });
    }
    // EMAIL
  }

  public async onReviewStatusAdded(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    reviewStatus: ReviewStatus
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "ADDED_REVIEW_STATUS",
      subeventName: reviewStatus.approvalStatus,
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      reviewerRequestId: reviewStatus.id,
      isDeleted: false
    });
    // EMAIL
  }

  public async onReviewStatusChanged(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    reviewStatus: ReviewStatus
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "UPDATED_REVIEW_STATUS",
      subeventName: reviewStatus.approvalStatus,
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      reviewerRequestId: reviewStatus.id,
      isDeleted: false
    });
    // EMAIL
  }

  public async onReviewStatusRemoved(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    reviewStatus: ReviewStatus
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "DELETED_REVIEW_STATUS",
      subeventName: reviewStatus.approvalStatus,
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      reviewerRequestId: reviewStatus.id,
      isDeleted: false
    });
  }

  public async onMergeRequestCommentCreated(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "ADDED_COMMENT",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      commentId: comment.id,
      isDeleted: false
    });
    // EMAIL
  }

  public async onMergeRequestCommentUpdated(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "UPDATED_COMMENT",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      commentId: comment.id,
      isDeleted: false
    });
  }

  public async onMergeRequestCommentDeleted(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "DELETED_COMMENT",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      commentId: comment.id,
      isDeleted: false
    });
  }

  public async onMergeRequestCommentReplyCreated(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment,
    reply: MergeRequestCommentReply
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "ADDED_COMMENT_REPLY",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      commentId: comment.id,
      commentReplyId: reply.id,
      isDeleted: false
    });
    // EMAIL
  }

  public async onMergeRequestCommentReplyUpdated(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment,
    reply: MergeRequestCommentReply
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "UPDATED_COMMENT_REPLY",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      commentId: comment.id,
      commentReplyId: reply.id,
      isDeleted: false
    });
  }

  public async onMergeRequestCommentReplyDeleted(
    queryRunner: QueryRunner,
    byUser: User,
    branchHead: string|undefined,
    mergeRequest: MergeRequest,
    comment: MergeRequestComment,
    reply: MergeRequestCommentReply
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "DELETED_COMMENT_REPLY",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtCreate: branchHead,
      commentId: comment.id,
      commentReplyId: reply.id,
      isDeleted: false
    });
  }
}
