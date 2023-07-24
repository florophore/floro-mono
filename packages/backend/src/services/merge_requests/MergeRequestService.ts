import { injectable, inject, multiInject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepositoryService from "../repositories/RepositoryService";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import { QueryRunner } from "typeorm";
import RepoRBACService from "../repositories/RepoRBACService";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import MergeRequestCommentsContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentsContext";
import MergeRequestCommentRepliesContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentRepliesContext";
import CreateMergeRequestEventHandler from "./merge_request_events/CreateMergeRequestEventHandler";
import RepositoryDatasourceFactoryService from "../repositories/RepoDatasourceFactoryService";
import {
  ApplicationKVState,
  BranchRuleSettings,
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

export interface CreateMergeRequestResponse {
  action:
    | "MERGE_REQUEST_CREATED"
    | "INVALID_PARAMS_ERROR"
    | "NO_BRANCH_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "MERGE_REQUEST_ALREADY_EXISTS_FOR_BRANCH"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
};

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
};

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
};

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
};

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
};

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
};

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
};
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
};

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
};

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
};

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
};

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
};

export interface MergeRequestPermissions {
  canEditInfo: boolean;
  canEditReviewers: boolean;
  canRemoveSelfFromReviewers: boolean;
  canBlock: boolean;
  canApprove: boolean;
  allowedToMerge: boolean;
  canClose: boolean;
  canDeleteBranch: boolean;
  hasApproval: boolean;
}

const REVIEWER_LIMIT = 5;
const MERGE_REQUEST_LIMIT = 10;

@injectable()
export default class MergeRequestService implements BranchPushHandler {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repositoryService!: RepositoryService;
  private repoRBAC!: RepoRBACService;
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
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @inject(RepoRBACService) repoRBAC: RepoRBACService,
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
    this.repositoryService = repositoryService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
    this.repoRBAC = repoRBAC;
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


  public getMergeRequestPaginatedResut(
    mergeRequests: Array<MergeRequest>,
    id?: string|null,
    query?: string|null
  ): {
    id: string|null|undefined,
    lastId: string|null,
    nextId: string|null,
    mergeRequests: Array<MergeRequest>
  } {
    let found = !id;
    id = !id ? mergeRequests?.[0]?.id : id;
    const out: Array<MergeRequest> = [];
    let i: number;
    let lastId:string|null = null;
    const isSearch = (query?.trim() ?? "") != "";
    const lowerCaseQuery = query?.trim()?.toLowerCase() ?? "";
    for (i = 0; i < mergeRequests?.length; ++i) {
      if (!isSearch) {
        if (!found && id && mergeRequests[i].id == id) {
          lastId = mergeRequests?.[i - 1]?.id ?? null;
          found = true;
        }
        if (found) {
          out.push(mergeRequests[i]);
        }
      } else {
        const userFullName = `${mergeRequests[i].openedByUser?.firstName} ${mergeRequests[i].user?.lastName}`.toLowerCase();
        const username = `@${mergeRequests[i].openedByUser?.username?.toLowerCase()}`;
        if (lowerCaseQuery) {
          if (mergeRequests[i]?.title?.toLowerCase()?.indexOf(lowerCaseQuery) != -1) {
            out.push(mergeRequests[i]);
          } else if(mergeRequests[i]?.description?.toLowerCase()?.indexOf(lowerCaseQuery) != -1) {
            out.push(mergeRequests[i]);
          } else if(userFullName?.indexOf(lowerCaseQuery) != -1) {
            out.push(mergeRequests[i]);
          } else if (mergeRequests[i].openedByUser?.username?.toLowerCase()?.indexOf(lowerCaseQuery) != -1) {
            out.push(mergeRequests[i]);
          } else if (username?.toLocaleLowerCase()?.indexOf(lowerCaseQuery) != -1) {
            out.push(mergeRequests[i]);
          } else if (mergeRequests[i].mergeRequestCount.toString() == lowerCaseQuery) {
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
            mergeRequests: out
          }
        }
        return {
          id,
          lastId,
          nextId: mergeRequests?.[i + 1]?.id,
          mergeRequests: out
        }
      }
    }
    return {
      id: isSearch ? null : id,
      lastId: isSearch ? null : lastId,
      nextId: null,
      mergeRequests: out
    }

  }

