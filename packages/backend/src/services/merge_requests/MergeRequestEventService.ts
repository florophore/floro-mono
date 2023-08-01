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
import { MergeRequestEvent } from "@floro/graphql-schemas/build/generated/main-graphql";

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

  public async fetchTimelineForMergeRequest(
    mergeRequestId: string
  ): Promise<MergeRequestEvent[]> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext
    );
    return await mergeRequestEventsContext.getAllForMergeRequestId(
      mergeRequestId
    );
  }

  public async onMergeRequestCreated(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
    });
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
      MergeRequestsContext,
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

    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
    );
    try {

      const event = await mergeRequestEventsContext.create({
        eventName: "BRANCH_UDPATED",
        mergeRequestId: mergeRequest.id,
        performedByUserId: byUser.id,
        branchHeadShaAtEvent: branch?.lastCommit ?? undefined,
      });
    } catch(e) {
      console.log("E", e);
    }
    // EMAIL all reviewers
  }

  public async onMergeRequestUpdated(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
    mergeRequest: MergeRequest,
    removedTitle: string,
    removedDescription: string,
  ): Promise<void> {
    const mergeRequestEventsContext = await this.contextFactory.createContext(
      MergeRequestEventsContext,
      queryRunner
    );
    await mergeRequestEventsContext.create({
      eventName: "UPDATED_MERGE_REQUEST_INFO",
      mergeRequestId: mergeRequest.id,
      performedByUserId: byUser.id,
      branchHeadShaAtEvent: branchHead,
      addedTitle: mergeRequest.title,
      addedDescription: mergeRequest.description,
      removedTitle,
      removedDescription
    });
  }

  public async onMergeRequestClosed(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
    });
  }

  public async onUpdatedMergeRequestReviwers(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
        branchHeadShaAtEvent: branchHead,
        reviewerRequestId: reviewerRequest.id,
        eventGroupingId: groupId,
      });
    }
    // EMAIL
  }

  public async onReviewStatusAdded(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      reviewStatusId: reviewStatus.id,
    });
    // EMAIL
  }

  public async onReviewStatusChanged(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      reviewStatusId: reviewStatus.id,
    });
    // EMAIL
  }

  public async onReviewStatusRemoved(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      reviewStatusId: reviewStatus.id,
    });
  }

  public async onMergeRequestCommentCreated(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      commentId: comment.id,
    });
    // EMAIL
  }

  public async onMergeRequestCommentUpdated(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      commentId: comment.id,
    });
  }

  public async onMergeRequestCommentDeleted(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      commentId: comment.id,
    });
  }

  public async onMergeRequestCommentReplyCreated(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      commentId: comment.id,
      commentReplyId: reply.id,
    });
    // EMAIL
  }

  public async onMergeRequestCommentReplyUpdated(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      commentId: comment.id,
      commentReplyId: reply.id,
    });
  }

  public async onMergeRequestCommentReplyDeleted(
    queryRunner: QueryRunner,
    byUser: User,
    baseBranchId: string | undefined,
    branchHead: string | undefined,
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
      branchHeadShaAtEvent: branchHead,
      commentId: comment.id,
      commentReplyId: reply.id,
    });
  }
}
