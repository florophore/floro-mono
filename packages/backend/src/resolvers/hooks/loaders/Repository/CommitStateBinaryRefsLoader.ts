import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import RepositoryDatasourceFactoryService from "../../../../services/repositories/RepoDatasourceFactoryService";
import RepositoryCommitsLoader from "./RepositoryCommitsLoader";
import {
  BranchState,
  CommitState,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import RootRepositoryLoader from "../Root/RepositoryID/RepositoryLoader";
import RepositoryRemoteSettingsLoader from "./RepositoryRemoteSettingsLoader";
import RepoDataService from "../../../../services/repositories/RepoDataService";

@injectable()
export default class CommitStateBinaryRefsLoader extends LoaderResolverHook<
  CommitState,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repoDataService!: RepoDataService;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepoDataService) repoDataService: RepoDataService
  ) {
    super();
    this.requestCache = requestCache;
    this.repoDataService = repoDataService;
  }

  public run = runWithHooks<
    CommitState,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async (
      commitState: CommitState,
      _,
      { cacheKey }
    ): Promise<void> => {
      if (!commitState?.repositoryId || !commitState?.sha) {
        return;
      }
      const cachedBinaryRefs = this.requestCache.getCommitStateBinaryRefs(cacheKey, commitState.repositoryId, commitState.sha);
      if (cachedBinaryRefs) {
        return;
      }
      const binaryRefs =
        await this.repoDataService.getBinaryLinksForCommit(
          commitState.repositoryId,
          commitState.sha
        );
      if (binaryRefs) {
        this.requestCache.setCommitStateBinaryRefs(
          cacheKey,
          commitState.repositoryId,
          commitState.sha,
          binaryRefs
        );
      }
    }
  );
}
