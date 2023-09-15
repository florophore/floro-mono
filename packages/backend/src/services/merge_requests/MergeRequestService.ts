import { injectable, inject, multiInject } from "inversify";
import { Job, Queue, Worker, QueueScheduler } from "bullmq";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import { QueryRunner } from "typeorm";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import MergeRequestCommentsContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentsContext";
import MergeRequestCommentRepliesContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentRepliesContext";
import CreateMergeRequestEventHandler from "./merge_request_events/CreateMergeRequestEventHandler";
import RepositoryDatasourceFactoryService from "../repositories/RepoDatasourceFactoryService";
import {
  ApplicationKVState,
  BranchRuleSettings,
  EMPTY_COMMIT_STATE,
  RemoteSettings,
  canAutoMergeCommitStates,
  getDivergenceOrigin,
  getMergeOriginSha,
} from "floro/dist/src/repo";
import { Branch } from "@floro/database/src/entities/Branch";
import { Branch as FloroBranch } from "floro/dist/src/repo";
import UpdateMergeRequestEventHandler from "./merge_request_events/UpdateMergeRequestEventHandler";
import { MergeRequest } from "@floro/database/src/entities/MergeRequest";
import CloseMergeRequestEventHandler from "./merge_request_events/CloseMergeRequestEventHandler";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import ReviewerRequestsContext from "@floro/database/src/contexts/merge_requests/ReviewerRequestsContext";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import ReviewStatusesContext from "@floro/database/src/contexts/merge_requests/ReviewStatusesContext";
import { ReviewerRequest } from "@floro/database/src/entities/ReviewerRequest";
import { v4 as uuidv4 } from "uuid";
import UpdatedMergeRequestReviewersEventHandler from "./merge_request_events/UpdatedMergeRequestReviewersEventHandler";
import ReviewStatusChangeEventHandler from "./merge_request_events/ReviewStatusChangeEventHandler";
import MergeRequestCommentEventHandler from "./merge_request_events/MergeRequestCommentEventHandler";
import MergeRequestCommentReplyEventHandler from "./merge_request_events/MergeRequestCommentReplyEventHandler";
import { MergeRequestComment } from "@floro/database/src/entities/MergeRequestComment";
import { MergeRequestCommentReply } from "@floro/database/src/entities/MergeRequestCommentReply";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";
import RepoDataService from "../repositories/RepoDataService";
import RedisClient from "@floro/redis/src/RedisClient";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { QueueService } from "../QueueService";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";

