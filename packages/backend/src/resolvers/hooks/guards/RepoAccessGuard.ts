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

@injectable()
export default class RepoAccessGuard extends GuardResolverHook<
  unknown,
  { repositoryId: string },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError | RepoAccessError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repositoryLoader!: RootRepositoryLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootRepositoryLoader) repositoryLoader: RootRepositoryLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.repositoryLoader = repositoryLoader;
  }

  public run = runWithHooks(
    () => [this.loggedInUserGuard, this.repositoryLoader],
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
          __typename: "RepoAccessError",
          type: "REPO_ACCESS_ERROR",
          message: "Repo access error",
        };
      }
      const repo = this.requestCache.getRepo(
        context.cacheKey,
        args.repositoryId
      );
      if (!repo) {
        return {
          __typename: "RepoAccessError",
          type: "REPO_ACCESS_ERROR",
          message: "Repo access error",
        };
      }
      if (repo.repoType == "user_repo") {
        if (repo.isPrivate && context.currentUser?.id != repo.userId) {
          return {
            __typename: "RepoAccessError",
            type: "REPO_ACCESS_ERROR",
            message: "Repo access error",
          };
        }
      }
      if (repo.repoType == "org_repo" && repo.isPrivate) {
        const organizationsMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const membership =
          await organizationsMembersContext.getByOrgIdAndUserId(
            repo.organizationId,
            context.currentUser.id
          );

        if (membership?.membershipState != "active") {
          return {
            __typename: "RepoAccessError",
            type: "REPO_ACCESS_ERROR",
            message: "Repo access error",
          };
        }

        if (!repo.anyoneCanRead) {
          const organizationMemberRolesContext =
            await this.contextFactory.createContext(
              OrganizationMemberRolesContext
            );
          const memberRoles =
            await organizationMemberRolesContext.getRolesByMember(membership);
          const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
          if (isAdmin) {
            return {
              __typename: "FetchRepositorySuccess",
              repo,
            };
          }
          const roleIds = memberRoles?.map((r) => r.id);
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );

          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const hasUserPermission =
            await repositoryEnabledUserSettingsContext.hasRepoUserId(
              repo.id,
              context.currentUser.id,
              "anyoneCanRead"
            );
          if (!hasUserPermission) {
            const hasRoles =
              await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                repo.id,
                roleIds,
                "anyoneCanRead"
              );
            if (!hasRoles) {
              return {
                __typename: "FetchRepositoryError",
                type: "REPO_ERROR",
                message: "Repo error",
              };
            }
          }
        }
      }
      return null;
    }
  );
}
