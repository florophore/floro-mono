import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { GuardResolverHook, runWithHooks } from "../ResolverHook";
import {
  UnAuthenticatedError,
  RepoAccessError,
} from "@floro/graphql-schemas/src/generated/main-graphql";
import RequestCache from "../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import LoggedInUserGuard from "./LoggedInUserGuard";
import RootRepositoryLoader from "../loaders/Root/RepositoryID/RepositoryLoader";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import RootRepositoryRemoteSettingsLoader from "../loaders/Root/RepositoryID/RootRepositoryRemoteSettingsLoader";

@injectable()
export default class RepoSettingAccessGuard extends GuardResolverHook<
  unknown,
  { repositoryId: string },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError | RepoAccessError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repositoryLoader!: RootRepositoryLoader;
  protected rootRepositoryRemoteSettingsLoader!: RootRepositoryRemoteSettingsLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootRepositoryLoader) repositoryLoader: RootRepositoryLoader,
    @inject(RootRepositoryRemoteSettingsLoader)
    rootRepositoryRemoteSettingsLoader: RootRepositoryRemoteSettingsLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.repositoryLoader = repositoryLoader;
    this.rootRepositoryRemoteSettingsLoader =
      rootRepositoryRemoteSettingsLoader;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.repositoryLoader,
      this.rootRepositoryRemoteSettingsLoader,
    ],
    async (_, args: { repositoryId: string }, context) => {
      if (!context.currentUser) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      if (!args.repositoryId) {
        return {
          __typename: "RepoSettingAccessError",
          type: "REPO_SETTING_ACCESS_ERROR",
          message: "Repo Setting access error",
        };
      }
      const repo = this.requestCache.getRepo(
        context.cacheKey,
        args.repositoryId
      );
      if (!repo) {
        return {
          __typename: "RepoSettingAccessError",
          type: "REPO_SETTING_ACCESS_ERROR",
          message: "Repo Setting access error",
        };
      }
      const remoteSettings = this.requestCache.getRepoRemoteSettings(
        context.cacheKey,
        args.repositoryId
      );
      if (!remoteSettings) {
        return {
          __typename: "RepoSettingAccessError",
          type: "REPO_SETTING_ACCESS_ERROR",
          message: "Repo Setting access error",
        };
      }
      if (!remoteSettings?.canChangeSettings) {
        return {
          __typename: "RepoSettingAccessError",
          type: "REPO_SETTING_ACCESS_ERROR",
          message: "Repo Setting access error",
        };
      }
      return null;
    }
  );
}