export interface CreateMergeRequestResponse {
  action:
    | "MERGE_REQUEST_CREATED"
    | "INVALID_PARAMS_ERROR"
    | "NO_BRANCH_ERROR"
    | "NO_BASE_BRANCH_ERROR"
    | "ALREADY_MERGED_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "MERGE_REQUEST_ALREADY_EXISTS_FOR_BRANCH"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdateMergeRequestResponse {
  action:
    | "MERGE_REQUEST_UPDATED"
    | "INVALID_PARAMS_ERROR"
    | "NO_BRANCH_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface CloseMergeRequestResponse {
  action:
    | "MERGE_REQUEST_CLOSED"
    | "INVALID_PARAMS_ERROR"
    | "NO_BRANCH_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdateMergeRequestReviewersResponse {
  action:
    | "UPDATE_MERGE_REQUEST_REVIEWERS_SUCCESS"
    | "INVALID_REVIEWER_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "REVIEWER_NOT_FOUND_ERROR"
    | "SELF_REVIEW_ERROR"
    | "NO_BRANCH_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdateMergeRequestReviewStatusResponse {
  action:
    | "REVIEW_STATUS_UPDATED"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_REVIEWER_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "REVIEWER_NOT_FOUND_ERROR"
    | "SELF_REVIEW_ERROR"
    | "NO_BRANCH_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface DeleteMergeRequestReviewStatusResponse {
  action:
    | "REVIEW_STATUS_DELETED"
    | "NO_REVIEW_STATUS_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface CreateMergeRequestCommentResponse {
  action:
    | "COMMENT_CREATED"
    | "INVALID_PARAMS_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "INVALID_COMMENTER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "INVALID_PLUGIN_COMMENT_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}
export interface UpdateMergeRequestCommentResponse {
  action:
    | "COMMENT_UPDATED"
    | "COMMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "INVALID_COMMENTER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface DeleteMergeRequestCommentResponse {
  action:
    | "COMMENT_DELETED"
    | "COMMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "INVALID_COMMENTER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface CreateMergeRequestCommentReplyResponse {
  action:
    | "COMMENT_REPLY_CREATED"
    | "COMMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "INVALID_COMMENTER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdateMergeRequestCommentReplyResponse {
  action:
    | "COMMENT_REPLY_UPDATED"
    | "COMMENT_REPLY_DOES_NOT_EXIST_ERROR"
    | "COMMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "INVALID_COMMENTER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface DeleteMergeRequestCommentReplyResponse {
  action:
    | "COMMENT_REPLY_DELETED"
    | "COMMENT_REPLY_DOES_NOT_EXIST_ERROR"
    | "COMMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "INVALID_COMMENTER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface MergeRequestPermissions {
  hasApproval: boolean;
  hasBlock: boolean;
  canEditInfo: boolean;
  canEditReviewers: boolean;
  canRemoveSelfFromReviewers: boolean;
  canReview: boolean;
  hasApproved: boolean;
  hasBlocked: boolean;
  allowedToMerge: boolean;
  canClose: boolean;
  requireReapprovalOnPushToMerge: boolean;
  requireApprovalToMerge: boolean
}

const REVIEWER_LIMIT = 5;
const MERGE_REQUEST_LIMIT = 10;

@injectable()
export default class MergeRequestService
  implements BranchPushHandler, QueueService
{
  public static QUEUE_NAME = "merge-request-push-queue";

  public queue!: Queue;
  public worker!: Worker;
  public pubsub!: RedisPubSub;
  public scheduler!: QueueScheduler;

  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoDataService!: RepoDataService;
  private repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;
  private createMergeRequestEventHandlers!: CreateMergeRequestEventHandler[];
  private updateMergeRequestEventHandlers!: UpdateMergeRequestEventHandler[];
  private closeMergeRequestEventHandlers!: CloseMergeRequestEventHandler[];
  private updatedMergeRequestReviewersEventHandlers!: UpdatedMergeRequestReviewersEventHandler[];
  private reviewStatusChangeEventHandlers!: ReviewStatusChangeEventHandler[];
  private mergeRequestCommentEventHandlers!: MergeRequestCommentEventHandler[];
  private mergeRequestCommentReplyEventHandlers!: MergeRequestCommentReplyEventHandler[];

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @multiInject("CreateMergeRequestEventHandler")
    createMergeRequestEventHandlers: CreateMergeRequestEventHandler[],
    @multiInject("UpdateMergeRequestEventHandler")
    updateMergeRequestEventHandlers: UpdateMergeRequestEventHandler[],
    @multiInject("CloseMergeRequestEventHandler")
    closeMergeRequestEventHandlers: CloseMergeRequestEventHandler[],
    @multiInject("UpdatedMergeRequestReviewersEventHandler")
    updatedMergeRequestReviewersEventHandlers: UpdatedMergeRequestReviewersEventHandler[],
    @multiInject("ReviewStatusChangeEventHandler")
    reviewStatusChangeEventHandlers: ReviewStatusChangeEventHandler[],
    @multiInject("MergeRequestCommentEventHandler")
    mergeRequestCommentEventHandlers: MergeRequestCommentEventHandler[],
    @multiInject("MergeRequestCommentReplyEventHandler")
    mergeRequestCommentReplyEventHandlers: MergeRequestCommentReplyEventHandler[]
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
    this.createMergeRequestEventHandlers = createMergeRequestEventHandlers;
    this.updateMergeRequestEventHandlers = updateMergeRequestEventHandlers;
    this.closeMergeRequestEventHandlers = closeMergeRequestEventHandlers;
    this.updatedMergeRequestReviewersEventHandlers =
      updatedMergeRequestReviewersEventHandlers;
    this.reviewStatusChangeEventHandlers = reviewStatusChangeEventHandlers;
    this.mergeRequestCommentEventHandlers = mergeRequestCommentEventHandlers;
    this.mergeRequestCommentReplyEventHandlers =
      mergeRequestCommentReplyEventHandlers;
  }

  public setRedisPubsub(pubsub: RedisPubSub): void {
    this.pubsub = pubsub;
  }

  public async getExistingMergeRequestByBranch(
    repositoryId: string,
    branchId: string
  ): Promise<MergeRequest | null> {
    const mergeRequestsContext = await this.contextFactory.createContext(
      MergeRequestsContext
    );
    const mergeRequest =
      await mergeRequestsContext.getOpenMergeRequestByBranchNameAndRepo(
        repositoryId,
        branchId
      );
    return mergeRequest;
  }

  public getMergeRequestPaginatedResult(
    mergeRequests: Array<MergeRequest>,
    id?: string | null,
    query?: string | null
  ): {
    id: string | null | undefined;
    lastId: string | null;
    nextId: string | null;
    mergeRequests: Array<MergeRequest>;
  } {
    let found = !id;
    id = !id ? mergeRequests?.[0]?.id : id;
    const out: Array<MergeRequest> = [];
    let i: number;
    let lastId: string | null = null;
    const isSearch = (query?.trim() ?? "") != "";
    const lowerCaseQuery = query?.trim()?.toLowerCase() ?? "";
    for (i = 0; i < mergeRequests?.length; ++i) {
      if (!isSearch) {
        if (!found && id && mergeRequests[i].id == id) {
          lastId = mergeRequests?.[i - MERGE_REQUEST_LIMIT]?.id ?? null;
          found = true;
        }
        if (found) {
          out.push(mergeRequests[i]);
        }
      } else {
        const userFullName =
          `${mergeRequests[i].openedByUser?.firstName} ${mergeRequests[i].user?.lastName}`.toLowerCase();
        const username = `@${mergeRequests[
          i
        ].openedByUser?.username?.toLowerCase()}`;
        if (lowerCaseQuery) {
          if (
            mergeRequests[i]?.title?.toLowerCase()?.indexOf(lowerCaseQuery) !=
            -1
          ) {
            out.push(mergeRequests[i]);
          } else if (
            mergeRequests[i]?.description
              ?.toLowerCase()
              ?.indexOf(lowerCaseQuery) != -1
          ) {
            out.push(mergeRequests[i]);
          } else if (userFullName?.indexOf(lowerCaseQuery) != -1) {
            out.push(mergeRequests[i]);
          } else if (
            mergeRequests[i].openedByUser?.username
              ?.toLowerCase()
              ?.indexOf(lowerCaseQuery) != -1
          ) {
            out.push(mergeRequests[i]);
          } else if (
            username?.toLocaleLowerCase()?.indexOf(lowerCaseQuery) != -1
          ) {
            out.push(mergeRequests[i]);
          } else if (
            mergeRequests[i].mergeRequestCount.toString() == lowerCaseQuery
          ) {
            out.push(mergeRequests[i]);
          }
        }
      }

      if (out.length == MERGE_REQUEST_LIMIT) {
        if (isSearch) {
          return {
            id: null,
            lastId: null,
            nextId: null,
            mergeRequests: out,
          };
        }
        return {
          id,
          lastId,
          nextId: mergeRequests?.[i + 1]?.id,
          mergeRequests: out,
        };
      }
    }
    return {
      id: isSearch ? null : id,
      lastId: isSearch ? null : lastId,
      nextId: null,
      mergeRequests: out,
    };
  }

  public async getApprovalStatus(
    mergeRequest: MergeRequest,
    repository: Repository,
    queryRunner?: QueryRunner
  ): Promise<'pending'|'approved'|'blocked'> {

    const branches = await this.repoDataService.getBranches(repository.id, queryRunner);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);

    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;
    const hasBlock = await this.hasBlock(
      mergeRequest,
      repository,
      branch,
      baseBranch,
      queryRunner
    );
    if (hasBlock) {
      return 'blocked';
    }
    const hasApproval = await this.hasApproval(
      mergeRequest,
      repository,
      branch,
      baseBranch,
      queryRunner
    );
    if (hasApproval) {
      return 'approved';
    }
    return 'pending';
  }

  public async getMergeRequestPermissions(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    queryRunner?: QueryRunner
  ): Promise<MergeRequestPermissions> {
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );
    const existingReviewerIds = new Set(
      openReviewerRequests?.map((r) => r.requestedReviewerUserId)
    );

    const canReview = !!user?.id && existingReviewerIds.has(user?.id);

    const branches = await this.repoDataService.getBranches(repository.id, queryRunner);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);

    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;

    const branchRuleSetting: BranchRuleSettings | undefined | null = !!baseBranch
      ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
      : null;

    const canEditReviewers =
      mergeRequest.isOpen &&
      ((branchRuleSetting?.canApproveMergeRequests ?? userRepoSettings?.canPushBranches ?? false) ||
      (repository?.repoType == "user_repo"
        ? !!user?.id && user?.id == repository?.userId
        : mergeRequest?.openedByUserId == user?.id));
    const canRemoveSelfFromReviewers =
      !!user?.id && existingReviewerIds.has(user?.id);

    const canClose = await this.getCanClose(
      mergeRequest,
      repository,
      user,
      queryRunner
    );

    const allowedToMerge = await this.getAllowedToMerge(
      mergeRequest,
      repository,
      user,
      baseBranch,
      branchRuleSetting,
      userRepoSettings
    );

    const hasApproval = await this.hasApproval(
      mergeRequest,
      repository,
      branch,
      baseBranch,
      queryRunner
    );

    const hasBlock = await this.hasBlock(
      mergeRequest,
      repository,
      branch,
      baseBranch,
      queryRunner
    );

    const canEditInfo =
      mergeRequest?.openedByUserId == user?.id ||
      (userRepoSettings?.canPushBranches ?? false);

    const hasApproved = await this.hasApproved(
      mergeRequest,
      repository,
      user,
      branch,
      baseBranch,
      queryRunner
    );
    const hasBlocked = await this.hasBlocked(
      mergeRequest,
      repository,
      user,
      branch,
      baseBranch,
      queryRunner
    );

    return {
      canEditInfo,
      hasApproval,
      hasBlock,
      canEditReviewers,
      canRemoveSelfFromReviewers,
      canReview,
      allowedToMerge,
      hasApproved,
      hasBlocked,
      canClose,
      requireReapprovalOnPushToMerge: branchRuleSetting?.requireReapprovalOnPushToMerge ?? false,
      requireApprovalToMerge: branchRuleSetting?.requiresApprovalToMerge ?? false
    };
  }

  public async getCanClose(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    if (!mergeRequest.isOpen) {
      return false;
    }
    if (!user?.id) {
      return false;
    }
    if (repository.repoType == "user_repo") {
      if (repository.isPrivate) {
        return repository.userId == user?.id;
      }
      return (
        repository?.userId == user?.id ||
        mergeRequest?.openedByUserId == user?.id
      );
    }
    const organizationsMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext,
      queryRunner
    );

    const mrUserMembership =
      await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        mergeRequest.openedByUserId
      );
    const membership = await organizationsMembersContext.getByOrgIdAndUserId(
      repository.organizationId,
      user.id
    );

