
import { injectable, inject, multiInject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import { Branch as FloroBranch } from "floro/dist/src/repo";
import RepoDataService from "../repositories/RepoDataService";
import MergeRequestService from "../merge_requests/MergeRequestService";
import { getAutoFixCommit, getCanAutofixReversion, getCanRevert, getReversionCommit } from "floro/dist/src/repoapi";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import CommitService from "../merge_requests/CommitService";
import BranchService from "../repositories/BranchService";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import { Branch } from "@floro/database/src/entities/Branch";

export interface RevertBranchResponse {
  action:
    | "BRANCH_REVERTED"
    | "CANNOT_REVERT_ERROR"
    | "LOG_ERROR";
  branch?: Branch;
  repository?: Repository;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface AutofixBranchResponse {
  action:
    | "BRANCH_AUTOFIXED"
    | "CANNOT_AUTOFIX_ERROR"
    | "LOG_ERROR";
  branch?: Branch;
  repository?: Repository;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class RevertService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private mergeRequestService!: MergeRequestService;
  public repoAccessor!: RepoAccessor;
  public commitService!: CommitService;
  public branchService!: BranchService;

  private branchPushHandlers!: BranchPushHandler[];

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(CommitService) commitService: CommitService,
    @inject(BranchService) branchService: BranchService,
    @multiInject("BranchPushHandler") branchPushHandlers: BranchPushHandler[]
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
    this.commitService = commitService;
    this.branchService = branchService;

    this.branchPushHandlers = branchPushHandlers;
    this.mergeRequestService = mergeRequestService;
  }

  public async revertBranch(
    repository: Repository,
    reversionSha: string,
    branch: FloroBranch,
    baseBranch: FloroBranch|undefined,
    user: User
  ) {
    const datasource =
      await this.mergeRequestService.getBranchDataSource(
        repository,
        branch,
        baseBranch
      );
    const canRevert = await getCanRevert(datasource, repository.id, reversionSha, user as any);
    if (!canRevert) {
      return {
        action: "CANNOT_REVERT_ERROR",
        error: {
          type: "CANNOT_REVERT_ERROR",
          message: "Unable to revert",
        }
      };
    }
    const revertedCommit = await getReversionCommit(datasource, repository.id, reversionSha, user as any);
    if (!revertedCommit) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "REVERT_COMMIT_ERROR",
          message: "Failed to generate commit reversion",
        }
      };
    }
    const didWriteCommit = await this.commitService.writeCommit(repository, revertedCommit);
    if (!didWriteCommit) {
        return {
          action: "LOG_ERROR",
          error: {
            type: "COMMIT_ERROR",
            message: "Failed to commit reversion",
          }
        };
    }

    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();

      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );

      const branchesContext = await this.contextFactory.createContext(
        BranchesContext,
        queryRunner
      );

      const remoteBranch = await branchesContext.getByRepoAndBranchId(repository.id, branch.id);
      if (!remoteBranch) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "NO_BRANCH_ERROR",
            message: "No branch found",
          }
        };
      }

      const updatedBranch = await branchesContext.updateBranch(remoteBranch, {
        lastCommit: revertedCommit.sha
      });
      if (!updatedBranch) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BRANCH_UPDATE_ERROR",
            message: "Branch Udpate Failed",
          }
        };
      }
      const updatedRepo = await repositoriesContext.updateRepo(repository, {
        lastRepoUpdateAt: new Date().toISOString(),
      });
      if (!updatedRepo) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "REPO_UPDATE_ERROR",
            message: "Repo Update Failed",
          }
        };
      }
      await queryRunner.commitTransaction();
      for (const handler of this.branchPushHandlers) {
        await handler.onBranchChanged(repository, user, updatedBranch);
      }
      return {
        action: "BRANCH_REVERTED",
        repository: updatedRepo,
        branch: updatedBranch
      };
    } catch (e: any) {
      console.log("E", e);
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_REVERT_ERROR",
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

  public async autofixBranch(
    repository: Repository,
    reversionSha: string,
    branch: FloroBranch,
    baseBranch: FloroBranch|undefined,
    user: User
  ): Promise<AutofixBranchResponse> {

    const datasource =
      await this.mergeRequestService.getBranchDataSource(
        repository,
        branch,
        baseBranch
      );
    const canAutofix = await getCanAutofixReversion(datasource, repository.id, reversionSha, user as any);
    if (!canAutofix) {
      return {
        action: "CANNOT_AUTOFIX_ERROR",
        error: {
          type: "CANNOT_AUTOFIX_ERROR",
          message: "Unable to revert",
        }
      };
    }
    const autofixCommit = await getAutoFixCommit(datasource, repository.id, reversionSha, user as any);
    if (!autofixCommit) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "AUTOFIX_COMMIT_ERROR",
          message: "Failed to generate commit reversion",
        }
      };
    }
    const didWriteCommit = await this.commitService.writeCommit(repository, autofixCommit);
    if (!didWriteCommit) {
        return {
          action: "LOG_ERROR",
          error: {
            type: "COMMIT_ERROR",
            message: "Failed to commit autofix",
          }
        };
    }

    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();

      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );

      const branchesContext = await this.contextFactory.createContext(
        BranchesContext,
        queryRunner
      );

      const remoteBranch = await branchesContext.getByRepoAndBranchId(repository.id, branch.id);
      if (!remoteBranch) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "NO_BRANCH_ERROR",
            message: "No branch found",
          }
        };
      }

      const updatedBranch = await branchesContext.updateBranch(remoteBranch, {
        lastCommit: autofixCommit.sha
      });
      if (!updatedBranch) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "BRANCH_UPDATE_ERROR",
            message: "Branch Udpate Failed",
          }
        };
      }
      const updatedRepo = await repositoriesContext.updateRepo(repository, {
        lastRepoUpdateAt: new Date().toISOString(),
      });
      if (!updatedRepo) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "REPO_UPDATE_ERROR",
            message: "Repo Update Failed",
          }
        };
      }
      await queryRunner.commitTransaction();
      for (const handler of this.branchPushHandlers) {
        await handler.onBranchChanged(repository, user, updatedBranch);
      }
      return {
        action: "BRANCH_AUTOFIXED",
        repository: updatedRepo,
        branch: updatedBranch
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_AUTOFIX_ERROR",
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
