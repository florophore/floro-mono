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
export default class CommitStateDatasourceLoader extends LoaderResolverHook<
  CommitState,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repoDataService!: RepoDataService;
  protected repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;
  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryLoader!: RootRepositoryLoader;
  protected repositoryRemoteSettingsLoader!: RepositoryRemoteSettingsLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @inject(RepositoryCommitsLoader)
    repositoryCommitsLoader: RepositoryCommitsLoader,
    @inject(RootRepositoryLoader) repositoryLoader: RootRepositoryLoader,
    @inject(RepositoryRemoteSettingsLoader) repositoryRemoteSettingsLoader: RepositoryRemoteSettingsLoader,
  ) {
    super();
    this.requestCache = requestCache;
    this.repoDataService = repoDataService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
    this.repositoryCommitsLoader = repositoryCommitsLoader;
    this.repositoryLoader = repositoryLoader;
    this.repositoryRemoteSettingsLoader = repositoryRemoteSettingsLoader;
  }

  public run = runWithHooks<
    CommitState,
    unknown,
    { currentUser?: User | null; cacheKey: string },
    void
  >(
    () => [this.repositoryLoader, this.repositoryCommitsLoader, this.repositoryRemoteSettingsLoader],
    async (
      commitState: CommitState,
      _,
      { cacheKey, currentUser }
    ): Promise<void> => {
      if (!commitState?.repositoryId || !commitState?.sha) {
        return;
      }
      if (!currentUser) {
        return
      }
      const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(cacheKey, commitState?.repositoryId);
      if (!cachedRemoteSettings.canPushBranches) {
        return;
      }
      const cachedRepository = this.requestCache.getRepo(
        cacheKey,
        commitState?.repositoryId
      );
      if (!cachedRepository) {
        return;
      }

      const cachedDataSource = this.requestCache.getCommitStateDatasource(
        cacheKey,
        commitState.repositoryId,
        commitState?.sha ?? ""
      );
      if (cachedDataSource) {
        return;
      }
      const cachedCommits = this.requestCache.getRepoCommits(
        cacheKey,
        commitState?.repositoryId
      );
      if (!cachedCommits) {
        return;
      }

      const cachedBranches = this.requestCache.getRepoBranches(
        cacheKey,
        commitState.repositoryId
      );
      const branches = cachedBranches
        ? cachedBranches
        : (await this.repoDataService.getBranches(
            commitState.repositoryId as string
          )) ?? [];
      if (!cachedBranches && branches) {
        this.requestCache.setRepoBranches(
          cacheKey,
          commitState.repositoryId,
          branches
        );
      }
      if (!branches) {
        return;
      }
      const branch = branches.find((b) => b.id == commitState.branchId);
      if (!branch) {
        return;
      }
      const pluginVersions =
        await this.repositoryDatasourceFactoryService.getRevertOrAutofixPluginList(
          cachedRepository,
          branch,
          cachedCommits,
          commitState.sha
        );

      const datasource =
        await this.repositoryDatasourceFactoryService.getDatasource(
          cachedRepository,
          branch,
          cachedCommits,
          pluginVersions
        );

      if (datasource) {
        this.requestCache.setCommitStateDatasource(
          cacheKey,
          cachedRepository.id,
          commitState.sha,
          datasource
        );
      }
    }
  );
}