    const organizationMemberRolesContext =
      await this.contextFactory.createContext(OrganizationMemberRolesContext);
    const roles =
      membership?.membershipState == "active"
        ? await organizationMemberRolesContext.getRolesByMemberId(
            membership?.id
          )
        : [];
    const isAdmin =
      (repository.repoType == "org_repo" &&
        !!roles.find((r) => r.presetCode == "admin")) ||
      (repository.repoType == "user_repo" && repository.userId == user.id);
    if (isAdmin) {
      return true;
    }

    if (mrUserMembership?.membershipState != "active") {
      if (!repository?.isPrivate && user?.id == mergeRequest?.userId) {
        return true;
      }
      if (membership?.membershipState == "active") {
        return true;
      }
    }
    if (membership?.membershipState == "active") {
      return user?.id == mergeRequest?.openedByUserId;
    }

    return false;
  }

  public async getAllowedToMerge(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    baseBranch?: FloroBranch | null,
    branchRuleSetting?: BranchRuleSettings | null,
    userRepoSettings?: RemoteSettings | null,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    if (!mergeRequest.isOpen) {
      return false;
    }
    if (!userRepoSettings?.canPushBranches) {
      return false;
    }
    if (!baseBranch) {
      return false;
    }
    if (repository.repoType == "org_repo") {
      const organizationsMembersContext = await this.contextFactory.createContext(
        OrganizationMembersContext,
        queryRunner
      );
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
      const organizationMemberRolesContext =
        await this.contextFactory.createContext(OrganizationMemberRolesContext);
      const roles =
        membership?.membershipState == "active"
          ? await organizationMemberRolesContext.getRolesByMemberId(
              membership?.id
            )
          : [];
      const isAdmin =
        repository.repoType == "org_repo" &&
        !!roles.find((r) => r.presetCode == "admin");
      if (isAdmin) {
        return true;
      }
    }

    if (repository.repoType == "user_repo") {
      return repository.userId == user?.id;
    }
    if (branchRuleSetting) {
      return branchRuleSetting?.canMergeWithApproval ?? false;
    }

    return await this.getCanClose(mergeRequest, repository, user, queryRunner);
  }