  public async getMergeRequestPermissions(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    queryRunner?: QueryRunner,
  ): Promise<MergeRequestPermissions> {

    const userRepoSettings =
      await this.repositoryService.fetchRepoSettingsForUser(
        repository.id,
        user
      );

    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
      queryRunner
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );
    const existingReviewerIds = new Set(openReviewerRequests?.map(
      (r) => r.requestedReviewerUserId
    ));

    const branches = await this.repositoryService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);

    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;

    const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
      ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
      : null;

    const canEditReviewers = repository?.repoType == "user_repo" ? user?.id == repository?.userId : mergeRequest?.openedByUserId == user?.id;
    const canRemoveSelfFromReviewers = !!user?.id && existingReviewerIds.has(user?.id)

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
      branch,
      baseBranch,
      branchRule,
      userRepoSettings
    )

    const hasApproval = await this.hasApproval(
      mergeRequest,
      repository,
      branch,
      baseBranch,
      queryRunner
    );

    const organizationsMembersContext =
      await this.contextFactory.createContext(OrganizationMembersContext, queryRunner);
    const ownerMembership =
      repository?.repoType == "org_repo"
        ? await organizationsMembersContext.getByOrgIdAndUserId(
            repository.organizationId,
            user.id
          )
        : null;

    const canEditInfo =
      mergeRequest?.openedByUserId == user?.id ||
      (repository?.repoType == "user_repo" &&
        mergeRequest?.userId == user?.id) ||
      (repository?.repoType == "org_repo" &&
        canClose &&
        ownerMembership?.membershipState != "active");

    return {
      canEditInfo,
      hasApproval,
      canEditReviewers,
      canRemoveSelfFromReviewers,
      canBlock: branchRule?.canApproveMergeRequests ?? ((repository?.repoType == "user_repo" && mergeRequest?.openedByUserId == user?.id) || mergeRequest?.openedByUserId != user?.id),
      canApprove: branchRule?.canApproveMergeRequests ?? ((repository?.repoType == "user_repo" && mergeRequest?.openedByUserId == user?.id) || mergeRequest?.openedByUserId != user?.id),
      allowedToMerge,
      canClose,
      canDeleteBranch: userRepoSettings?.canPushBranches ?? canClose,
    };
  }

  public async getCanClose(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    queryRunner?: QueryRunner,
  ): Promise<boolean> {
    if (!user?.id) {
      return false;
    }
    if (repository.repoType == "user_repo") {
      if (repository.isPrivate) {
        return repository.userId == user?.id;
      }
      return repository?.userId == user?.id || mergeRequest?.openedByUserId == user?.id;
    }
    const organizationsMembersContext =
      await this.contextFactory.createContext(OrganizationMembersContext, queryRunner);

    const mrUserMembership =
      await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
    const membership =
      await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );

    if (mrUserMembership?.membershipState != "active") {
      if (!repository?.isPrivate && user?.id == mergeRequest?.userId) {
        return true;
      }
      if (membership?.membershipState == "active") {
        return true;
      }
    }
    if (membership?.membershipState == "active") {
      return user?.id == mergeRequest?.userId;
    }

    return false;
  }

  public async getAllowedToMerge(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    branch?: FloroBranch|null,
    baseBranch?: FloroBranch|null,
    branchRuleSetting?: BranchRuleSettings|null,
    userRepoSettings?: RemoteSettings|null,
    queryRunner?: QueryRunner,
  ): Promise<boolean> {
    if (!userRepoSettings?.canPushBranches) {
      return false;
    }
    if (!baseBranch) {
      return false;
    }
    if (branchRuleSetting?.canMergeWithApproval) {
      return await this.hasApproval(
        mergeRequest,
        repository,
        branch,
        baseBranch,
        queryRunner
      );
    }
    return await this.getCanClose(mergeRequest, repository, user, queryRunner);
  }

  public async hasApproval(
    mergeRequest: MergeRequest,
    repository: Repository,
    branch?: FloroBranch|null,
    baseBranch?: FloroBranch|null,
    queryRunner?: QueryRunner,
  ): Promise<boolean> {

    const reviewStatusesContext = await this.contextFactory.createContext(
      ReviewStatusesContext,
      queryRunner
    );
    if (baseBranch?.id) {
      const protectedBranchRulesContext = await this.contextFactory.createContext(
        ProtectedBranchRulesContext,
        queryRunner
      );

      const branchBrule = await protectedBranchRulesContext.getByRepoAndBranchId(
        repository.id,
        baseBranch?.id
      )
      if (branchBrule) {
        if (branchBrule?.requireApprovalToMerge) {
          const reviewStatuses = await reviewStatusesContext.getMergeRequestReviewStatuses(mergeRequest.id);
          if (branchBrule?.requireReapprovalOnPushToMerge) {
            const currentReviews = reviewStatuses?.filter(rs => {
              return rs.branchHeadShaAtUpdate == branch?.lastCommit && rs?.baseBranchIdAtCreate == branch?.baseBranchId;
            });
            if (currentReviews.length == 0) {
              return false;
            }
            return currentReviews?.reduce((hasApproval, reviewStatus) => {
              if (!hasApproval) {
                return false;
              }
              return reviewStatus.approvalStatus == "approved";

            }, true)
          }
          if (reviewStatuses.length == 0) {
            return false;
          }
          const currentReviews = reviewStatuses?.filter(rs => {
            return rs?.baseBranchIdAtCreate == branch?.baseBranchId;
          });
          return currentReviews?.reduce((hasApproval, reviewStatus) => {
            if (!hasApproval) {
              return false;
            }
            return reviewStatus.approvalStatus == "approved";
          }, true)
        }
      }
    }
    return true;
  }

  public async getPotentialReviewersForMergeRequest(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    query?: string|null
  ): Promise<User[]> {
    if (user?.id) {
      return []
    }
    if (!mergeRequest.isOpen) {
      return []
    }

    const reviewerRequestsContext = await this.contextFactory.createContext(
      ReviewerRequestsContext,
    );
    const openReviewerRequests =
      await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
        mergeRequest.id
      );
    const existingReviewerIds = new Set(openReviewerRequests?.map(
      (r) => r.requestedReviewerUserId
    ));
    if (repository.repoType == "user_repo") {

      if (existingReviewerIds.has(repository.user.id)) {
        return [];
      }
      return [repository.user];
    }
    const branches = await this.repositoryService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    if (!branch) {
      return [];
    }
    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;

    const organizationsMembersContext =
      await this.contextFactory.createContext(OrganizationMembersContext);
    const orgMemembers = await organizationsMembersContext.getAllMembersForOrganization(repository.organizationId);
    const users = orgMemembers.filter(om => {
      if (existingReviewerIds.has(om.userId)) {
        return false;
      }
      return om.membershipState == "active";
    })?.map(om => om.user) as Array<User>;
    let potentialUsers: Array<User> = []
    if ((query ?? "")?.trim()?.length > 0) {
      const lowerCaseQuery = query?.trim().toLowerCase() ?? "";
      potentialUsers = users?.filter(user => {
        if (`${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`.indexOf(lowerCaseQuery) != -1) {
          return true;
        }
        if (`@${user?.username?.toLowerCase()}`.indexOf(lowerCaseQuery) != -1 || user?.username?.toLowerCase().indexOf(lowerCaseQuery) != -1) {
          return true;
        }
        return false;
      }).sort((a, b) => {
        return `${a.firstName} ${a.lastName}` >= `${b.firstName} ${b.lastName}` ? 1 : -1;
      });
    } else {
      potentialUsers = users.sort((a, b) => {
        return `${a.firstName} ${a.lastName}` >= `${b.firstName} ${b.lastName}` ? 1 : -1;
      });
    }
    let out: Array<User> = []
    for (const user of potentialUsers) {
      if (out.length == REVIEWER_LIMIT) {
        break;
      }
      const userRepoSettings =
        await this.repositoryService.fetchRepoSettingsForUser(
          repository.id,
          user
        );
      const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
        ? userRepoSettings?.branchRules.find((b) => b?.branchId == baseBranch?.id)
        : null;
      if (branchRule?.canApproveMergeRequests) {
        out.push(user);
      }
    }
    return out;
  }

  public async mergeMergeRequest(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User
  ) {
    // FILL IN
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
    const branches = await this.repositoryService.getBranches(repository.id);
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

    const userRepoSettings =
      await this.repositoryService.fetchRepoSettingsForUser(
        repository.id,
        user
      );
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
    const datasource = await this.getMergeRequestDataSource(
      repository,
      branch,
      baseBranch
    );
    const divergenceOrigin = await getDivergenceOrigin(
      datasource,
      repository.id,
      branch?.lastCommit ?? undefined,
      baseBranch?.lastCommit ?? undefined
    );
    const divergenceSha: string = getMergeOriginSha(divergenceOrigin) as string;
    const isMerged = !!divergenceSha && divergenceSha === branch?.lastCommit;
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
        branchState,
        baseBranchState,
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
      const count = await mergeRequestsContext.countMergeRequestsByRepo(repository.id);
      debugger;
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
      await this.repositoryService.fetchRepoSettingsForUser(
        repository.id,
        user
      );
    const branches = await this.repositoryService.getBranches(repository.id);
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
          updatedMergeRequest
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
      await this.repositoryService.fetchRepoSettingsForUser(
        repository.id,
        user
      );
    const branches = await this.repositoryService.getBranches(repository.id);
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
      await this.repositoryService.fetchRepoSettingsForUser(
        repository.id,
        user
      );
    const branches = await this.repositoryService.getBranches(repository.id);
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
      if (repository.repoType == "org_repo") {
        const organizationsMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const membership =
          await organizationsMembersContext.getByOrgIdAndUserId(
            repository.organizationId,
            user.id
          );
        if (membership?.membershipState != "active") {
          return {
            action: "INVALID_REVIEWER_ERROR",
            error: {
              type: "INVALID_REVIEWER_ERROR",
              message: "Invalid Reviewer",
            },
          };
        }
      } else {
        if (reviewerId != repository?.userId) {
          // in personal repos only the user can approve or review
          return {
            action: "INVALID_REVIEWER_ERROR",
            error: {
              type: "INVALID_REVIEWER_ERROR",
              message: "Invalid Reviewer",
            },
          };
        }
      }

      const reviewerRepoSettings =
        await this.repositoryService.fetchRepoSettingsForUser(
          repository.id,
          reviewerUser
        );

      const branchRule: BranchRuleSettings | undefined | null = !!baseBranch
        ? reviewerRepoSettings?.branchRules.find(
            (b) => b?.branchId == baseBranch?.id
          )
        : null;

      const canApproveMergeRequests =
        branchRule?.canApproveMergeRequests ?? true;
      if (!canApproveMergeRequests) {
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
      // DONE
      await queryRunner.commitTransaction();
      return {
        action: "UPDATE_MERGE_REQUEST_REVIEWERS_SUCCESS",
        mergeRequest,
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
      await this.repositoryService.fetchRepoSettingsForUser(
        repository.id,
        user
      );

    const branches = await this.repositoryService.getBranches(repository.id);
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
        await queryRunner.commitTransaction();
        return {
          action: "REVIEW_STATUS_UPDATED",
          mergeRequest: mergeRequest,
        };
      }
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
    const branches = await this.repositoryService.getBranches(repository.id);
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

      await queryRunner.commitTransaction();
      return {
        action: "REVIEW_STATUS_DELETED",
        mergeRequest,
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

  public async onBranchChanged(
    queryRunner: QueryRunner,
    repository: Repository,
    _byUser: User,
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

    const branches = await this.repositoryService.getBranches(repository.id);
    const floroBranch: FloroBranch | undefined | null = !!branch?.branchId
      ? branches?.find((b) => b.id == branch?.branchId)
      : null;
    if (!floroBranch) {
      return;
    }
    const baseBranch: FloroBranch | undefined | null = !!branch?.baseBranchId
      ? branches?.find((b) => b.id == branch?.baseBranchId)
      : null;

    const datasource = await this.getMergeRequestDataSource(
      repository,
      floroBranch,
      baseBranch
    );
    const divergenceOrigin = await getDivergenceOrigin(
      datasource,
      repository.id,
      floroBranch?.lastCommit ?? undefined,
      baseBranch?.lastCommit ?? undefined
    );
    const divergenceSha: string = getMergeOriginSha(divergenceOrigin) as string;
    const isMerged = !!divergenceSha && divergenceSha === branch?.lastCommit;
    let isConflictFree = isMerged || divergenceSha === baseBranch?.lastCommit;
    if (!isConflictFree) {
      const divergenceState = (await datasource.readCommitApplicationState?.(
        repository.id,
        divergenceSha
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
        branchState,
        baseBranchState,
        divergenceState
      );
      if (canAutoMerge) {
        isConflictFree = true;
      }
    }
    if (isMerged != mergeRequest?.isMerged) {
      await mergeRequestsContext.updateMergeRequest(mergeRequest, {
        isMerged,
        isConflictFree,
        divergenceSha,
      });
    }
  }

  public async getMergeRequestDataSource(
    repository: Repository,
    branch: FloroBranch,
    baseBranch?: FloroBranch | null
  ) {
    const commits = await this.repositoryService.getCommits(repository.id);
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

  public async createMergeRequestComment(
    mergeRequest: MergeRequest,
    repository: Repository,
    user: User,
    text: string,
    pluginName?: string
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
    if (repository.repoType == "org_repo") {
      const organizationsMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
      if (repository.isPrivate && membership?.membershipState != "active") {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    } else if (repository.isPrivate) {
      if (user.id != repository?.userId) {
        // in personal repos only the user can approve or review
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    }

    const branches = await this.repositoryService.getBranches(repository.id);
    const branch = branches?.find((b) => b.id == mergeRequest?.branchId);
    const commits = await this.repositoryService.getCommits(repository.id);
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
    const pluginNames = pluginList.map((p) => p.name);
    if (pluginName && !pluginNames.includes(pluginName)) {
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
    if (repository.repoType == "org_repo") {
      const organizationsMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
      if (repository.isPrivate && membership?.membershipState != "active") {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    } else if (repository.isPrivate) {
      if (user.id != repository?.userId) {
        // in personal repos only the user can approve or review
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    }

    const branches = await this.repositoryService.getBranches(repository.id);
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
    if (repository.repoType == "org_repo") {
      const organizationsMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
      if (repository.isPrivate && membership?.membershipState != "active") {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    } else if (repository.isPrivate) {
      if (user.id != repository?.userId) {
        // in personal repos only the user can approve or review
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    }

    const branches = await this.repositoryService.getBranches(repository.id);
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
    if (repository.repoType == "org_repo") {
      const organizationsMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
      if (repository.isPrivate && membership?.membershipState != "active") {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    } else if (repository.isPrivate) {
      if (user.id != repository?.userId) {
        // in personal repos only the user can approve or review
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    }

    const branches = await this.repositoryService.getBranches(repository.id);
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
    if (repository.repoType == "org_repo") {
      const organizationsMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
      if (repository.isPrivate && membership?.membershipState != "active") {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    } else if (repository.isPrivate) {
      if (user.id != repository?.userId) {
        // in personal repos only the user can approve or review
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    }

    const branches = await this.repositoryService.getBranches(repository.id);
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
    if (repository.repoType == "org_repo") {
      const organizationsMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        user.id
      );
      if (repository.isPrivate && membership?.membershipState != "active") {
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    } else if (repository.isPrivate) {
      if (user.id != repository?.userId) {
        // in personal repos only the user can approve or review
        return {
          action: "INVALID_COMMENTER_ERROR",
          error: {
            type: "INVALID_COMMENTER_ERROR",
            message: "Invalid commenter",
          },
        };
      }
    }

    const branches = await this.repositoryService.getBranches(repository.id);
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
