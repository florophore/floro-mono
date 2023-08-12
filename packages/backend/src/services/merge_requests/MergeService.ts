import { injectable, inject, multiInject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import {
  ApplicationKVState,
  BranchRuleSettings,
  EMPTY_COMMIT_STATE,
  canAutoMergeCommitStates,
  getDivergenceOrigin,
  getMergeOriginSha,
} from "floro/dist/src/repo";
import { Branch as FloroBranch } from "floro/dist/src/repo";
import { MergeRequest } from "@floro/database/src/entities/MergeRequest";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import RepoDataService from "../repositories/RepoDataService";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import MergedMergeRequestEventHandler from "./merge_request_events/MergedMergeRequestEventHandler";
import MergeRequestService from "./MergeRequestService";
import { getMergeRebaseCommitList } from "floro/dist/src/repoapi";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import CommitService from "./CommitService";
import BranchService from "../repositories/BranchService";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import { Branch } from "@floro/database/src/entities/Branch";

export interface MergeMergeRequestResponse {
  action:
    | "MERGE_REQUEST_MERGED"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "FORBIDDEN_ACTION_ERROR"
    | "MERGING_BLOCKED_ERROR"
    | "REQUIRES_APPROVAL_ERROR"
    | "UNKNOWN_MERGE_MERGE_REQUEST_ERROR"
    | "LOG_ERROR";
  mergeRequest?: MergeRequest;
  repository?: Repository;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface MergeBranchResponse {
  action:
    | "BRANCH_MERGED"
    | "MERGE_REQUEST_CLOSED_ERROR"
    | "FORBIDDEN_ACTION_ERROR"
    | "MERGING_BLOCKED_ERROR"
    | "REQUIRES_APPROVAL_ERROR"
    | "UNKNOWN_MERGE_BRANCH_ERROR"
    | "LOG_ERROR";
  baseBranch?: Branch;
  repository?: Repository;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class MergeService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoDataService!: RepoDataService;
  private mergeRequestService!: MergeRequestService;
  public repoAccessor!: RepoAccessor;
  public commitService!: CommitService;
  public branchService!: BranchService;

  private mergedMergeRequestEventHandler!: MergedMergeRequestEventHandler[];
  private branchPushHandlers!: BranchPushHandler[];

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(CommitService) commitService: CommitService,
    @inject(BranchService) branchService: BranchService,
    @multiInject("MergedMergeRequestEventHandler")
    mergedMergeRequestEventHandler: MergedMergeRequestEventHandler[],
    @multiInject("BranchPushHandler") branchPushHandlers: BranchPushHandler[]
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
    this.mergedMergeRequestEventHandler = mergedMergeRequestEventHandler;
    this.repoAccessor = repoAccessor;
    this.commitService = commitService;
    this.branchService = branchService;

    this.branchPushHandlers = branchPushHandlers;
    this.mergeRequestService = mergeRequestService;
  }

  public async mergeMergeRequest(
    repository: Repository,
    mergeRequest: MergeRequest,
    user: User
  ): Promise<MergeMergeRequestResponse> {
    if (!mergeRequest.isOpen) {
      return {
        action: "MERGE_REQUEST_CLOSED_ERROR",
        error: {
          type: "MERGE_REQUEST_CLOSED_ERROR",
          message: "Merge Request Closed Already",
        },
      };
    }

    const usersContext = await this.contextFactory.createContext(
      UsersContext
    );

    const mrUser = await usersContext.getById(mergeRequest.openedByUserId) as User;

    if (!mrUser) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "NULL_USER_ERROR",
          message: "Null user error",
        },
      };
    }

    const branches = await this.repoDataService.getBranches(repository.id);
    const floroBranch: FloroBranch | undefined | null = !!mergeRequest?.branchId
      ? branches?.find((b) => b.id == mergeRequest?.branchId)
      : null;
    if (!floroBranch?.lastCommit) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "NULL_LAST_COMMIT_ERROR",
          message: "Null last commit error",
        },
      };
    }
    const baseBranch: FloroBranch | undefined | null =
      !!floroBranch?.baseBranchId
        ? branches?.find((b) => b.id == floroBranch?.baseBranchId)
        : null;
    if (!baseBranch) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "NULL_BASE_BRANCH_ERROR",
          message: "Null base branch error",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    const branchRuleSetting: BranchRuleSettings | undefined | null =
      !!baseBranch
        ? userRepoSettings?.branchRules.find(
            (b) => b?.branchId == baseBranch?.id
          )
        : null;

    const datasource =
      await this.mergeRequestService.getMergeRequestDataSourceForBaseBranch(
        repository,
        floroBranch,
        baseBranch
      );

    if (!datasource) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "NULL_DATASOURCE_ERROR",
          message: "Null datasource error",
        },
      };
    }

    const divergenceOrigin = await getDivergenceOrigin(
      datasource,
      repository.id,
      baseBranch?.lastCommit ?? undefined,
      floroBranch?.lastCommit ?? undefined
    );
    const divergenceSha: string = getMergeOriginSha(divergenceOrigin) as string;
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
        branchState,
        baseBranchState,
        divergenceState
      );
      if (canAutoMerge) {
        isConflictFree = true;
      }
    }

    if (!isConflictFree) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "CONFLICT_ERROR",
          message: "Merge conflict detected",
        },
      };
    }

    const organizationsMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext
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
      (repository?.repoType == "user_repo" && repository.userId == user.id);

    const allowedToMerge = await this.mergeRequestService.getAllowedToMerge(
      mergeRequest,
      repository,
      user,
      baseBranch,
      branchRuleSetting,
      userRepoSettings
    );

    if (!allowedToMerge) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden action",
        },
      };
    }

    if (branchRuleSetting?.requiresApprovalToMerge && !isAdmin) {
      const hasBlock = await this.mergeRequestService.hasBlock(
        mergeRequest,
        repository,
        floroBranch,
        baseBranch
      );
      if (hasBlock && !isAdmin) {
        return {
          action: "MERGING_BLOCKED_ERROR",
          error: {
            type: "MERGING_BLOCKED_ERROR",
            message: "Merging blocked",
          },
        };
      }
      const hasApproval = await this.mergeRequestService.hasApproval(
        mergeRequest,
        repository,
        floroBranch,
        baseBranch
      );
      if (!hasApproval && !isAdmin) {
        return {
          action: "REQUIRES_APPROVAL_ERROR",
          error: {
            type: "REQUIRES_APPROVAL_ERROR",
            message: "Mege requires approval",
          },
        };
      }
    }

    const rebaseList = await getMergeRebaseCommitList(
      datasource,
      repository.id,
      floroBranch.lastCommit as string,
      mrUser as any,
      true
    );

    const finalCommit =
      rebaseList[rebaseList.length - 1] ??
      (await datasource?.readCommit?.(
        repository.id,
        divergenceOrigin?.basedOn == "from"
          ? (floroBranch?.lastCommit as string)
          : (baseBranch.lastCommit as string)
      ));
    const updatedBaseBranchHead =
      divergenceOrigin.trueOrigin == baseBranch?.lastCommit
        ? floroBranch?.lastCommit
        : finalCommit?.sha;

    const didWriteCommits = await this.commitService.writeCommitList(repository, rebaseList);
    if (!didWriteCommits) {
        return {
          action: "LOG_ERROR",
          error: {
            type: "COMMIT_WRITE_ERROR",
            message: "Commit write error",
          },
        };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const branchesContext = await this.contextFactory.createContext(
        BranchesContext,
        queryRunner
      );

      const mergeRequestsContext = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );
      const remoteBaseBranch = await branchesContext.getByRepoAndBranchId(repository.id, baseBranch.id);
      if (!remoteBaseBranch) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BASE_BRANCH_NOT_FOUND_ERROR",
            message: "remote base branch not found error",
          },
        };
      }
      const updatedBaseBranch = await branchesContext.updateBranch(remoteBaseBranch, {
        lastCommit: updatedBaseBranchHead
      });

      if (!updatedBaseBranch) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BRANCH_UPDATE_FAILED_ERROR",
            message: "branch update error",
          },
        };
      }

      const updatedMergeRequest = await mergeRequestsContext.updateMergeRequest(
        mergeRequest,
        {
          isOpen: false,
          branchHeadShaAtClose: floroBranch?.lastCommit ?? undefined,
          wasClosedWithoutMerging: false,
          mergeSha: updatedBaseBranchHead,
          isMerged: true
        }
      );

      if (!updatedMergeRequest) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "MERGE_REQUEST_CLOSE_ERROR",
            message: "Merge request close error",
          },
        };
      }

      const remoteBranch = await branchesContext.getByRepoAndBranchId(repository.id, floroBranch.id);
      if (!remoteBranch) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BRANCH_NOT_FOUND_ERROR",
            message: "remote branch not found error",
          },
        };
      }
      if (branchRuleSetting?.automaticallyDeletesMergedFeatureBranches) {
        const canDeleteMRBranch = await this.branchService.canDeleteBranch(repository, floroBranch, queryRunner);
        if (canDeleteMRBranch) {
          await branchesContext.updateBranch(remoteBranch, {
            isDeleted: true,
          });
        }
      } else {
        await branchesContext.updateBranch(remoteBranch, {
          isConflictFree: true,
          isMerged: true,
        });
      }

      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const updatedRepo = await repositoriesContext.updateRepo(repository, {
        lastRepoUpdateAt: new Date().toISOString(),
      });
      if (!updatedRepo) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "REPO_UPDATE_ERROR",
            message: "Repo update error",
          },
        };
      }
      await queryRunner.commitTransaction();

      for (const mergeMergeRequestEventHandler of this
        .mergedMergeRequestEventHandler) {
        await mergeMergeRequestEventHandler.onMergeRequestMerged(
          queryRunner,
          user,
          floroBranch?.baseBranchId ?? undefined,
          floroBranch?.lastCommit ?? undefined,
          updatedMergeRequest
        );
      }
      for (const handler of this.branchPushHandlers) {
        await handler.onBranchChanged(
          updatedRepo,
          user,
          updatedBaseBranch
        );
      }
      return {
        action: "MERGE_REQUEST_MERGED",
        mergeRequest: updatedMergeRequest,
        repository: updatedRepo
      };
      // update updatedrs
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_MERGE_MERGE_REQUEST_ERROR",
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


  public async mergeBranch(
    repository: Repository,
    floroBranch: FloroBranch,
    user: User
  ): Promise<MergeBranchResponse>  {

    const branches = await this.repoDataService.getBranches(repository.id);
    if (!floroBranch?.lastCommit) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "NULL_LAST_COMMIT_ERROR",
          message: "Null last commit error",
        },
      };
    }
    const baseBranch: FloroBranch | undefined | null =
      !!floroBranch?.baseBranchId
        ? branches?.find((b) => b.id == floroBranch?.baseBranchId)
        : null;
    if (!baseBranch) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "NULL_BASE_BRANCH_ERROR",
          message: "Null base branch error",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    const branchRuleSetting: BranchRuleSettings | undefined | null =
      !!baseBranch
        ? userRepoSettings?.branchRules.find(
            (b) => b?.branchId == baseBranch?.id
          )
        : null;

    const datasource =
      await this.mergeRequestService.getMergeRequestDataSourceForBaseBranch(
        repository,
        floroBranch,
        baseBranch
      );

    if (!datasource) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "NULL_DATASOURCE_ERROR",
          message: "Null datasource error",
        },
      };
    }

    const divergenceOrigin = await getDivergenceOrigin(
      datasource,
      repository.id,
      baseBranch?.lastCommit ?? undefined,
      floroBranch?.lastCommit ?? undefined
    );
    const divergenceSha: string = getMergeOriginSha(divergenceOrigin) as string;
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
        branchState,
        baseBranchState,
        divergenceState
      );
      if (canAutoMerge) {
        isConflictFree = true;
      }
    }

    if (!isConflictFree) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "CONFLICT_ERROR",
          message: "Merge conflict detected",
        },
      };
    }

    const rebaseList = await getMergeRebaseCommitList(
      datasource,
      repository.id,
      floroBranch.lastCommit as string,
      user as any,
      true
    );

    const finalCommit =
      rebaseList[rebaseList.length - 1] ??
      (await datasource?.readCommit?.(
        repository.id,
        divergenceOrigin?.basedOn == "from"
          ? (floroBranch?.lastCommit as string)
          : (baseBranch.lastCommit as string)
      ));
    const updatedBaseBranchHead =
      divergenceOrigin.trueOrigin == baseBranch?.lastCommit
        ? floroBranch?.lastCommit
        : finalCommit?.sha;

    const didWriteCommits = await this.commitService.writeCommitList(repository, rebaseList);
    if (!didWriteCommits) {
        return {
          action: "LOG_ERROR",
          error: {
            type: "COMMIT_WRITE_ERROR",
            message: "Commit write error",
          },
        };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();

      const mergeRequestsContext = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );

      const branchHasOpenRequest =
        await mergeRequestsContext.repoHasOpenRequestOnBranch(
          repository.id,
          floroBranch.id
        );
      if (branchHasOpenRequest) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "OPEN_MERGE_REQUEST_ERROR",
            message: "open merge request on branch error",
          },
        };
      }
      const branchesContext = await this.contextFactory.createContext(
        BranchesContext,
        queryRunner
      );

      const remoteBaseBranch = await branchesContext.getByRepoAndBranchId(repository.id, baseBranch.id);
      if (!remoteBaseBranch) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BASE_BRANCH_NOT_FOUND_ERROR",
            message: "remote base branch not found error",
          },
        };
      }
      const updatedBaseBranch = await branchesContext.updateBranch(remoteBaseBranch, {
        lastCommit: updatedBaseBranchHead
      });

      if (!updatedBaseBranch) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BRANCH_UPDATE_FAILED_ERROR",
            message: "branch update error",
          },
        };
      }

      const remoteBranch = await branchesContext.getByRepoAndBranchId(repository.id, floroBranch.id);
      if (!remoteBranch) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BRANCH_NOT_FOUND_ERROR",
            message: "remote branch not found error",
          },
        };
      }
      if (branchRuleSetting?.automaticallyDeletesMergedFeatureBranches) {
        const canDeleteMRBranch = await this.branchService.canDeleteBranch(repository, floroBranch, queryRunner);
        if (canDeleteMRBranch) {
          await branchesContext.updateBranch(remoteBranch, {
            isDeleted: true,
          });
        }
      } else {
        await branchesContext.updateBranch(remoteBranch, {
          isConflictFree: true,
          isMerged: true,
        });
      }

      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const updatedRepo = await repositoriesContext.updateRepo(repository, {
        lastRepoUpdateAt: new Date().toISOString(),
      });
      if (!updatedRepo) {
        queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "REPO_UPDATE_ERROR",
            message: "Repo update error",
          },
        };
      }
      await queryRunner.commitTransaction();

      for (const handler of this.branchPushHandlers) {
        await handler.onBranchChanged(
          updatedRepo,
          user,
          updatedBaseBranch
        );
      }
      return {
        action: "BRANCH_MERGED",
        baseBranch: updatedBaseBranch,
        repository: updatedRepo
      };
      // update updatedrs
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_MERGE_BRANCH_ERROR",
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