  public async hasApproved(
    mergeRequest: MergeRequest,
    repository: Repository,
    user?: User,
    branch?: FloroBranch | null,
    baseBranch?: FloroBranch | null,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    if (!user?.id) {
      return false;
    }
    const reviewStatusesContext = await this.contextFactory.createContext(
      ReviewStatusesContext,
      queryRunner
    );
    if (baseBranch?.id) {
      const protectedBranchRulesContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesContext,
          queryRunner
        );

      const branchBrule =
        await protectedBranchRulesContext.getByRepoAndBranchId(
          repository.id,
          baseBranch?.id
        );
      if (branchBrule) {
        if (branchBrule?.requireApprovalToMerge) {
          const reviewStatuses =
            await reviewStatusesContext.getMergeRequestReviewStatuses(
              mergeRequest.id
            );
          if (branchBrule?.requireReapprovalOnPushToMerge) {
            const currentReviews = reviewStatuses?.filter((rs) => {
              return (
                rs.branchHeadShaAtUpdate == branch?.lastCommit &&
                rs?.baseBranchIdAtCreate == branch?.baseBranchId
              );
            });
            if (currentReviews.length == 0) {
              return false;
            }
            return currentReviews?.reduce((hasApproval, reviewStatus) => {
              if (!hasApproval) {
                return false;
              }
              return reviewStatus.approvalStatus == "approved" && reviewStatus.userId == user.id;
            }, true);
          }
          if (reviewStatuses.length == 0) {
            return false;
          }
          const currentReviews = reviewStatuses?.filter((rs) => {
            return rs?.baseBranchIdAtCreate == branch?.baseBranchId;
          });
          return currentReviews?.reduce((hasApproval, reviewStatus) => {
            if (!hasApproval) {
              return false;
            }
            return reviewStatus.approvalStatus == "approved" && reviewStatus.userId == user.id;
          }, true);
        }
      }
    }
    return false;
  }
  public async hasBlocked(
    mergeRequest: MergeRequest,
    repository: Repository,
    user?: User,
    branch?: FloroBranch | null,
    baseBranch?: FloroBranch | null,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    if (!user?.id) {
      return false;
    }
    const reviewStatusesContext = await this.contextFactory.createContext(
      ReviewStatusesContext,
      queryRunner
    );
    if (baseBranch?.id) {
      const protectedBranchRulesContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesContext,
          queryRunner
        );

      const branchBrule =
        await protectedBranchRulesContext.getByRepoAndBranchId(
          repository.id,
          baseBranch?.id
        );
      if (branchBrule) {
        if (branchBrule?.requireApprovalToMerge) {
          const reviewStatuses =
            await reviewStatusesContext.getMergeRequestReviewStatuses(
              mergeRequest.id
            );
          if (branchBrule?.requireReapprovalOnPushToMerge) {
            const currentReviews = reviewStatuses?.filter((rs) => {
              return (
                rs.branchHeadShaAtUpdate == branch?.lastCommit &&
                rs?.baseBranchIdAtCreate == branch?.baseBranchId
              );
            });
            if (currentReviews.length == 0) {
              return false;
            }
            return currentReviews?.reduce((hasApproval, reviewStatus) => {
              if (!hasApproval) {
                return false;
              }
              return reviewStatus.approvalStatus == "blocked" && reviewStatus.userId == user.id;
            }, true);
          }
          if (reviewStatuses.length == 0) {
            return false;
          }
          const currentReviews = reviewStatuses?.filter((rs) => {
            return rs?.baseBranchIdAtCreate == branch?.baseBranchId;
          });
          return currentReviews?.reduce((hasApproval, reviewStatus) => {
            if (!hasApproval) {
              return false;
            }
            return reviewStatus.approvalStatus == "blocked" && reviewStatus.userId == user.id;
          }, true);
        }
      }
    }
    return false;
  }

  public async hasBlock(
    mergeRequest: MergeRequest,
    repository: Repository,
    branch?: FloroBranch | null,
    baseBranch?: FloroBranch | null,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    const reviewStatusesContext = await this.contextFactory.createContext(
      ReviewStatusesContext,
      queryRunner
    );
    if (baseBranch?.id) {
      const protectedBranchRulesContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesContext,
          queryRunner
        );

      const branchBrule =
        await protectedBranchRulesContext.getByRepoAndBranchId(
          repository.id,
          baseBranch?.id
        );
      if (branchBrule) {
        if (branchBrule?.requireApprovalToMerge) {
          const reviewStatuses =
            await reviewStatusesContext.getMergeRequestReviewStatuses(
              mergeRequest.id
            );
          if (branchBrule?.requireReapprovalOnPushToMerge) {
            const currentReviews = reviewStatuses?.filter((rs) => {
              return (
                rs.branchHeadShaAtUpdate == branch?.lastCommit &&
                rs?.baseBranchIdAtCreate == branch?.baseBranchId
              );
            });
            if (currentReviews.length == 0) {
              return false;
            }
            return currentReviews?.reduce((hasApproval, reviewStatus) => {
              if (!hasApproval) {
                return false;
              }
              return reviewStatus.approvalStatus == "blocked";
            }, true);
          }
          if (reviewStatuses.length == 0) {
            return false;
          }
          const currentReviews = reviewStatuses?.filter((rs) => {
            return rs?.baseBranchIdAtCreate == branch?.baseBranchId;
          });
          return currentReviews?.reduce((hasApproval, reviewStatus) => {
            if (!hasApproval) {
              return false;
            }
            return reviewStatus.approvalStatus == "blocked";
          }, true);
        }
      }
    }
    return false;
  }

  public async hasApproval(
    mergeRequest: MergeRequest,
    repository: Repository,
    branch?: FloroBranch | null,
    baseBranch?: FloroBranch | null,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    const reviewStatusesContext = await this.contextFactory.createContext(
      ReviewStatusesContext,
      queryRunner
    );
    if (baseBranch?.id) {
      const protectedBranchRulesContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesContext,
          queryRunner
        );

      const branchBrule =
        await protectedBranchRulesContext.getByRepoAndBranchId(
          repository.id,
          baseBranch?.id
        );
      if (branchBrule) {
        if (branchBrule?.requireApprovalToMerge) {
          const reviewStatuses =
            await reviewStatusesContext.getMergeRequestReviewStatuses(
              mergeRequest.id
            );
          if (branchBrule?.requireReapprovalOnPushToMerge) {
            const currentReviews = reviewStatuses?.filter((rs) => {
              return (
                rs.branchHeadShaAtUpdate == branch?.lastCommit &&
                rs?.baseBranchIdAtCreate == branch?.baseBranchId
              );
            });
            if (currentReviews.length == 0) {
              return false;
            }
            return currentReviews?.reduce((hasApproval, reviewStatus) => {
              if (!hasApproval) {
                return false;
              }
              return reviewStatus.approvalStatus == "approved";
            }, true);
          }
          if (reviewStatuses.length == 0) {
            return false;
          }
          const currentReviews = reviewStatuses?.filter((rs) => {
            return rs?.baseBranchIdAtCreate == branch?.baseBranchId;
          });
          return currentReviews?.reduce((hasApproval, reviewStatus) => {
            if (!hasApproval) {
              return false;
            }
            return reviewStatus.approvalStatus == "approved";
          }, true);
        }
      }
    }
    return false;
  }

  public async createMergeRequest(
    repository: Repository,
    branchId: string,
    user: User,
    title: string,
    description: string
  ): Promise<CreateMergeRequestResponse> {
    if ((title ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing title",
        },
      };
    }
    if ((description ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing description",
        },
      };
    }
    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == branchId);
    if (!branch) {
      return {
        action: "NO_BRANCH_ERROR",
        error: {
          type: "NO_BRANCH_ERROR",
          message: "Missing branch",
        },
      };
    }
    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;

    const dbBaseBranch = branches?.find((b) => !!baseBranch && b.id == baseBranch?.id);
    if (!dbBaseBranch || !baseBranch) {
      return {
        action: "NO_BASE_BRANCH_ERROR",
        error: {
          type: "NO_BASE_BRANCH_ERROR",
          message: "Missing base branch",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
      ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
      : null;
    const canCreateMergeRequest = branchRule?.canCreateMergeRequests ?? true;
    if (!canCreateMergeRequest) {
      return {
        action: "INVALID_PERMISSIONS_ERROR",
        error: {
          type: "INVALID_PERMISSIONS_ERROR",
          message: "Invalid permissions",
        },
      };
    }
    const datasource = await this.getMergeRequestDataSourceForBaseBranch(
      repository,
      branch,
      baseBranch
    );
    const divergenceOrigin = await getDivergenceOrigin(
      datasource,
      repository.id,
      baseBranch?.lastCommit ?? undefined,
      branch?.lastCommit ?? undefined
    );
    const divergenceSha: string = getMergeOriginSha(divergenceOrigin) as string;
    const isMerged =
      divergenceOrigin?.rebaseShas?.length == 0 &&
      baseBranch?.lastCommit != null && !!branch?.lastCommit &&
      (divergenceOrigin?.intoLastCommonAncestor == branch?.lastCommit ||
        divergenceOrigin?.trueOrigin == baseBranch?.lastCommit);
    if (isMerged) {
      return {
        action: "ALREADY_MERGED_ERROR",
        error: {
          type: "ALREADY_MERGED_ERROR",
          message: "Already merged",
        },
      };
    }
    let isConflictFree = isMerged || divergenceSha === baseBranch?.lastCommit;
    if (!isConflictFree) {
      const divergenceState = (await datasource.readCommitApplicationState?.(
        repository.id,
        divergenceSha as string
      )) as ApplicationKVState;
      const branchState = (await datasource.readCommitApplicationState?.(
        repository.id,
        branch?.lastCommit as string
      )) as ApplicationKVState;
      const baseBranchState = (await datasource.readCommitApplicationState?.(
        repository.id,
        baseBranch?.lastCommit as string
      )) as ApplicationKVState;
      const canAutoMerge = await canAutoMergeCommitStates(
        datasource,
        baseBranchState,
        branchState,
        divergenceState
      );
      if (canAutoMerge) {
        isConflictFree = true;
      }
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestsContext = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );
      const branchHasOpenRequest =
        await mergeRequestsContext.repoHasOpenRequestOnBranch(
          repository.id,
          branchId
        );
      if (branchHasOpenRequest) {
        await queryRunner.rollbackTransaction();
        return {
          action: "MERGE_REQUEST_ALREADY_EXISTS_FOR_BRANCH",
          error: {
            type: "MERGE_REQUEST_ALREADY_EXISTS_FOR_BRANCH",
            message: "Branch already has merge request",
          },
        };
      }
      const count = await mergeRequestsContext.countMergeRequestsByRepo(
        repository.id
      );
      const mergeRequest = await mergeRequestsContext.create({
        title,
        description,
        isOpen: true,
        isMerged,
        isConflictFree,
        divergenceSha,
        branchHeadShaAtCreate: branch?.lastCommit as string,
        branchId,
        dbBranchId: branch?.dbId,
        dbBaseBranchId: dbBaseBranch?.dbId,
        repositoryId: repository?.id,
        organizationId: repository?.organizationId,
        userId: repository?.userId,
        openedByUserId: user?.id,
        mergeRequestCount: count + 1,
        isDeleted: false,
      });
      if (!mergeRequest) {
        await queryRunner.rollbackTransaction();
        // ERROR
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Merge Request does not exist",
          },
        };
      }
      for (const createMergeRequestEventHandler of this
        .createMergeRequestEventHandlers) {
        await createMergeRequestEventHandler.onMergeRequestCreated(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest
        );
      }

      // DONE
      await queryRunner.commitTransaction();
      return {
        action: "MERGE_REQUEST_CREATED",
        mergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_MERGE_REQUEST_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async updateMergeRequestInfo(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    title: string,
    description: string
  ): Promise<UpdateMergeRequestResponse> {
    if ((title ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing title",
        },
      };
    }
    if ((description ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing description",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    if (!branch) {
      return {
        action: "NO_BRANCH_ERROR",
        error: {
          type: "NO_BRANCH_ERROR",
          message: "Missing branch",
        },
      };
    }
    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;
    const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
      ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
      : null;
    const canCreateMergeRequest = branchRule?.canCreateMergeRequests ?? true;
    if (!canCreateMergeRequest) {
      return {
        action: "INVALID_PERMISSIONS_ERROR",
        error: {
          type: "INVALID_PERMISSIONS_ERROR",
          message: "Invalid permissions",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestsContext = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );
      const updatedMergeRequest = await mergeRequestsContext.updateMergeRequest(
        mergeRequest,
        {
          title,
          description,
        }
      );
      if (!updatedMergeRequest) {
        await queryRunner.rollbackTransaction();
        // ERROR
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Merge Request does not exist",
          },
        };
      }
      for (const updateMergeRequestEventHandler of this
        .updateMergeRequestEventHandlers) {
        await updateMergeRequestEventHandler.onMergeRequestUpdated(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          updatedMergeRequest,
          mergeRequest.title,
          mergeRequest.description
        );
      }

      // DONE
      await queryRunner.commitTransaction();
      return {
        action: "MERGE_REQUEST_UPDATED",
        mergeRequest: updatedMergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPDATE_MERGE_REQUEST_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async closeMergeRequest(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User
  ): Promise<CloseMergeRequestResponse> {
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    if (!branch) {
      return {
        action: "NO_BRANCH_ERROR",
        error: {
          type: "NO_BRANCH_ERROR",
          message: "Missing branch",
        },
      };
    }
    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;
    const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
      ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
      : null;
    const canCreateMergeRequest = branchRule?.canCreateMergeRequests ?? true;
    if (!canCreateMergeRequest) {
      return {
        action: "INVALID_PERMISSIONS_ERROR",
        error: {
          type: "INVALID_PERMISSIONS_ERROR",
          message: "Invalid permissions",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestsContext = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );
      const updatedMergeRequest = await mergeRequestsContext.updateMergeRequest(
        mergeRequest,
        {
          isOpen: false,
          branchHeadShaAtClose: branch?.lastCommit ?? undefined,
          wasClosedWithoutMerging: true
        }
      );
      if (!mergeRequest) {
        await queryRunner.rollbackTransaction();
        // ERROR
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Merge Request does not exist",
          },
        };
      }
      for (const closeMergeRequestEventHandler of this
        .closeMergeRequestEventHandlers) {
        await closeMergeRequestEventHandler.onMergeRequestClosed(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          updatedMergeRequest
        );
      }

      // DONE
      await queryRunner.commitTransaction();
      return {
        action: "MERGE_REQUEST_CLOSED",
        mergeRequest: updatedMergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CLOSE_MERGE_REQUEST_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  // need interface here
  public async updateMergeRequestReviewers(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    requestedReviewerIds: Array<string>
  ): Promise<UpdateMergeRequestReviewersResponse> {
    if (!mergeRequest.isOpen) {
      return {
        action: "MERGE_REQUEST_CLOSED_ERROR",
        error: {
          type: "MERGE_REQUEST_CLOSED_ERROR",
          message: "Merge Request Closed Already",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    if (!branch) {
      return {
        action: "NO_BRANCH_ERROR",
        error: {
          type: "NO_BRANCH_ERROR",
          message: "Missing branch",
        },
      };
    }
    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;
    const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
      ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
      : null;
    const canCreateMergeRequest = branchRule?.canCreateMergeRequests ?? true;
    if (!canCreateMergeRequest) {
      return {
        action: "INVALID_PERMISSIONS_ERROR",
        error: {
          type: "INVALID_PERMISSIONS_ERROR",
          message: "Invalid permissions",
        },
      };
    }
    const reviewerUsers: Array<User> = [];
    const seenReviewerIDs = new Set<string>([]);
    const usersContext = await this.contextFactory.createContext(UsersContext);
    for (const reviewerId of requestedReviewerIds) {
      if (!reviewerId) {
        return {
          action: "REVIEWER_NOT_FOUND_ERROR",
          error: {
            type: "REVIEWER_NOT_FOUND_ERROR",
            message: "Reviewer not found.",
          },
        };
      }
      if (seenReviewerIDs.has(reviewerId)) {
        continue;
      }
      const reviewerUser = await usersContext.getById(reviewerId);
      if (!reviewerUser) {
        return {
          action: "REVIEWER_NOT_FOUND_ERROR",
          error: {
            type: "REVIEWER_NOT_FOUND_ERROR",
            message: "Reviewer not found.",
          },
        };
      }
      if (mergeRequest.openedByUserId == reviewerUser?.id) {
        return {
          action: "SELF_REVIEW_ERROR",
          error: {
            type: "SELF_REVIEW_ERROR",
            message: "Reviewer cannot be self.",
          },
        };
      }
      const userSettings = await this.repoDataService.fetchRepoSettingsForUser(
        mergeRequest.repositoryId,
        reviewerUser
      );
      const canApprove =
        userSettings?.branchRules.find(
          (b) => baseBranch && b.branchId == baseBranch.id
        )?.canApproveMergeRequests ??
        userSettings?.canPushBranches ??
        false;
      if (!canApprove) {
        return {
          action: "INVALID_REVIEWER_ERROR",
          error: {
            type: "INVALID_REVIEWER_ERROR",
            message: "Invalid Reviewer",
          },
        };
      }
      reviewerUsers.push(reviewerUser);
      seenReviewerIDs.add(reviewerId);
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const reviewerRequestsContext = await this.contextFactory.createContext(
        ReviewerRequestsContext,
        queryRunner
      );
      const openReviewerRequests =
        await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
          mergeRequest.id
        );
      const existingReviewerIds = openReviewerRequests?.map(
        (r) => r.requestedReviewerUserId
      );
      const reviewerUserIds = reviewerUsers?.map((r) => r.id);
      const addedReviewerIds: Array<string> = [];
      const removedReviewerIds: Array<string> = [];
      for (const reviewerId of reviewerUserIds) {
        if (!existingReviewerIds.includes(reviewerId)) {
          addedReviewerIds.push(reviewerId);
        }
      }

      for (const reviewerId of existingReviewerIds) {
        if (!reviewerUserIds.includes(reviewerId)) {
          removedReviewerIds.push(reviewerId);
        }
      }
      const addedUsers: Array<User> = [];
      const removedUsers: Array<User> = [];
      const reviewerRequests: Array<ReviewerRequest> = [];

      for (const removedUserId of removedReviewerIds) {
        const reviewerRequest = openReviewerRequests?.find(
          (r) => r.requestedReviewerUserId == removedUserId
        );
        if (!reviewerRequest || !reviewerRequest?.requestedReviewerUser) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "INVALID_REMOVE_REVIEW_REQUEST_ERROR",
              message: "Failed to find removed review request",
            },
          };
        }
        removedUsers.push(reviewerRequest.requestedReviewerUser);
        await reviewerRequestsContext.updateReviewerRequest(reviewerRequest, {
          isDeleted: true,
        });
      }

      for (const addedUserId of addedReviewerIds) {
        const addedUser = reviewerUsers.find((u) => u.id == addedUserId);
        if (!addedUser) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "INVALID_ADD_REVIEW_REQUEST_ERROR",
              message: "Failed to find added user for review request",
            },
          };
        }
        const addedReviewerRequest = await reviewerRequestsContext.create({
          isDeleted: false,
          requestedByUserId: user.id,
          requestedReviewerUserId: addedUserId,
          mergeRequestId: mergeRequest.id,
        });
        if (!addedReviewerRequest) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "INVALID_ADD_REVIEW_REQUEST_ERROR",
              message: "Failed to find added user for review request",
            },
          };
        }
        reviewerRequests.push(addedReviewerRequest);
        addedUsers.push(addedUser);
      }
      const groupId = uuidv4();
      for (const updatedMergeRequestReviewersEventHandler of this
        .updatedMergeRequestReviewersEventHandlers) {
        await updatedMergeRequestReviewersEventHandler.onUpdatedMergeRequestReviwers(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          reviewerRequests,
          addedUsers,
          groupId
        );
      }
      const mergeRequestsContext = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );
      const approvalStatus = await this.getApprovalStatus(mergeRequest, repository, queryRunner);
      const updatedMergeRequest = await mergeRequestsContext.updateMergeRequest(mergeRequest, {
        approvalStatus
      });
      await queryRunner.commitTransaction();
      return {
        action: "UPDATE_MERGE_REQUEST_REVIEWERS_SUCCESS",
        mergeRequest: updatedMergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPDATE_REVIEWERS_REQUEST_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async updateMergeRequestReviewStatus(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    approvalStatus: "approved" | "requested_changes" | "blocked"
  ): Promise<UpdateMergeRequestReviewStatusResponse> {
    if (!mergeRequest.isOpen) {
      return {
        action: "MERGE_REQUEST_CLOSED_ERROR",
        error: {
          type: "MERGE_REQUEST_CLOSED_ERROR",
          message: "Merge Request Closed Already",
        },
      };
    }
    const possibleStatuses = new Set([
      "approved",
      "requested_changes",
      "blocked",
    ]);
    if (!possibleStatuses.has(approvalStatus ?? "")) {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    if (!branch) {
      return {
        action: "NO_BRANCH_ERROR",
        error: {
          type: "NO_BRANCH_ERROR",
          message: "Missing branch",
        },
      };
    }
    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;
    const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
      ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
      : null;
    const canApproveMergeRequests = branchRule?.canApproveMergeRequests ?? true;
    if (!canApproveMergeRequests) {
      return {
        action: "INVALID_REVIEWER_ERROR",
        error: {
          type: "INVALID_REVIEWER_ERROR",
          message: "Invalid Reviewer",
        },
      };
    }
    if (mergeRequest.openedByUserId == user?.id) {
      return {
        action: "SELF_REVIEW_ERROR",
        error: {
          type: "SELF_REVIEW_ERROR",
          message: "Reviewer cannot be self.",
        },
      };
    }

    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const reviewerRequestsContext = await this.contextFactory.createContext(
        ReviewerRequestsContext,
        queryRunner
      );
      const openReviewerRequests =
        await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
          mergeRequest.id
        );
      const existingReviewerIds = openReviewerRequests?.map(
        (r) => r.requestedReviewerUserId
      );
      if (!existingReviewerIds.includes(user.id)) {
        await reviewerRequestsContext.create({
          isDeleted: false,
          requestedByUserId: user.id,
          requestedReviewerUserId: user.id,
          mergeRequestId: mergeRequest.id,
        });
      }
      // LOOK UP REVIEW STATUS by reviwer userId and mergeRequestId
      const reviewStatusesContext = await this.contextFactory.createContext(
        ReviewStatusesContext,
        queryRunner
      );
      const hasReviewStatusForMergeRequest =
        await reviewStatusesContext.hasUserReviewStatusForMergeRequest(
          mergeRequest.id,
          user.id
        );
      if (hasReviewStatusForMergeRequest) {
        const reviewStatus =
          await reviewStatusesContext.getByMergeRequestIdAndUserId(
            mergeRequest.id,
            user.id
          );
        if (!reviewStatus) {
          await queryRunner.rollbackTransaction();
          // ERROR
          return {
            action: "LOG_ERROR",
            error: {
              type: "UNKNOWN_ERROR",
              message: "Review status does not exist",
            },
          };
        }
        const updatedReviewStatus =
          await reviewStatusesContext.updateReviewStatus(reviewStatus, {
            approvalStatus,
            branchHeadShaAtUpdate: branch.lastCommit ?? undefined,
          });
        // emit update event here
        for (const reviewStatusChangeEventHandler of this
          .reviewStatusChangeEventHandlers) {
          await reviewStatusChangeEventHandler.onReviewStatusChanged(
            queryRunner,
            user,
            branch?.baseBranchId ?? undefined,
            branch?.lastCommit ?? undefined,
            mergeRequest,
            updatedReviewStatus
          );
        }
        await queryRunner.commitTransaction();
        return {
          action: "REVIEW_STATUS_UPDATED",
          mergeRequest: mergeRequest,
        };
      } else {
        // create case
        const reviewStatus = await reviewStatusesContext.create({
          approvalStatus,
          baseBranchIdAtCreate: branch.baseBranchId ?? undefined,
          branchHeadShaAtUpdate: branch.lastCommit ?? undefined,
          isDeleted: false,
          mergeRequestId: mergeRequest.id,
          userId: user.id,
        });
        // emit create event here
        for (const reviewStatusChangeEventHandler of this
          .reviewStatusChangeEventHandlers) {
          await reviewStatusChangeEventHandler.onReviewStatusAdded(
            queryRunner,
            user,
            branch?.baseBranchId ?? undefined,
            branch?.lastCommit ?? undefined,
            mergeRequest,
            reviewStatus
          );
        }

        const mergeRequestsContext = await this.contextFactory.createContext(
          MergeRequestsContext,
          queryRunner
        );
        const mrApprovalStatus = await this.getApprovalStatus(mergeRequest, repository, queryRunner);
        const updatedMergeRequest = await mergeRequestsContext.updateMergeRequest(mergeRequest, {
          approvalStatus: mrApprovalStatus
        });
        await queryRunner.commitTransaction();
        return {
          action: "REVIEW_STATUS_UPDATED",
          mergeRequest: updatedMergeRequest,
        };
      }
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_REVIEW_STATUS_UPDATE_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async deleteMergeRequestReviewStatus(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User
  ): Promise<DeleteMergeRequestReviewStatusResponse> {
    if (!mergeRequest.isOpen) {
      return {
        action: "MERGE_REQUEST_CLOSED_ERROR",
        error: {
          type: "MERGE_REQUEST_CLOSED_ERROR",
          message: "Merge Request Closed Already",
        },
      };
    }
    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      // LOOK UP REVIEW STATUS by reviwer userId and mergeRequestId
      const reviewStatusesContext = await this.contextFactory.createContext(
        ReviewStatusesContext,
        queryRunner
      );

      const reviewStatus =
        await reviewStatusesContext.getByMergeRequestIdAndUserId(
          mergeRequest.id,
          user.id
        );
      if (!reviewStatus) {
        await queryRunner.rollbackTransaction();
        return {
          action: "NO_REVIEW_STATUS_ERROR",
          error: {
            type: "NO_REVIEW_STATUS_ERROR",
            message: "Review status not found",
          },
        };
      }

      const deletedReviewStatus =
        await reviewStatusesContext.updateReviewStatus(reviewStatus, {
          isDeleted: true,
        });
      for (const reviewStatusChangeEventHandler of this
        .reviewStatusChangeEventHandlers) {
        await reviewStatusChangeEventHandler.onReviewStatusRemoved(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          deletedReviewStatus
        );
      }

      const mergeRequestsContext = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );
      const approvalStatus = await this.getApprovalStatus(mergeRequest, repository, queryRunner);
      const updatedMergeRequest = await mergeRequestsContext.updateMergeRequest(mergeRequest, {
        approvalStatus
      });

      await queryRunner.commitTransaction();
      return {
        action: "REVIEW_STATUS_DELETED",
        mergeRequest: updatedMergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_DELETE_REVIEW_STATUS_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public startQueueWorker(redisClient: RedisClient): void {
    this.queue = new Queue(MergeRequestService.QUEUE_NAME, {
      connection: redisClient.redis,
    });

    this.scheduler = new QueueScheduler(MergeRequestService.QUEUE_NAME);
    this.worker = new Worker(
      MergeRequestService.QUEUE_NAME,
      async (args: Job<{ jobId: string; mergeRequest: MergeRequest }>) => {
          const queueMergeRequest: MergeRequest = args.data.mergeRequest;
          if (!queueMergeRequest) {
            return;
          }
          if (!queueMergeRequest.isOpen) {
            return;
          }
          const branches = await this.repoDataService.getBranches(
            queueMergeRequest.repositoryId
          );
          const mergeRequestsContext = await this.contextFactory.createContext(
            MergeRequestsContext
          );
          const mergeRequest = await mergeRequestsContext.getById(
            queueMergeRequest.id
          );
          if (
            !mergeRequest ||
            !mergeRequest?.branchId ||
            !mergeRequest?.isOpen
          ) {
            return;
          }
          const repository = await this.repoDataService.getRepository(
            mergeRequest.repositoryId
          );
          if (!repository) {
            return;
          }

          const floroBranch: FloroBranch | undefined | null =
            !!mergeRequest?.branchId
              ? branches?.find((b) => b.id == mergeRequest?.branchId)
              : null;
          if (!floroBranch) {
            return;
          }
          const baseBranch: FloroBranch | undefined | null =
            !!floroBranch?.baseBranchId
              ? branches?.find((b) => b.id == floroBranch?.baseBranchId)
              : null;
          if (!baseBranch) {
            return;
          }

          const datasource = await this.getMergeRequestDataSourceForBaseBranch(
            repository,
            floroBranch,
            baseBranch
          );
          const divergenceOrigin = await getDivergenceOrigin(
            datasource,
            repository.id,
            baseBranch?.lastCommit ?? undefined,
            floroBranch?.lastCommit ?? undefined
          );
          const divergenceSha: string = getMergeOriginSha(
            divergenceOrigin
          ) as string;

        const isMerged =
          divergenceOrigin?.rebaseShas?.length == 0 &&
          baseBranch?.lastCommit != null && !!floroBranch?.lastCommit &&
          (divergenceOrigin?.intoLastCommonAncestor == floroBranch?.lastCommit ||
            divergenceOrigin?.trueOrigin == baseBranch?.lastCommit);
          let isConflictFree =
            isMerged || divergenceSha === baseBranch?.lastCommit;
          if (!isConflictFree) {
            const divergenceState =
              (await datasource.readCommitApplicationState?.(
                repository.id,
                divergenceSha
              )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
            const branchState =
              (await datasource.readCommitApplicationState?.(
                repository.id,
                floroBranch?.lastCommit as string
              )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
            const baseBranchState =
              (await datasource.readCommitApplicationState?.(
                repository.id,
                baseBranch?.lastCommit as string
              )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
            const canAutoMerge = await canAutoMergeCommitStates(
              datasource,
              baseBranchState,
              branchState,
              divergenceState
            );
            if (canAutoMerge) {
              isConflictFree = true;
            }
          }
          const approvalStatus = await this.getApprovalStatus(mergeRequest, repository);
          const updatedMergeRequest = await mergeRequestsContext.updateMergeRequest(mergeRequest, {
            isMerged,
            isConflictFree,
            divergenceSha,
            approvalStatus
          });
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: updatedMergeRequest
          });
      },
      { autorun: true}
    );

    this.worker.on("error", (error: Error) => {
      console.error("Merge Request Push Queue Error", error);
    });
  }

  public async addtoQueue(args: {
    jobId: string;
    mergeRequest: MergeRequest;
  }): Promise<void> {
    this.queue.add(MergeRequestService.QUEUE_NAME, args);
  }

  public async onBranchChanged(
    repository: Repository,
    _byUser: User,
    dbBranch: Branch
  ): Promise<void> {
    if (!dbBranch?.branchId) {
      return;
    }
    const mergeRequestsContext = await this.contextFactory.createContext(
      MergeRequestsContext,
    );
    const branches = await this.repoDataService.getBranches(
      repository.id,
    );

    const openMergeRequests =
      await mergeRequestsContext.getAllOpenMergeRequests(repository.id);
    const openBranchesWithBranchAsBaseBranch = openMergeRequests.filter(
      (mergeRequest) => {
        const mrBranch = branches.find((b) => mergeRequest.branchId == b.id);
        if (!mrBranch || !mrBranch?.baseBranchId) {
          return false;
        }
        return mrBranch.baseBranchId == dbBranch.branchId;
      }
    );

    for (const openMergeRequest of openBranchesWithBranchAsBaseBranch) {
      await this.addtoQueue({jobId: openMergeRequest.id, mergeRequest: openMergeRequest})
    }

    const mergeRequestExists =
      await mergeRequestsContext.repoHasOpenRequestOnBranch(
        repository?.id,
        dbBranch?.branchId
      );
    if (!mergeRequestExists) {
      return;
    }
    const mergeRequest =
      await mergeRequestsContext.getOpenMergeRequestByBranchNameAndRepo(
        repository.id,
        dbBranch?.branchId
      );
    if (!mergeRequest) {
      return;
    }
    await this.addtoQueue({ jobId: mergeRequest.id, mergeRequest });
  }

  public async getBranchDataSource(
    repository: Repository,
    branch: FloroBranch,
    baseBranch?: FloroBranch | null
  ) {
    const commits = await this.repoDataService.getCommits(repository.id);
    const pluginList =
      await this.repositoryDatasourceFactoryService.getMergePluginList(
        repository,
        branch,
        commits,
        baseBranch?.lastCommit ?? undefined
      );
    return await this.repositoryDatasourceFactoryService.getDatasource(
      repository,
      branch,
      commits,
      pluginList
    );
  }

  public async getMergeRequestDataSourceForBaseBranch(
    repository: Repository,
    branch: FloroBranch,
    baseBranch: FloroBranch
  ) {
    const commits = await this.repoDataService.getCommits(repository.id);
    const pluginList =
      await this.repositoryDatasourceFactoryService.getMergePluginList(
        repository,
        branch,
        commits,
        baseBranch?.lastCommit ?? undefined
      );
    return await this.repositoryDatasourceFactoryService.getDatasource(
      repository,
      baseBranch,
      commits,
      pluginList
    );
  }

  public async createMergeRequestComment(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    text: string,
    pluginName?: string,
    pluginVersionId?: string
  ): Promise<CreateMergeRequestCommentResponse> {
    if ((text ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(
        repository.id,
        user
    );

    if (!userRepoSettings?.canReadRepo) {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
    }

    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const commits = await this.repoDataService.getCommits(repository.id);
    const pendingCommits = branch?.lastCommit
      ? this.repositoryDatasourceFactoryService.getCommitsInRange(
          commits,
          branch?.lastCommit,
          mergeRequest?.divergenceSha
        )
      : [];
    const pluginList =
      await this.repositoryDatasourceFactoryService.getPluginListForCommitList(
        repository.id,
        pendingCommits?.map((c) => c.sha as string)
      );
    const pluginListIds = new Set(pluginList.map(pv => pv.id));
    const pluginNames = pluginList.map((p) => p.name);
    if (pluginName == "home" && pluginVersionId) {
      return {
        action: "INVALID_PLUGIN_COMMENT_ERROR",
        error: {
          type: "INVALID_PLUGIN_COMMENT_ERROR",
          message: "Invalid plugin in comment",
        },
      };
    }
    if (
      pluginName &&
      pluginName != "home" &&
      (!pluginVersionId ||
        !pluginNames.includes(pluginName) ||
        !pluginListIds.has(pluginVersionId))
    ) {
      return {
        action: "INVALID_PLUGIN_COMMENT_ERROR",
        error: {
          type: "INVALID_PLUGIN_COMMENT_ERROR",
          message: "Invalid plugin in comment",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestCommentsContext =
        await this.contextFactory.createContext(
          MergeRequestCommentsContext,
          queryRunner
        );
      const comment = await mergeRequestCommentsContext.create({
        text,
        branchHeadShaAtCreate: mergeRequest?.isOpen
          ? branch?.lastCommit ?? undefined
          : undefined,
        isDeleted: false,
        userId: user.id,
        mergeRequestId: mergeRequest.id,
        pluginName,
        pluginVersionId
      });
      for (const mergeRequestCommentEventHandler of this
        .mergeRequestCommentEventHandlers) {
        await mergeRequestCommentEventHandler.onMergeRequestCommentCreated(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          comment
        );
      }

      await queryRunner.commitTransaction();
      return {
        action: "COMMENT_CREATED",
        mergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_COMMENT_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async updateMergeRequestComment(
    comment: MergeRequestComment,
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    text: string
  ): Promise<UpdateMergeRequestCommentResponse> {
    if (comment.isDeleted) {
      return {
        action: "COMMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "COMMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if (comment.userId != user.id) {
      return {
        action: "INVALID_COMMENTER_ERROR",
        error: {
          type: "INVALID_COMMENTER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    if ((text ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(
        repository.id,
        user
    );

    if (!userRepoSettings?.canReadRepo) {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
    }

    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestCommentsContext =
        await this.contextFactory.createContext(
          MergeRequestCommentsContext,
          queryRunner
        );
      const updatedComment =
        await mergeRequestCommentsContext.updateMergeRequestComment(comment, {
          text,
          branchHeadShaAtCreate: mergeRequest?.isOpen
            ? branch?.lastCommit ?? undefined
            : undefined,
          isDeleted: false,
          userId: user.id,
          mergeRequestId: mergeRequest.id,
        });
      for (const mergeRequestCommentEventHandler of this
        .mergeRequestCommentEventHandlers) {
        await mergeRequestCommentEventHandler.onMergeRequestCommentUpdated(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          updatedComment
        );
      }

      await queryRunner.commitTransaction();
      return {
        action: "COMMENT_UPDATED",
        mergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPDATE_COMMENT_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async deleteMergeRequestComment(
    comment: MergeRequestComment,
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User
  ): Promise<DeleteMergeRequestCommentResponse> {
    if (comment.isDeleted) {
      return {
        action: "COMMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "COMMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if (comment.userId != user.id) {
      return {
        action: "INVALID_COMMENTER_ERROR",
        error: {
          type: "INVALID_COMMENTER_ERROR",
          message: "Invalid commenter",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(
        repository.id,
        user
    );

    if (!userRepoSettings?.canReadRepo) {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
    }

    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestCommentsContext =
        await this.contextFactory.createContext(
          MergeRequestCommentsContext,
          queryRunner
        );
      const deletedComment =
        await mergeRequestCommentsContext.updateMergeRequestComment(comment, {
          isDeleted: true,
          branchHeadShaAtCreate: mergeRequest?.isOpen
            ? branch?.lastCommit ?? undefined
            : undefined,
        });
      for (const mergeRequestCommentEventHandler of this
        .mergeRequestCommentEventHandlers) {
        await mergeRequestCommentEventHandler.onMergeRequestCommentDeleted(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          deletedComment
        );
      }

      await queryRunner.commitTransaction();
      return {
        action: "COMMENT_DELETED",
        mergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_DELETE_COMMENT_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async createMergeRequestCommentReply(
    comment: MergeRequestComment,
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    text: string
  ): Promise<CreateMergeRequestCommentReplyResponse> {
    if (comment.isDeleted) {
      return {
        action: "COMMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "COMMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if ((text ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(
        repository.id,
        user
    );

    if (!userRepoSettings?.canReadRepo) {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
    }

    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestCommentRepliesContext =
        await this.contextFactory.createContext(
          MergeRequestCommentRepliesContext,
          queryRunner
        );
      const commentReply = await mergeRequestCommentRepliesContext.create({
        text,
        branchHeadShaAtCreate: mergeRequest?.isOpen
          ? branch?.lastCommit ?? undefined
          : undefined,
        isDeleted: false,
        userId: user.id,
        mergeRequestCommentId: comment.id,
      });
      for (const mergeRequestCommentReplyEventHandler of this
        .mergeRequestCommentReplyEventHandlers) {
        await mergeRequestCommentReplyEventHandler.onMergeRequestCommentReplyCreated(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          comment,
          commentReply
        );
      }

      await queryRunner.commitTransaction();
      return {
        action: "COMMENT_REPLY_CREATED",
        mergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_COMMENT_REPLY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async updateMergeRequestCommentReply(
    commentReply: MergeRequestCommentReply,
    comment: MergeRequestComment,
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    text: string
  ): Promise<UpdateMergeRequestCommentReplyResponse> {
    if (commentReply.isDeleted) {
      return {
        action: "COMMENT_REPLY_DOES_NOT_EXIST_ERROR",
        error: {
          type: "COMMENT_REPLY_DOES_NOT_EXIST_ERROR",
          message: "Missing comment reply",
        },
      };
    }
    if (comment.isDeleted) {
      return {
        action: "COMMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "COMMENT_DOES_NOT_EXIST_ERROR",
          message: "Missing comment",
        },
      };
    }
    if (commentReply.userId != user.id) {
      return {
        action: "INVALID_COMMENTER_ERROR",
        error: {
          type: "INVALID_COMMENTER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    if ((text ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(
        repository.id,
        user
    );

    if (!userRepoSettings?.canReadRepo) {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
    }

    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestCommentRepliesContext =
        await this.contextFactory.createContext(
          MergeRequestCommentRepliesContext,
          queryRunner
        );
      const updatedCommentReply =
        await mergeRequestCommentRepliesContext.updateMergeRequestCommentReply(
          commentReply,
          {
            text,
            branchHeadShaAtCreate: mergeRequest?.isOpen
              ? branch?.lastCommit ?? undefined
              : undefined,
          }
        );
      for (const mergeRequestCommentReplyEventHandler of this
        .mergeRequestCommentReplyEventHandlers) {
        await mergeRequestCommentReplyEventHandler.onMergeRequestCommentReplyUpdated(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          comment,
          updatedCommentReply
        );
      }

      await queryRunner.commitTransaction();
      return {
        action: "COMMENT_REPLY_UPDATED",
        mergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPDATE_COMMENT_REPLY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async deleteMergeRequestCommentReply(
    commentReply: MergeRequestCommentReply,
    comment: MergeRequestComment,
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User
  ): Promise<DeleteMergeRequestCommentReplyResponse> {
    if (commentReply.isDeleted) {
      return {
        action: "COMMENT_REPLY_DOES_NOT_EXIST_ERROR",
        error: {
          type: "COMMENT_REPLY_DOES_NOT_EXIST_ERROR",
          message: "Missing comment reply",
        },
      };
    }
    if (comment.isDeleted) {
      return {
        action: "COMMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "COMMENT_DOES_NOT_EXIST_ERROR",
          message: "Missing comment",
        },
      };
    }
    if (commentReply.userId != user.id) {
      return {
        action: "INVALID_COMMENTER_ERROR",
        error: {
          type: "INVALID_COMMENTER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(
        repository.id,
        user
    );

    if (!userRepoSettings?.canReadRepo) {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
    }

    const branches = await this.repoDataService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const mergeRequestCommentRepliesContext =
        await this.contextFactory.createContext(
          MergeRequestCommentRepliesContext,
          queryRunner
        );
      const updatedCommentReply =
        await mergeRequestCommentRepliesContext.updateMergeRequestCommentReply(
          commentReply,
          {
            isDeleted: true,
            branchHeadShaAtCreate: mergeRequest?.isOpen
              ? branch?.lastCommit ?? undefined
              : undefined,
          }
        );
      for (const mergeRequestCommentReplyEventHandler of this
        .mergeRequestCommentReplyEventHandlers) {
        await mergeRequestCommentReplyEventHandler.onMergeRequestCommentReplyDeleted(
          queryRunner,
          user,
          branch?.baseBranchId ?? undefined,
          branch?.lastCommit ?? undefined,
          mergeRequest,
          comment,
          updatedCommentReply
        );
      }

      await queryRunner.commitTransaction();
      return {
        action: "COMMENT_REPLY_DELETED",
        mergeRequest,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_DELETE_COMMENT_REPLY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
