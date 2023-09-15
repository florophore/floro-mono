
import { injectable, inject } from "inversify";
import {
  Job,
  Queue,
  Worker,
  QueueScheduler,
} from "bullmq";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import {
  ApplicationKVState,
  EMPTY_COMMIT_STATE,
  canAutoMergeCommitStates,
  getDivergenceOrigin,
  getMergeOriginSha,
} from "floro/dist/src/repo";
import { Branch } from "@floro/database/src/entities/Branch";
import { Branch as FloroBranch } from "floro/dist/src/repo";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import RepoDataService from "../repositories/RepoDataService";
import RedisClient from "@floro/redis/src/RedisClient";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { QueueService } from "../QueueService";
import MergeRequestService from "./MergeRequestService";
import { getMergeRebaseCommitList } from "floro/dist/src/repoapi";
import CommitService from "./CommitService";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";

@injectable()
export default class PreMergeCommitQueue implements BranchPushHandler, QueueService {
  private contextFactory!: ContextFactory;
  private repoDataService!: RepoDataService;
  private mergeRequestService!: MergeRequestService;
  public commitService!: CommitService;

  public static QUEUE_NAME = "pre-merge-commit-queue";

  public queue!: Queue;
  public worker!: Worker;
  public scheduler!: QueueScheduler;
  public pubsub!: RedisPubSub;
  public redisClient!: RedisClient;


  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(CommitService) commitService: CommitService,
  ) {
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
    this.commitService = commitService;
    this.mergeRequestService = mergeRequestService;
  }

  public setRedisPubsub(pubsub: RedisPubSub): void {
    this.pubsub = pubsub;
  }

  public async onBranchChanged(
    repository: Repository,
    _byUser: User,
    dbBranch: Branch
  ): Promise<void> {
    if (!dbBranch?.branchId) {
      return;
    }
    const branches = await this.repoDataService.getBranches(
      repository.id,
    );
    const floroBranch = branches.find(b => b.id == dbBranch.branchId);
    if (floroBranch) {
      this.addtoQueue({
        jobId: floroBranch?.dbId,
        floroBranch: floroBranch,
        repositoryId: repository.id
      });
    }
    for (const branch of branches) {
      if (branch.baseBranchId == floroBranch?.id) {
        this.addtoQueue({
          jobId: branch?.dbId,
          floroBranch: branch,
          repositoryId: repository.id
        });
      }
    }
  }

  public async addtoQueue(args: {
    jobId: string;
    floroBranch: FloroBranch & {dbId: string};
    repositoryId: string;
  }): Promise<void> {
    this.queue.add(PreMergeCommitQueue.QUEUE_NAME, args);
  }

  public startQueueWorker(redisClient: RedisClient): void {

    this.queue = new Queue(PreMergeCommitQueue.QUEUE_NAME, {
      connection: redisClient.redis,
    });

    this.scheduler = new QueueScheduler(PreMergeCommitQueue.QUEUE_NAME);

    this.worker = new Worker(
      PreMergeCommitQueue.QUEUE_NAME,
      async (args: Job<{ jobId: string; floroBranch: FloroBranch & {dbId: string}, repositoryId: string }>) => {
          const queuedBranch: FloroBranch & {dbId: string} = args.data.floroBranch;
          const repositoryId: string = args.data.repositoryId;
          if (!queuedBranch) {
            return;
          }
          const branches = await this.repoDataService.getBranches(
            repositoryId
          );
          const repository = await this.repoDataService.getRepository(
            repositoryId
          );
          if (!repository) {
            return;
          }

          const floroBranch: FloroBranch | undefined | null =
            !!queuedBranch?.id
              ? branches?.find((b) => b.id == queuedBranch?.id)
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

          const datasource = await this.mergeRequestService.getMergeRequestDataSourceForBaseBranch(
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
        if (isConflictFree && !isMerged) {
            const branchesContext = await this.contextFactory.createContext(BranchesContext)
            const remoteBranch = await branchesContext.getById(queuedBranch.dbId);
            if (!remoteBranch) {
              return;
            }
            branchesContext.updateBranch(remoteBranch, {
              isConflictFree,
              isMerged
            })
            const usersContext = await this.contextFactory.createContext(UsersContext)
            const user = await usersContext.getById(remoteBranch.createdById);
            if (!user) {
                return;
            }

            const rebaseList = await getMergeRebaseCommitList(
              datasource,
              repository.id,
              floroBranch.lastCommit as string,
              user as any
            );
            const didWrite = await this.commitService.writeCommitList(repository, rebaseList);
            if (!didWrite) {
              console.log("MERGE WRITE FAILED")
                //throw new Error("Merge Request Pre Merge Failed");
            }
        }
      },
      { autorun: true}
    );

    this.worker.on("error", (error: Error) => {
      console.error("Merge Request Push Queue Error", error);
    });
  }
}
