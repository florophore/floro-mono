import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../../ResolverHook";
import RequestCache from "../../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../../services/repositories/RepositoryService";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";

@injectable()
export default class RootRepositoryLoader extends LoaderResolverHook<
  any,
  { repositoryId: string },
  { cacheKey: string; currentUser?: User|null|undefined }
> {
  protected requestCache!: RequestCache;
  protected repositoryService!: RepositoryService;
  protected contextFactory!: ContextFactory;
  //protected branches: Array<FloroBranch>

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    super();
    this.requestCache = requestCache;
    this.repositoryService = repositoryService;
    this.contextFactory = contextFactory;
  }

  public run = runWithHooks<
    any,
    { repositoryId: string },
    { cacheKey: string, currentUser?: User|null|undefined },
    void
  >(
    () => [],
    async (object, args, { cacheKey, currentUser }): Promise<void> => {
      const repoId = args.repositoryId ?? object?.["repositoryId"];
      if (!repoId) {
        return;
      }
      const cachedRepo = this.requestCache.getRepo(cacheKey, repoId);
      if (cachedRepo) {
        return;
      }
      const repo = await this.repositoryService.getRepository(repoId);
      if (repo) {
        if (repo.repoType == "user_repo" && repo.isPrivate) {
          if (repo.userId != currentUser?.id) {
            return;
          }
        }
        if (repo.repoType == "org_repo" && repo.isPrivate) {
          if (!currentUser?.id) {
            return;
          }
          const organizationsMembersContext =
            await this.contextFactory.createContext(OrganizationMembersContext);
          const membership =
            await organizationsMembersContext.getByOrgIdAndUserId(
              repo.organizationId,
              currentUser?.id
            );

          if (membership?.membershipState != "active") {
            return;
          }

          if (!repo.anyoneCanRead) {
            const organizationMemberRolesContext =
              await this.contextFactory.createContext(
                OrganizationMemberRolesContext
              );
            const memberRoles =
              await organizationMemberRolesContext.getRolesByMember(membership);
            const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
            if (!isAdmin) {
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
                  currentUser.id,
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
                  return;
                }
              }
            }
          }
        }
        this.requestCache.setRepo(cacheKey, repo);
      }
    }
  );
}
