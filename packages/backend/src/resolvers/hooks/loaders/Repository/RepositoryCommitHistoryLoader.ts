import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import { BranchState, CommitState } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepositoryCommitsLoader from "./RepositoryCommitsLoader";

@injectable()
export default class RepositoryCommitHistoryLoader extends LoaderResolverHook<
  BranchState,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repositoryService!: RepositoryService;
  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  //protected branches: Array<FloroBranch>

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(RepositoryCommitsLoader) repositoryCommitsLoader: RepositoryCommitsLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.repositoryService = repositoryService;
    this.repositoryCommitsLoader = repositoryCommitsLoader;
  }

  public run = runWithHooks<
    BranchState,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [
      this.repositoryCommitsLoader
    ],
    async (branchState: BranchState, _, { cacheKey }): Promise<void> => {
      if (!branchState.branchHead || !branchState.repositoryId) {
        return;
      }
      const cachedCommitHistory = this.requestCache.getRepoCommitHistory(cacheKey, branchState.repositoryId, branchState.branchHead);
      if (cachedCommitHistory) {
        return;
      }
      const cachedCommits = this.requestCache.getRepoCommits(cacheKey, branchState.repositoryId);
      const commitHistory = this.repositoryService.getCommitHistory(cachedCommits, branchState.branchHead) ?? [];
      if (commitHistory) {
        this.requestCache.setRepoCommitHistory(cacheKey, branchState.repositoryId, branchState.branchHead, commitHistory);
      }
    }
  );
}
