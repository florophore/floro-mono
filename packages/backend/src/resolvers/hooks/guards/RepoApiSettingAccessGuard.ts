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
import RootRepositoryRemoteSettingsLoader from "../loaders/Root/RepositoryID/RootRepositoryRemoteSettingsLoader";
import RepoSettingAccessGuard from "./RepoSettingAccessGuard";
import OrganizationPermissionService from "../../../services/organizations/OrganizationPermissionService";

@injectable()
export default class RepoApiSettingAccessGuard extends GuardResolverHook<
  unknown,
  { repositoryId: string },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError | RepoAccessError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repositoryLoader!: RootRepositoryLoader;
  protected organizationPermissionsService!: OrganizationPermissionService;

  protected rootRepositoryRemoteSettingsLoader!: RootRepositoryRemoteSettingsLoader;
  protected repoSettingAccessGuard!: RepoSettingAccessGuard;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootRepositoryLoader) repositoryLoader: RootRepositoryLoader,
    @inject(RootRepositoryRemoteSettingsLoader)
    rootRepositoryRemoteSettingsLoader: RootRepositoryRemoteSettingsLoader,
    @inject(RepoSettingAccessGuard)
    repoSettingAccessGuard: RepoSettingAccessGuard,
    @inject(OrganizationPermissionService)
    organizationPermissionsService: OrganizationPermissionService
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.repositoryLoader = repositoryLoader;
    this.rootRepositoryRemoteSettingsLoader =
      rootRepositoryRemoteSettingsLoader;
    this.repoSettingAccessGuard = repoSettingAccessGuard;
    this.organizationPermissionsService = organizationPermissionsService;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.repositoryLoader,
      this.rootRepositoryRemoteSettingsLoader,
      this.repoSettingAccessGuard,
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
      if (repo.repoType == "user_repo") {
        if (context.currentUser.id != repo.userId) {
          return {
            __typename: "RepoSettingAccessError",
            type: "REPO_SETTING_ACCESS_ERROR",
            message: "Repo Setting access error",
          };
        }
      }
      if (repo.repoType == "org_repo") {
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const member = await organizationMembersContext.getByOrgIdAndUserId(
          repo?.organizationId as string,
          context.currentUser.id
        );
        if (member?.membershipState != "active") {
          return {
            __typename: "RepoSettingAccessError",
            type: "REPO_SETTING_ACCESS_ERROR",
            message: "Repo Setting access error",
          };
        }
        const organizationMemberRolesContext =
          await this.contextFactory.createContext(
            OrganizationMemberRolesContext
          );
        const memberRoles =
          await organizationMemberRolesContext.getRolesByMember(member);
        const permissions =
          this.organizationPermissionsService.calculatePermissions(memberRoles);
        if (!permissions.canModifyOrganizationDeveloperSettings) {
          return {
            __typename: "RepoSettingAccessError",
            type: "REPO_SETTING_ACCESS_ERROR",
            message: "Repo Setting access error",
          };
        }
      }
      return null;
    }
  );
}
