import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import { BranchState, CommitState } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepositoryCommitHistoryLoader from "./RepositoryCommitHistoryLoader";

@injectable()
export default class RepositoryRevertRangesLoader extends LoaderResolverHook<

  BranchState,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repositoryService!: RepositoryService;
  protected repositoryCommitHistoryLoader!: RepositoryCommitHistoryLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(RepositoryCommitHistoryLoader) repositoryCommitHistoryLoader: RepositoryCommitHistoryLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.repositoryService = repositoryService;
    this.repositoryCommitHistoryLoader = repositoryCommitHistoryLoader;
  }

  public run = runWithHooks<
    BranchState,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [
      this.repositoryCommitHistoryLoader
    ],
    async (branchState: BranchState, _, { cacheKey }): Promise<void> => {
      if (!branchState.branchHead || !branchState.repositoryId) {
        return;
      }
      const cachedCommitHistory = this.requestCache.getRepoCommitHistory(cacheKey, branchState.repositoryId, branchState.branchHead);
      if (!cachedCommitHistory) {
        return;
      }

      const cachedRevertRanges = this.requestCache.getRepoRevertRanges(cacheKey, branchState.repositoryId, branchState.branchHead);
      if (cachedRevertRanges) {
        return;
      }
      const ranges = this.repositoryService.getRevertRanges(cachedCommitHistory);
      if (ranges) {
        this.requestCache.setRepoRevertRanges(cacheKey, branchState.repositoryId, branchState.branchHead, ranges);
      }
    }
  );
}

