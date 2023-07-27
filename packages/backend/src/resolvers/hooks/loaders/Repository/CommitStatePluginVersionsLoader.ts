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

@injectable()
export default class CommitStatePluginVersionsLoader extends LoaderResolverHook<
  CommitState,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;
  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryLoader!: RootRepositoryLoader;
  protected repositoryRemoteSettingsLoader!: RepositoryRemoteSettingsLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService
  ) {
    super();
    this.requestCache = requestCache;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
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
      const cachedPluginVersions = this.requestCache.getCommitStatePluginVersions(cacheKey, commitState.repositoryId, commitState.sha);
      if (cachedPluginVersions) {
        return;
      }
      const pluginVersions =
        await this.repositoryDatasourceFactoryService.getPluginList(
          commitState.repositoryId,
          commitState.sha
        );
      if (pluginVersions) {
        this.requestCache.setCommitStatePluginVersions(
          cacheKey,
          commitState.repositoryId,
          commitState.sha,
          pluginVersions
        );
      }
    }
  );
}
